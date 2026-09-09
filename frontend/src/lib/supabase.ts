import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if the configured URL is non-existent, dummy, or offline
const isOfflineOrDummy =
  !supabaseUrl ||
  supabaseUrl.includes('puuwkzbfvmbzcsmkjbws') ||
  supabaseUrl.includes('placeholder') ||
  supabaseUrl === 'YOUR_SUPABASE_URL_HERE';

// Memory/localStorage-based mock Supabase client for seamless offline development
function createOfflineSupabaseClient() {
  const listeners: Array<(event: string, session: any) => void> = [];

  const getLocalSession = () => {
    try {
      const data = localStorage.getItem('dalil_local_session');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const setLocalSession = (session: any) => {
    if (session) {
      localStorage.setItem('dalil_local_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('dalil_local_session');
    }
    listeners.forEach((cb) => {
      try {
        cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      } catch {}
    });
  };

  return {
    auth: {
      async getSession() {
        const session = getLocalSession();
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        listeners.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(callback);
                if (idx > -1) listeners.splice(idx, 1);
              },
            },
          },
        };
      },
      async signUp({ email, password, options }: any) {
        const userId = 'user_' + Math.random().toString(36).substring(2, 9);
        const user = {
          id: userId,
          email,
          user_metadata: options?.data || { role: 'user' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = {
          access_token: 'local_token_' + Date.now(),
          token_type: 'bearer',
          user,
        };

        // Save profile in mock profiles table
        const profile = {
          id: userId,
          email,
          role: options?.data?.role || 'user',
          full_name: options?.data?.full_name || email.split('@')[0],
          created_at: new Date().toISOString(),
        };
        try {
          const profiles = JSON.parse(localStorage.getItem('dalil_table_profiles') || '[]');
          profiles.push(profile);
          localStorage.setItem('dalil_table_profiles', JSON.stringify(profiles));
        } catch {}

        setLocalSession(session);
        return { data: { user, session }, error: null };
      },
      async signInWithPassword({ email }: any) {
        // Look up profile if exists
        let userRole = 'user';
        let fullName = email.split('@')[0];
        try {
          const profiles = JSON.parse(localStorage.getItem('dalil_table_profiles') || '[]');
          const found = profiles.find((p: any) => p.email?.toLowerCase() === email?.toLowerCase());
          if (found) {
            userRole = found.role || 'user';
            fullName = found.full_name || fullName;
          }
        } catch {}

        const userId = 'user_' + Math.random().toString(36).substring(2, 9);
        const user = {
          id: userId,
          email,
          user_metadata: { role: userRole, full_name: fullName },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = {
          access_token: 'local_token_' + Date.now(),
          token_type: 'bearer',
          user,
        };

        setLocalSession(session);
        return { data: { user, session }, error: null };
      },
      async signInWithOAuth({ provider }: any) {
        const userId = 'oauth_' + provider;
        const user = {
          id: userId,
          email: `${provider}_user@dalil.app`,
          user_metadata: { role: 'user', full_name: provider === 'google' ? 'مستخدم جوجل' : 'مستخدم آبل' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        const session = {
          access_token: 'oauth_token_' + Date.now(),
          user,
        };
        setLocalSession(session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        setLocalSession(null);
        return { error: null };
      },
    },
    from(tableName: string) {
      const storageKey = `dalil_table_${tableName}`;
      const getTableData = (): any[] => {
        try {
          return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch {
          return [];
        }
      };
      const setTableData = (data: any[]) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch {}
      };

      let filterFn = (_row: any) => true;

      const queryBuilder = {
        select(_cols?: string) {
          return queryBuilder;
        },
        eq(col: string, val: any) {
          const prev = filterFn;
          filterFn = (row: any) => prev(row) && row[col] === val;
          return queryBuilder;
        },
        async insert(rows: any | any[]) {
          const items = Array.isArray(rows) ? rows : [rows];
          const current = getTableData();
          const next = [...current, ...items];
          setTableData(next);
          return { data: items, error: null };
        },
        async upsert(row: any) {
          const current = getTableData();
          const idx = current.findIndex((r: any) => r.id === row.id || (row.email && r.email === row.email));
          if (idx > -1) {
            current[idx] = { ...current[idx], ...row };
          } else {
            current.push(row);
          }
          setTableData(current);
          return { data: row, error: null, select: () => queryBuilder, single: async () => ({ data: row, error: null }) };
        },
        async single() {
          const current = getTableData().filter(filterFn);
          return { data: current[0] || null, error: current[0] ? null : { code: 'PGRST116' } };
        },
        async maybeSingle() {
          const current = getTableData().filter(filterFn);
          return { data: current[0] || null, error: null };
        },
        then(resolve: any) {
          const data = getTableData().filter(filterFn);
          return Promise.resolve({ data, error: null }).then(resolve);
        },
      };

      return queryBuilder;
    },
  };
}

export const supabase: any = isOfflineOrDummy
  ? createOfflineSupabaseClient()
  : createClient(supabaseUrl, supabaseAnonKey);
