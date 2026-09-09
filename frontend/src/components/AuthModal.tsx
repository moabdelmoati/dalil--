import React, { useState } from 'react';
import { useAuth, type UserRole, type VerificationData } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import {
  X, LockKeyhole, Mail, User, AlertCircle, Loader2, CheckCircle2,
  BriefcaseBusiness, Building2, UserRound, Sparkles, ShieldCheck,
  FileText, UploadCloud, Check
} from 'lucide-react';

export function GoogleIcon() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg className="size-5 shrink-0 fill-current" viewBox="0 0 24 24">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.57.66-.99 1.72-.85 2.74 1 .08 1.95-.49 2.57-1.24z" />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const { lang, dir } = useLanguage();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  // Lawyer verification fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [lawyerTier, setLawyerTier] = useState('ابتدائي');
  
  // Company verification fields
  const [commercialReg, setCommercialReg] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Proof document upload
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState<'google' | 'apple' | null>(null);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setError(null);
    setLoadingOAuth('google');
    const { error } = await signInWithGoogle();
    if (error) {
      if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('popup-closed-by-user')) {
        setError(lang === 'ar' ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.' : 'Sign-in window was closed.');
      } else {
        setError(error.message || (lang === 'ar' ? 'فشل تسجيل الدخول باستخدام Google' : 'Google sign-in failed'));
      }
      setLoadingOAuth(null);
    } else {
      setLoadingOAuth(null);
      onClose();
    }
  };

  const handleApple = async () => {
    setError(null);
    setLoadingOAuth('apple');
    const { error } = await signInWithApple();
    if (error) {
      if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('popup-closed-by-user')) {
        setError(lang === 'ar' ? 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.' : 'Sign-in window was closed.');
      } else {
        setError(error.message || (lang === 'ar' ? 'فشل تسجيل الدخول باستخدام Apple' : 'Apple sign-in failed'));
      }
      setLoadingOAuth(null);
    } else {
      setLoadingOAuth(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials' 
            ? (lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
            : error.message);
        } else {
          onClose();
        }
      } else {
        if (!fullName.trim()) {
          setError(lang === 'ar' ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
          setIsLoading(false);
          return;
        }

        // Lawyer verification validation
        if (role === 'lawyer' && !licenseNumber.trim()) {
          setError(lang === 'ar' ? 'يرجى إدخال رقم القيد بنقابة المحامين' : 'Please enter your Bar Registration Number');
          setIsLoading(false);
          return;
        }

        // Company verification validation
        if (role === 'company' && (!commercialReg.trim() || !taxNumber.trim())) {
          setError(lang === 'ar' ? 'يرجى إدخال رقم السجل التجاري والرقم الضريبي' : 'Please enter Commercial Registry & Tax ID numbers');
          setIsLoading(false);
          return;
        }

        const verificationData: VerificationData = {
          license_number: licenseNumber.trim() || undefined,
          lawyer_tier: role === 'lawyer' ? lawyerTier : undefined,
          commercial_reg_number: commercialReg.trim() || undefined,
          tax_number: taxNumber.trim() || undefined,
          proof_file_name: proofFileName || undefined,
        };

        const { error } = await signUpWithEmail(email, password, fullName, role, verificationData);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage(
            lang === 'ar' 
              ? 'تم إنشاء الحساب وتوثيق البيانات بنجاح! جاري الدخول...' 
              : 'Account created and verified successfully! Logging in...'
          );
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole: UserRole) => {
    setError(null);
    setIsLoading(true);
    const demoEmail = `demo.${demoRole}@dalil.app`;
    const demoPassword = 'password123';
    const demoName = demoRole === 'lawyer' ? 'أ. أحمد المستشار' : (demoRole === 'company' ? 'شركة الأفق للاستثمار' : 'محمد علي');

    const { error: signInErr } = await signInWithEmail(demoEmail, demoPassword);
    if (signInErr) {
      await signUpWithEmail(demoEmail, demoPassword, demoName, demoRole);
    }
    setIsLoading(false);
    onClose();
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-2xl sm:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-xl p-2 text-[#796c63] hover:bg-[#ede3d5] hover:text-[#3b241a] transition"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#3b241a] text-[#f7f2ea]">
            <LockKeyhole size={22} />
          </span>
          <h2 className="mt-3.5 font-display text-2xl font-bold text-[#3b241a]">
            {mode === 'signin' 
              ? (lang === 'ar' ? 'تسجيل الدخول إلى دليل' : 'Sign in to Dalil')
              : (lang === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account')}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#796c63]">
            {mode === 'signin'
              ? (lang === 'ar' ? 'مرحباً بك! اختر وسيلة تسجيل الدخول المناسبة لك' : 'Welcome! Choose your preferred sign-in method')
              : (lang === 'ar' ? 'انضم إلى منصة دليل القانونية الذكية' : 'Join Dalil intelligent legal platform')}
          </p>
        </div>

        {/* OAuth Buttons (Google & Apple) */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading || !!loadingOAuth}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs font-bold text-[#3b241a] shadow-sm transition hover:border-[#a36c42] hover:bg-[#fdf7ef] disabled:opacity-50"
          >
            {loadingOAuth === 'google' ? (
              <Loader2 className="size-4 animate-spin text-[#3b241a]" />
            ) : (
              <GoogleIcon />
            )}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleApple}
            disabled={isLoading || !!loadingOAuth}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#111] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            {loadingOAuth === 'apple' ? (
              <Loader2 className="size-4 animate-spin text-white" />
            ) : (
              <AppleIcon />
            )}
            <span>Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5d9ca]" />
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-[#fffdf9] px-3 font-semibold text-[#8c694a]">
              {lang === 'ar' ? 'أو بالبريد الإلكتروني' : 'Or with email'}
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-[#ede3d5] p-1">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              mode === 'signin' ? 'bg-[#fffdf9] text-[#3b241a] shadow-sm' : 'text-[#796c63] hover:text-[#3b241a]'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
              mode === 'signup' ? 'bg-[#fffdf9] text-[#3b241a] shadow-sm' : 'text-[#796c63] hover:text-[#3b241a]'
            }`}
          >
            {lang === 'ar' ? 'حساب جديد' : 'Sign Up'}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#3b241a] mb-1">
                {lang === 'ar' ? 'الاسم الكامل أو اسم المنشأة' : 'Full Name / Entity Name'}
              </label>
              <div className="relative">
                <User size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: محمد أحمد' : 'e.g. John Doe'}
                  className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-9 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#3b241a] mb-1">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-9 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#3b241a] mb-1">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <LockKeyhole size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-9 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#3b241a] mb-1">
                  {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'user' as UserRole, label: lang === 'ar' ? 'مستخدم' : 'User', icon: UserRound },
                    { id: 'lawyer' as UserRole, label: lang === 'ar' ? 'محامي' : 'Lawyer', icon: BriefcaseBusiness },
                    { id: 'company' as UserRole, label: lang === 'ar' ? 'شركة' : 'Company', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = role === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setRole(item.id)}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-bold transition ${
                          isSelected
                            ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9]'
                            : 'border-[#ddcdbb] bg-[#fffdf9] text-[#6b4632] hover:bg-[#faf6ef]'
                        }`}
                      >
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Verification Fields for Lawyer */}
              {role === 'lawyer' && (
                <div className="rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-3.5 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8c694a]">
                    <ShieldCheck size={16} className="text-[#a36c42]" />
                    <span>{lang === 'ar' ? 'بيانات التوثيق المهني (نقابة المحامين)' : 'Professional Lawyer Verification'}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                      {lang === 'ar' ? 'رقم القيد بالنقابة *' : 'Bar Registration Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: 584920' : 'e.g. 584920'}
                      className="h-9 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                      {lang === 'ar' ? 'درجة القيد *' : 'Registration Degree *'}
                    </label>
                    <select
                      value={lawyerTier}
                      onChange={(e) => setLawyerTier(e.target.value)}
                      className="h-9 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-2 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                    >
                      <option value="جدول عام">{lang === 'ar' ? 'محامٍ جدول عام' : 'General Bar Lawyer'}</option>
                      <option value="ابتدائي">{lang === 'ar' ? 'محامٍ أمام المحاكم الابتدائية' : 'Primary Courts Lawyer'}</option>
                      <option value="استئناف">{lang === 'ar' ? 'محامٍ بالاستئناف العالي ومجلس الدولة' : 'High Appeal & State Council'}</option>
                      <option value="نقض">{lang === 'ar' ? 'محامٍ بالنقض والدستورية العليا' : 'Cassation & Supreme Court'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                      {lang === 'ar' ? 'إثبات الهوية المهنية (كارنيه النقابة / رخصة المزاولة)' : 'Proof of Identity (Bar ID / License)'}
                    </label>
                    <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#c5aa8c] bg-[#fffdf9] px-3 text-xs text-[#796c63] hover:border-[#a36c42] hover:bg-[#faf4ec] transition">
                      <span className="flex items-center gap-1.5 truncate">
                        {proofFileName ? (
                          <>
                            <Check size={14} className="text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-[#3b241a]">{proofFileName}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} className="text-[#a36c42] shrink-0" />
                            <span className="text-[11px]">{lang === 'ar' ? 'اختر ملفاً (PDF أو صورة)' : 'Upload document (PDF / Image)'}</span>
                          </>
                        )}
                      </span>
                      <span className="rounded-lg bg-[#ede3d5] px-2 py-0.5 text-[10px] font-bold text-[#6b4632]">
                        {proofFileName ? (lang === 'ar' ? 'تم الرفع' : 'Uploaded') : (lang === 'ar' ? 'تصفح' : 'Browse')}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setProofFileName(f.name);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Dynamic Verification Fields for Company */}
              {role === 'company' && (
                <div className="rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-3.5 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8c694a]">
                    <ShieldCheck size={16} className="text-[#a36c42]" />
                    <span>{lang === 'ar' ? 'بيانات توثيق الكيان التجاري' : 'Company / Entity Verification'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                        {lang === 'ar' ? 'رقم السجل التجاري *' : 'Commercial Reg. No. *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={commercialReg}
                        onChange={(e) => setCommercialReg(e.target.value)}
                        placeholder="104928"
                        className="h-9 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                        {lang === 'ar' ? 'الرقم الضريبي *' : 'Tax ID Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="940-182-301"
                        className="h-9 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5e5048] mb-0.5">
                      {lang === 'ar' ? 'مستخرج السجل التجاري / البطاقة الضريبية' : 'CR / Tax Card Document'}
                    </label>
                    <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#c5aa8c] bg-[#fffdf9] px-3 text-xs text-[#796c63] hover:border-[#a36c42] hover:bg-[#faf4ec] transition">
                      <span className="flex items-center gap-1.5 truncate">
                        {proofFileName ? (
                          <>
                            <Check size={14} className="text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-[#3b241a]">{proofFileName}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={14} className="text-[#a36c42] shrink-0" />
                            <span className="text-[11px]">{lang === 'ar' ? 'اختر ملفاً (PDF أو صورة)' : 'Upload document (PDF / Image)'}</span>
                          </>
                        )}
                      </span>
                      <span className="rounded-lg bg-[#ede3d5] px-2 py-0.5 text-[10px] font-bold text-[#6b4632]">
                        {proofFileName ? (lang === 'ar' ? 'تم الرفع' : 'Uploaded') : (lang === 'ar' ? 'تصفح' : 'Browse')}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setProofFileName(f.name);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!loadingOAuth}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#3b241a] text-xs font-bold text-[#fffdf9] shadow-sm transition hover:bg-[#533426] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin text-[#fffdf9]" />
            ) : mode === 'signin' ? (
              lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'
            ) : (
              lang === 'ar' ? 'إنشاء الحساب' : 'Create Account'
            )}
          </button>
        </form>

        {/* Demo Fast Login for development */}
        <div className="mt-5 border-t border-[#eee5da] pt-3.5 text-center">
          <span className="block text-[11px] font-bold text-[#8c694a]">
            {lang === 'ar' ? '⚡ تجربة سريعة للتطوير (دخول بنقرة واحدة):' : '⚡ Quick Demo Login:'}
          </span>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2 py-1 text-[10px] font-bold text-[#6b4632] hover:bg-[#dfd3c3]"
            >
              <UserRound size={11} />
              <span>{lang === 'ar' ? 'مستخدم' : 'User'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('lawyer')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2 py-1 text-[10px] font-bold text-[#6b4632] hover:bg-[#dfd3c3]"
            >
              <BriefcaseBusiness size={11} />
              <span>{lang === 'ar' ? 'محامي' : 'Lawyer'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('company')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2 py-1 text-[10px] font-bold text-[#6b4632] hover:bg-[#dfd3c3]"
            >
              <Building2 size={11} />
              <span>{lang === 'ar' ? 'شركة' : 'Company'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
