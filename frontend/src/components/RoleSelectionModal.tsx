import React, { useState } from 'react';
import { useAuth, type UserRole, type VerificationData } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import {
  BriefcaseBusiness, Building2, UserRound, CheckCircle2, Loader2, Sparkles,
  ShieldCheck, UploadCloud, Check, AlertCircle
} from 'lucide-react';
import { Button } from '@/lib/ui';

export function RoleSelectionModal() {
  const { needsRoleSelection, updateRole, profile, user } = useAuth();
  const { lang, dir } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lawyer verification fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [lawyerTier, setLawyerTier] = useState('ابتدائي');

  // Company verification fields
  const [commercialReg, setCommercialReg] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Proof upload
  const [proofFileName, setProofFileName] = useState<string | null>(null);

  if (!needsRoleSelection) return null;

  const roles = [
    {
      id: 'user' as UserRole,
      title: lang === 'ar' ? 'مستخدم عادي / فرد' : 'Individual User',
      description:
        lang === 'ar'
          ? 'للبحث عن الخدمات الحكومية، الاستشارات القانونية الذكية، ومراجعة وتلخيص العقود الشخصية.'
          : 'For browsing civil services, AI legal inquiries, and personal contract reviews.',
      icon: UserRound,
      badge: lang === 'ar' ? 'أفراد' : 'Personal',
      color: 'border-[#cda270] bg-[#fcf9f4]',
    },
    {
      id: 'lawyer' as UserRole,
      title: lang === 'ar' ? 'محامي / مستشار قانوني' : 'Lawyer / Legal Advisor',
      description:
        lang === 'ar'
          ? 'لتقديم الاستشارات المعتمدة، إدارة موكليك وقضاياك، وصياغة العقود القانونية التخصصية.'
          : 'For certified legal advice, managing clients and cases, and drafting contracts.',
      icon: BriefcaseBusiness,
      badge: lang === 'ar' ? 'مهني' : 'Pro',
      color: 'border-[#3b241a] bg-[#fcf9f4]',
    },
    {
      id: 'company' as UserRole,
      title: lang === 'ar' ? 'شركة / منشأة أعمال' : 'Company / Enterprise',
      description:
        lang === 'ar'
          ? 'لإدارة العقود التجارية للشركات، استشارات تأسيس الشركات، والامتثال القانوني والضريبي.'
          : 'For enterprise contract management, business legal advice, and corporate compliance.',
      icon: Building2,
      badge: lang === 'ar' ? 'أعمال' : 'Business',
      color: 'border-[#8c694a] bg-[#fcf9f4]',
    },
  ];

  const handleSubmit = async () => {
    setError(null);

    // Validation for lawyer
    if (selectedRole === 'lawyer' && !licenseNumber.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم القيد بنقابة المحامين لتأكيد الهوية المهنية' : 'Please enter your Bar Registration Number');
      return;
    }

    // Validation for company
    if (selectedRole === 'company' && (!commercialReg.trim() || !taxNumber.trim())) {
      setError(lang === 'ar' ? 'يرجى إدخال رقم السجل التجاري والرقم الضريبي لتأكيد المنشأة' : 'Please enter Commercial Registry and Tax ID numbers');
      return;
    }

    setIsSubmitting(true);
    const verificationData: VerificationData = {
      license_number: licenseNumber.trim() || undefined,
      lawyer_tier: selectedRole === 'lawyer' ? lawyerTier : undefined,
      commercial_reg_number: commercialReg.trim() || undefined,
      tax_number: taxNumber.trim() || undefined,
      proof_file_name: proofFileName || undefined,
    };

    const { error: updateErr } = await updateRole(selectedRole, verificationData);
    if (updateErr) {
      setError(updateErr.message || 'حدث خطأ أثناء حفظ البيانات');
    }
    setIsSubmitting(false);
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-[#e6c58e] text-[#3b241a] shadow-inner">
            <Sparkles size={28} />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-[#3b241a] sm:text-3xl">
            {lang === 'ar' ? 'مرحباً بك في دليل! اختر نوع حسابك' : 'Welcome to Dalil! Select Account Type'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#796c63]">
            {lang === 'ar'
              ? 'يرجى تحديد نوع استخدامك للمنصة لنتمكن من تخصيص التجربة والخدمات المناسبة لك.'
              : 'Please select how you intend to use the platform to tailor your experience.'}
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => { setSelectedRole(role.id); setError(null); }}
                className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition-all duration-150 ${
                  isSelected
                    ? 'border-[#3b241a] bg-[#f7eedf] shadow-md ring-2 ring-[#3b241a]/10'
                    : 'border-[#e4d8c9] bg-[#fffdf9] hover:border-[#c5aa8c] hover:bg-[#faf6ef]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid size-10 place-items-center rounded-xl transition ${
                        isSelected ? 'bg-[#3b241a] text-[#fffdf9]' : 'bg-[#ede3d5] text-[#6b4632]'
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full bg-[#ede3d5] px-2 py-0.5 text-[10px] font-bold text-[#6b4632]">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-[#3b241a]">{role.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#796c63]">{role.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-end">
                  {isSelected ? (
                    <CheckCircle2 size={20} className="text-[#3b241a]" />
                  ) : (
                    <div className="size-5 rounded-full border-2 border-[#d5c5b2]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Verification Box for Lawyer */}
        {selectedRole === 'lawyer' && (
          <div className="mt-5 rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8c694a]">
              <ShieldCheck size={18} className="text-[#a36c42]" />
              <span>{lang === 'ar' ? 'إثبات وبيانات التوثيق المهني (نقابة المحامين)' : 'Lawyer Verification Proofs'}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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
                  className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-2 text-xs text-[#3b241a] shadow-sm focus:border-[#a36c42] focus:outline-none"
                >
                  <option value="جدول عام">{lang === 'ar' ? 'محامٍ جدول عام' : 'General Bar Lawyer'}</option>
                  <option value="ابتدائي">{lang === 'ar' ? 'محامٍ أمام المحاكم الابتدائية' : 'Primary Courts Lawyer'}</option>
                  <option value="استئناف">{lang === 'ar' ? 'محامٍ بالاستئناف العالي ومجلس الدولة' : 'High Appeal & State Council'}</option>
                  <option value="نقض">{lang === 'ar' ? 'محامٍ بالنقض والدستورية العليا' : 'Cassation & Supreme Court'}</option>
                </select>
              </div>
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

        {/* Dynamic Verification Box for Company */}
        {selectedRole === 'company' && (
          <div className="mt-5 rounded-2xl border border-[#ddc8aa] bg-[#fbf6ee] p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8c694a]">
              <ShieldCheck size={18} className="text-[#a36c42]" />
              <span>{lang === 'ar' ? 'بيانات توثيق الكيان التجاري والشركة' : 'Company & Business Verification'}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#ede3d5] pt-5">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            testId="btn-confirm-role"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}
              </span>
            ) : (
              <span>{lang === 'ar' ? 'تأكيد ومتابعة' : 'Confirm & Continue'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
