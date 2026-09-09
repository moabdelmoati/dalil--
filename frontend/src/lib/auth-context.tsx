import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  signInWithPopup,
  googleProvider,
  appleProvider,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  type FirebaseUser,
} from './firebase';

export type UserRole = 'lawyer' | 'company' | 'user';

export type VerificationData = {
  license_number?: string;
  lawyer_tier?: string;
  commercial_reg_number?: string;
  tax_number?: string;
  proof_file_name?: string;
};

export interface UserProfile {
  id: string;
  email: string | null;
  role: UserRole | null;
  full_name: string | null;
  avatar_url?: string | null;
  created_at?: string;
  verification_status?: 'pending' | 'verified' | 'unverified';
  license_number?: string;
  lawyer_tier?: string;
  commercial_reg_number?: string;
  tax_number?: string;
  proof_file_name?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  needsRoleSelection: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    verificationData?: VerificationData
  ) => Promise<{ error: any; user: FirebaseUser | null }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateRole: (role: UserRole, verificationData?: VerificationData) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dalil_firebase_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create profile in Firestore / LocalStorage
  const fetchProfile = async (uid: string, userEmail?: string | null, userMetadata?: any) => {
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
        return;
      }
    } catch {
      // Ignored for offline/demo mode
    }

    // Check local storage profile fallback
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profile) {
          setProfile(parsed.profile);
          return;
        }
      } catch {}
    }

    const newProfile: UserProfile = {
      id: uid,
      email: userEmail || null,
      role: userMetadata?.role || null,
      full_name: userMetadata?.full_name || userMetadata?.displayName || (userEmail ? userEmail.split('@')[0] : 'مستخدم'),
      avatar_url: userMetadata?.photoURL || null,
    };
    setProfile(newProfile);
  };

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setSession({ uid: firebaseUser.uid, email: firebaseUser.email });
        await fetchProfile(firebaseUser.uid, firebaseUser.email, {
          full_name: firebaseUser.displayName,
          avatar_url: firebaseUser.photoURL,
        });
      } else {
        // Fallback to local storage user if offline demo session exists
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.user) {
              setUser(parsed.user as FirebaseUser);
              setSession({ uid: parsed.user.uid, email: parsed.user.email });
              setProfile(parsed.profile || null);
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      setUser(firebaseUser);
      setSession({ uid: firebaseUser.uid, email: firebaseUser.email });
      await fetchProfile(firebaseUser.uid, firebaseUser.email);
      return { error: null };
    } catch (err: any) {
      // Offline / Demo Fallback
      if (
        err?.code === 'auth/invalid-api-key' ||
        err?.code === 'auth/network-request-failed' ||
        err?.message?.includes('API key') ||
        err?.message?.includes('fetch')
      ) {
        const localId = 'fb_local_' + Math.random().toString(36).substring(2, 9);
        const localUser = {
          uid: localId,
          email,
          displayName: email.split('@')[0],
        } as unknown as FirebaseUser;
        const localProfile: UserProfile = {
          id: localId,
          email,
          role: 'user',
          full_name: email.split('@')[0],
          created_at: new Date().toISOString(),
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: localUser, profile: localProfile }));
        setUser(localUser);
        setSession({ uid: localId, email });
        setProfile(localProfile);
        return { error: null };
      }
      return { error: err };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole,
    verificationData?: VerificationData
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newProfile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        role: role || 'user',
        full_name: fullName,
        created_at: new Date().toISOString(),
        verification_status: role === 'lawyer' || role === 'company' ? 'verified' : 'unverified',
        ...(verificationData || {}),
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
      } catch {}

      setUser(firebaseUser);
      setSession({ uid: firebaseUser.uid, email: firebaseUser.email });
      setProfile(newProfile);
      return { error: null, user: firebaseUser };
    } catch (err: any) {
      // Robust Local / Offline Fallback if Firebase API Key is placeholder or offline
      if (
        err?.code === 'auth/invalid-api-key' ||
        err?.code === 'auth/network-request-failed' ||
        err?.message?.includes('API key') ||
        err?.message?.includes('fetch')
      ) {
        const localId = 'fb_local_' + Math.random().toString(36).substring(2, 9);
        const localUser = {
          uid: localId,
          email,
          displayName: fullName,
        } as unknown as FirebaseUser;
        const localProfile: UserProfile = {
          id: localId,
          email,
          role: role || 'user',
          full_name: fullName,
          created_at: new Date().toISOString(),
          verification_status: role === 'lawyer' || role === 'company' ? 'verified' : 'unverified',
          ...(verificationData || {}),
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: localUser, profile: localProfile }));
        setUser(localUser);
        setSession({ uid: localId, email });
        setProfile(localProfile);
        return { error: null, user: localUser };
      }
      return { error: err, user: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      setUser(firebaseUser);
      setSession({ uid: firebaseUser.uid, email: firebaseUser.email });
      await fetchProfile(firebaseUser.uid, firebaseUser.email, {
        full_name: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL,
      });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const firebaseUser = result.user;
      setUser(firebaseUser);
      setSession({ uid: firebaseUser.uid, email: firebaseUser.email });
      await fetchProfile(firebaseUser.uid, firebaseUser.email, {
        full_name: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL,
      });
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error: null };
  };

  const updateRole = async (role: UserRole, verificationData?: VerificationData) => {
    if (!user) return { error: new Error('User not authenticated') };

    const updatedProfile: UserProfile = {
      ...(profile || { id: user.uid, email: user.email }),
      role,
      full_name: profile?.full_name || user.displayName || user.email?.split('@')[0] || null,
      verification_status: role === 'lawyer' || role === 'company' ? 'verified' : 'unverified',
      ...(verificationData || {}),
    };

    setProfile(updatedProfile);

    // Save in Firestore
    try {
      await setDoc(doc(db, 'profiles', user.uid), updatedProfile, { merge: true });
    } catch {}

    // Save in LocalStorage
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.profile = updatedProfile;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    }

    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user.email, { displayName: user.displayName });
    }
  };

  const needsRoleSelection = !!user && !profile?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        needsRoleSelection,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        updateRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
