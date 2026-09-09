import React, { useState } from 'react';
import { useAuth, type UserRole, type VerificationData } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import {
  LockKeyhole, Mail, User, AlertCircle, Loader2, CheckCircle2,
  ShieldCheck, BriefcaseBusiness, Building2, UserRound,
  FileText, UploadCloud, Check
} from 'lucide-react';
import { GoogleIcon, AppleIcon } from '@/components/AuthModal';
import { Link, useLocation } from 'wouter';

export function LoginPage() {
  const { user, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithApple } = useAuth();
  const { lang, dir } = useLanguage();
  const [, setLocation] = useLocation();

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

  if (user && profile?.role) {
    setLocation('/dashboard');
    return null;
  }

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
          setLocation('/dashboard');
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

        const { error, user } = await signUpWithEmail(email, password, fullName, role, verificationData);
        if (error) {
          setError(error.message);
        } else {
          setSuccessMessage(
            lang === 'ar' 
              ? 'تم إنشاء الحساب وتوثيق البيانات بنجاح! جاري تحويلك...' 
              : 'Account created and verified successfully! Redirecting...'
          );
          setTimeout(() => {
            setLocation('/dashboard');
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
    setLocation('/dashboard');
  };

  return (
    <div dir={dir} className="mx-auto flex min-h-[85vh] max-w-7xl items-center justify-center px-5 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[#ddcdbb] bg-[#fffdf9] p-7 shadow-xl sm:p-9">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#3b241a] text-[#f7f2ea] shadow-sm">
              <span className="font-display text-2xl font-bold">د</span>
            </span>
          </Link>

          <h1 className="mt-4 font-display text-2xl font-bold text-[#3b241a] sm:text-3xl">
            {mode === 'signin' 
              ? (lang === 'ar' ? 'تسجيل الدخول إلى دليل' : 'Sign in to Dalil')
              : (lang === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account')}
          </h1>
          <p className="mt-1.5 text-xs leading-5 text-[#796c63]">
            {mode === 'signin'
              ? (lang === 'ar' ? 'مرحباً بك مجدداً! اختر وسيلة تسجيل الدخول المناسبة' : 'Welcome back! Choose your preferred sign-in method')
              : (lang === 'ar' ? 'سجل بياناتك للبدء في الاستفادة من المنصة الذكية' : 'Enter your details to get started')}
          </p>
        </div>

        {/* OAuth Buttons (Google & Apple) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading || !!loadingOAuth}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] px-3 font-bold text-xs text-[#3b241a] shadow-sm transition hover:border-[#a36c42] hover:bg-[#fdf7ef] disabled:opacity-50"
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
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#111] px-3 font-bold text-xs text-white shadow-sm transition hover:bg-black disabled:opacity-50"
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
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5d9ca]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#fffdf9] px-3 font-semibold text-[#8c694a]">
              {lang === 'ar' ? 'أو بالبريد الإلكتروني' : 'Or with email'}
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-[#ede3d5] p-1">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === 'signin' ? 'bg-[#fffdf9] text-[#3b241a] shadow-sm' : 'text-[#796c63] hover:text-[#3b241a]'
            }`}
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mode === 'signup' ? 'bg-[#fffdf9] text-[#3b241a] shadow-sm' : 'text-[#796c63] hover:text-[#3b241a]'
            }`}
          >
            {lang === 'ar' ? 'حساب جديد' : 'Sign Up'}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#3b241a] mb-1">
                {lang === 'ar' ? 'الاسم الكامل أو اسم المنشأة' : 'Full Name / Entity Name'}
              </label>
              <div className="relative">
                <User size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: محمد أحمد' : 'e.g. John Doe'}
                  className="h-11 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-10 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#3b241a] mb-1">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-10 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3b241a] mb-1">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a7907d]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] pr-10 pl-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#3b241a] mb-1.5">
                  {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
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
                        className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                          isSelected
                            ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9]'
                            : 'border-[#ddcdbb] bg-[#fffdf9] text-[#6b4632] hover:bg-[#faf6ef]'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Verification Fields for Lawyer */}
              {role === 'lawyer' && (
                <div className="rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8c694a]">
                    <ShieldCheck size={18} className="text-[#a36c42]" />
                    <span>{lang === 'ar' ? 'بيانات التوثيق المهني (نقابة المحامين)' : 'Professional Lawyer Verification'}</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                      {lang === 'ar' ? 'رقم القيد بالنقابة *' : 'Bar Registration Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: 584920' : 'e.g. 584920'}
                      className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                      {lang === 'ar' ? 'درجة القيد *' : 'Registration Degree *'}
                    </label>
                    <select
                      value={lawyerTier}
                      onChange={(e) => setLawyerTier(e.target.value)}
                      className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                    >
                      <option value="جدول عام">{lang === 'ar' ? 'محامٍ جدول عام' : 'General Bar Lawyer'}</option>
                      <option value="ابتدائي">{lang === 'ar' ? 'محامٍ أمام المحاكم الابتدائية' : 'Primary Courts Lawyer'}</option>
                      <option value="استئناف">{lang === 'ar' ? 'محامٍ بالاستئناف العالي ومجلس الدولة' : 'High Appeal & State Council'}</option>
                      <option value="نقض">{lang === 'ar' ? 'محامٍ بالنقض والدستورية العليا' : 'Cassation & Supreme Court'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                      {lang === 'ar' ? 'إثبات الهوية المهنية (كارنيه النقابة / رخصة المزاولة)' : 'Proof of Identity (Bar ID / License)'}
                    </label>
                    <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#c5aa8c] bg-[#fffdf9] px-3.5 text-xs text-[#796c63] hover:border-[#a36c42] hover:bg-[#faf4ec] transition">
                      <span className="flex items-center gap-2 truncate">
                        {proofFileName ? (
                          <>
                            <Check size={16} className="text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-[#3b241a]">{proofFileName}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={16} className="text-[#a36c42] shrink-0" />
                            <span className="text-xs">{lang === 'ar' ? 'اختر ملفاً (PDF أو صورة)' : 'Upload document (PDF / Image)'}</span>
                          </>
                        )}
                      </span>
                      <span className="rounded-lg bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#6b4632]">
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
                <div className="rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-4 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8c694a]">
                    <ShieldCheck size={18} className="text-[#a36c42]" />
                    <span>{lang === 'ar' ? 'بيانات توثيق الكيان التجاري' : 'Company / Entity Verification'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                        {lang === 'ar' ? 'رقم السجل التجاري *' : 'Commercial Reg. No. *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={commercialReg}
                        onChange={(e) => setCommercialReg(e.target.value)}
                        placeholder="104928"
                        className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                        {lang === 'ar' ? 'الرقم الضريبي *' : 'Tax ID Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="940-182-301"
                        className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5e5048] mb-1">
                      {lang === 'ar' ? 'مستخرج السجل التجاري / البطاقة الضريبية' : 'CR / Tax Card Document'}
                    </label>
                    <label className="flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#c5aa8c] bg-[#fffdf9] px-3.5 text-xs text-[#796c63] hover:border-[#a36c42] hover:bg-[#faf4ec] transition">
                      <span className="flex items-center gap-2 truncate">
                        {proofFileName ? (
                          <>
                            <Check size={16} className="text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-[#3b241a]">{proofFileName}</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={16} className="text-[#a36c42] shrink-0" />
                            <span className="text-xs">{lang === 'ar' ? 'اختر ملفاً (PDF أو صورة)' : 'Upload document (PDF / Image)'}</span>
                          </>
                        )}
                      </span>
                      <span className="rounded-lg bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#6b4632]">
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
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3b241a] text-xs font-bold text-[#fffdf9] shadow-sm transition hover:bg-[#533426] disabled:opacity-50"
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

        {/* Demo Fast Login */}
        <div className="mt-6 rounded-2xl border border-[#eee5da] bg-[#faf6ef] p-3.5 text-center">
          <span className="block text-xs font-bold text-[#8c694a]">
            {lang === 'ar' ? '⚡ تجربة سريعة للتطوير (دخول فوري بنقرة واحدة):' : '⚡ Quick Demo Login:'}
          </span>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2.5 py-1.5 text-xs font-bold text-[#6b4632] transition hover:bg-[#dfd3c3]"
            >
              <UserRound size={13} />
              <span>{lang === 'ar' ? 'مستخدم' : 'User'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('lawyer')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2.5 py-1.5 text-xs font-bold text-[#6b4632] transition hover:bg-[#dfd3c3]"
            >
              <BriefcaseBusiness size={13} />
              <span>{lang === 'ar' ? 'محامي' : 'Lawyer'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('company')}
              disabled={isLoading || !!loadingOAuth}
              className="flex items-center gap-1 rounded-lg border border-[#ddcdbb] bg-[#ede3d5] px-2.5 py-1.5 text-xs font-bold text-[#6b4632] transition hover:bg-[#dfd3c3]"
            >
              <Building2 size={13} />
              <span>{lang === 'ar' ? 'شركة' : 'Company'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
