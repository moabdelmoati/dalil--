import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  X as XIcon,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Smartphone,
  QrCode,
  ArrowLeft,
  ChevronDown,
  Gift,
  FileCheck2,
  FolderOpen,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface PlanDetail {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  badge?: string;
  badgeEn?: string;
  desc: string;
  descEn: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  color: string;
  features: {
    docs: string;
    size: string;
    storage: string;
    ai: string;
    questions: string;
    items: { label: string; labelEn: string; included: boolean }[];
  };
}

const plansData: PlanDetail[] = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    icon: '🆓',
    desc: 'لتجربة المنصة والاستخدام الشخصي البسيط',
    descEn: 'For trying the platform and simple personal use',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'border-[#e1d3c2]',
    features: {
      docs: '5 مستندات / شهر',
      size: 'أقصى حجم: 10 ميجابايت',
      storage: 'مساحة تخزين: 100 ميجابايت',
      ai: 'تحليل الذكاء الاصطناعي: محدود',
      questions: '20 سؤال للمستند',
      items: [
        { label: 'دعم صيغ PDF, DOCX, JPG/PNG', labelEn: 'Supports PDF, DOCX, JPG/PNG', included: true },
        { label: 'ملخص شامل للمستند', labelEn: 'Complete Document Summary', included: true },
        { label: 'استخراج المعلومات الأساسية', labelEn: 'Key Information Extraction', included: false },
        { label: 'فحص قانوني متقدم', labelEn: 'Advanced Legal Analysis', included: false },
        { label: 'سجل وحفظ المستندات', labelEn: 'Document History', included: false },
        { label: 'تصدير التقارير PDF', labelEn: 'Export PDF Reports', included: false },
        { label: 'دعم مجتمعي', labelEn: 'Community Support', included: true },
      ],
    },
  },
  {
    id: 'student',
    name: 'طالب',
    nameEn: 'Student',
    icon: '🎓',
    desc: 'مخصصة للطلاب والباحثين والخريجين الجدد',
    descEn: 'For students, researchers, and fresh graduates',
    monthlyPrice: 49,
    annualPrice: 39,
    color: 'border-[#c8d9e6]',
    features: {
      docs: '30 مستند / شهر',
      size: 'أقصى حجم: 20 ميجابايت',
      storage: 'مساحة تخزين: 500 ميجابايت',
      ai: 'تحليل الذكاء الاصطناعي: كامل',
      questions: '150 سؤال للمستند',
      items: [
        { label: 'دعم صيغ PDF, DOCX, JPG/PNG', labelEn: 'Supports PDF, DOCX, JPG/PNG', included: true },
        { label: 'ملخص شامل للمستند', labelEn: 'Complete Document Summary', included: true },
        { label: 'استخراج المعلومات الأساسية', labelEn: 'Key Information Extraction', included: true },
        { label: 'حفظ سجل المستندات', labelEn: 'Document History', included: true },
        { label: 'فحص قانوني متقدم', labelEn: 'Advanced Legal Analysis', included: false },
        { label: 'تصدير التقارير PDF', labelEn: 'Export PDF Reports', included: false },
        { label: 'دعم فني أساسي', labelEn: 'Basic Technical Support', included: true },
      ],
    },
  },
  {
    id: 'pro',
    name: 'محترف (Pro)',
    nameEn: 'Pro',
    icon: '⭐',
    badge: 'الأكثر طلباً 🔥',
    badgeEn: 'Most Popular 🔥',
    popular: true,
    desc: 'الخيار الأفضل للأفراد وأصحاب العمل الحر والعقارات',
    descEn: 'Best for individuals, freelancers, and tenants',
    monthlyPrice: 99,
    annualPrice: 79,
    color: 'border-[#a36c42] shadow-[0_20px_45px_rgba(59,36,26,.14)]',
    features: {
      docs: '100 مستند / شهر',
      size: 'أقصى حجم: 30 ميجابايت',
      storage: 'مساحة تخزين: 2 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: متقدم',
      questions: '500 سؤال للمستند',
      items: [
        { label: 'دعم صيغ PDF, DOCX, JPG/PNG', labelEn: 'Supports PDF, DOCX, JPG/PNG', included: true },
        { label: 'ملخص شامل ومفصل', labelEn: 'Detailed Document Summary', included: true },
        { label: 'استخراج الأطراف والشروط بدقة', labelEn: 'Key Terms & Parties Extraction', included: true },
        { label: 'فحص الثغرات والشروط الجزائية', labelEn: 'Advanced Legal Risk Audit', included: true },
        { label: 'سجل كامل للمستندات والمراجعات', labelEn: 'Full Document History & Edits', included: true },
        { label: 'تصدير تقارير المراجعة PDF', labelEn: 'Export PDF Reports', included: true },
        { label: 'دعم فني سريع', labelEn: 'Fast Technical Support', included: true },
      ],
    },
  },
  {
    id: 'professional',
    name: 'مهني (Professional)',
    nameEn: 'Professional',
    icon: '💼',
    desc: 'للمستشارين، مكاتب المحاماة، ومسؤولي العقود',
    descEn: 'For legal advisors, consultants, and contract managers',
    monthlyPrice: 249,
    annualPrice: 199,
    color: 'border-[#d4bead]',
    features: {
      docs: '300 مستند / شهر',
      size: 'أقصى حجم: 50 ميجابايت',
      storage: 'مساحة تخزين: 10 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: فائق (Advanced)',
      questions: '2,000 سؤال للمستند',
      items: [
        { label: 'جميع ميزات باقة المحترف', labelEn: 'All Pro Features Included', included: true },
        { label: 'أولوية قصوى في سرعة المعالجة', labelEn: 'Priority Processing Speed', included: true },
        { label: 'تحليل عقود معقدة ومتعددة الصفحات', labelEn: 'Multi-page Complex Contracts', included: true },
        { label: 'تصدير تقارير رسمية وطباعة', labelEn: 'Official PDF Export & Print', included: true },
        { label: 'أرشفة سحابية مشفرة لـ 10GB', labelEn: '10GB Encrypted Cloud Vault', included: true },
        { label: 'مساحة عمل مشتركة لفرد إضافي', labelEn: 'Shared Workspace (1 seat)', included: false },
        { label: 'دعم فني ذو أولوية عبر الواتساب', labelEn: 'Priority WhatsApp Support', included: true },
      ],
    },
  },
  {
    id: 'business',
    name: 'شركات (Business)',
    nameEn: 'Business',
    icon: '🏢',
    badge: 'للشركات والمؤسسات',
    badgeEn: 'For Enterprises',
    desc: 'للشركات والشركات الناشئة وفرق العمل الكبيرة',
    descEn: 'For growing businesses, startups, and enterprise teams',
    monthlyPrice: 599,
    annualPrice: 479,
    color: 'border-[#3b241a]',
    features: {
      docs: '1,000 مستند / شهر',
      size: 'أقصى حجم: 100 ميجابايت',
      storage: 'مساحة تخزين: 50 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: فائق (Advanced)',
      questions: '7,000 سؤال للمستند',
      items: [
        { label: 'جميع ميزات باقة المهني بالكامل', labelEn: 'All Professional Features', included: true },
        { label: '5 حسابات لأعضاء الفريق (Seats)', labelEn: '5 Team Member Accounts', included: true },
        { label: 'مساحة عمل مشتركة (Shared Workspace)', labelEn: 'Shared Team Workspace', included: true },
        { label: 'سجلات التدقيق والأمان (Audit Logs)', labelEn: 'Audit Logs & Activity Tracking', included: true },
        { label: 'أولوية معالجة فورية للمستندات الكبيرة', labelEn: 'Instant High-speed Processing', included: true },
        { label: 'أرشفة سحابية واسعة لـ 50GB', labelEn: '50GB Encrypted Cloud Vault', included: true },
        { label: 'مدير حساب ودعم فني مخصص 24/7', labelEn: 'Dedicated 24/7 Account Support', included: true },
      ],
    },
  },
];

const tableFeatures = [
  { label: 'المستندات شهرياً', labelEn: 'Documents / month', values: ['5', '30', '100', '300', '1,000'] },
  { label: 'الحد الأقصى لحجم الملف', labelEn: 'Max file size', values: ['10 MB', '20 MB', '30 MB', '50 MB', '100 MB'] },
  { label: 'مساحة التخزين السحابي', labelEn: 'Cloud Storage', values: ['100 MB', '500 MB', '2 GB', '10 GB', '50 GB'] },
  { label: 'تحليل الذكاء الاصطناعي', labelEn: 'AI Analysis', values: ['محدود', '✅ كامل', '✅ متقدم', '✅ فائق', '✅ فائق'] },
  { label: 'أسئلة المستند التفاعلية', labelEn: 'Interactive Questions', values: ['20', '150', '500', '2,000', '7,000'] },
  { label: 'دعم PDF, DOCX, JPG/PNG', labelEn: 'PDF, DOCX, Images', values: ['✅', '✅', '✅', '✅', '✅'] },
  { label: 'استخراج الأطراف والبيانات', labelEn: 'Key Info Extraction', values: ['❌', '✅', '✅', '✅', '✅'] },
  { label: 'فحص الشروط الجزائية والثغرات', labelEn: 'Advanced Risk Audit', values: ['❌', '❌', '✅', '✅', '✅'] },
  { label: 'سجل المستندات السابقة', labelEn: 'Document History', values: ['❌', '✅', '✅', '✅', '✅'] },
  { label: 'تصدير التقارير المكتوبة', labelEn: 'Export PDF Report', values: ['❌', '❌', '✅', '✅', '✅'] },
  { label: 'أولوية المعالجة الفورية', labelEn: 'Priority Processing', values: ['❌', '❌', '❌', '✅', '✅'] },
  { label: 'عدد أعضاء الفريق', labelEn: 'Team Members', values: ['1', '1', '1', '1', '5'] },
  { label: 'مساحة عمل مشتركة', labelEn: 'Shared Workspace', values: ['❌', '❌', '❌', '❌', '✅'] },
  { label: 'سجلات التدقيق والأمان', labelEn: 'Audit Logs', values: ['❌', '❌', '❌', '❌', '✅'] },
  { label: 'مستوى الدعم الفني', labelEn: 'Support Level', values: ['مجتمعي', 'أساسي', 'أساسي سريع', 'أولوية خاصة', 'مخصص 24/7'] },
];

export function PricingPage() {
  const { t, lang, dir } = useLanguage();
  const [, navigate] = useLocation();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showTable, setShowTable] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'fawry'>('card');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleOpenSubscribe = (plan: PlanDetail) => {
    if (plan.monthlyPrice === 0) {
      navigate('/analyze');
      return;
    }
    setSelectedPlan(plan);
    setSubscribeSuccess(false);
    setIsSubscribing(false);
  };

  const handleExecuteSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribeSuccess(true);
    }, 1200);
  };

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
      {/* Header section */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[.16em] text-[#a36c42]">
          <span className="size-2 rounded-full bg-[#d9ab65]" />
          {lang === 'ar' ? 'خطط وباقات دليل' : 'Dalil Plans & Pricing'}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-[#3b241a] sm:text-5xl lg:text-6xl">
          {lang === 'ar' ? 'اختر الخطة المناسبة لك' : 'Choose Your Ideal Plan'}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#796c63] sm:text-lg">
          {lang === 'ar'
            ? 'باقات واضحة ومرنة تبدأ من الاستخدام المجاني وحتى الشركات الكبرى. فحص ذكي، كشف للثغرات، ودعم قانوني فوري.'
            : 'Clear, flexible pricing from free personal use to growing business teams.'}
        </p>

        {/* Free Month Promo Banner */}
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fdf7ef] px-4 py-2 text-xs font-bold text-[#8c694a] shadow-sm">
          <Gift size={16} className="text-[#a36c42]" />
          <span>{lang === 'ar' ? 'شهر مجاني عند الاشتراك السنوي 🎁' : 'Free Trial on Annual Billing 🎁'}</span>
          <span className="hidden sm:inline text-[#a36c42]">· {lang === 'ar' ? 'وفّر ٢٠٪ من قيمة الاشتراك' : 'Save 20% on all plans'}</span>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm'
                  : 'text-[#796c63] hover:text-[#3b241a]'
              }`}
              data-testid="button-billing-monthly"
            >
              {lang === 'ar' ? 'الدفع الشهري' : 'Monthly Billing'}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm'
                  : 'text-[#796c63] hover:text-[#3b241a]'
              }`}
              data-testid="button-billing-annual"
            >
              {lang === 'ar' ? 'الدفع السنوي' : 'Annual Billing'}
              <span className="rounded-full bg-[#e6c58e] px-2 py-0.5 text-[10px] font-extrabold text-[#3b241a]">
                {lang === 'ar' ? 'وفّر ٢٠٪' : 'Save 20%'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Pricing Cards Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch">
        {plansData.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const isFree = plan.monthlyPrice === 0;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border bg-[#fffdf9] p-6 shadow-sm transition-all hover:border-[#c5aa8c] hover:shadow-[0_16px_35px_rgba(59,36,26,.08)] ${
                plan.popular ? 'border-2 border-[#a36c42] ring-2 ring-[#a36c42]/20 lg:-translate-y-2' : plan.color
              }`}
              data-testid={`card-pricing-${plan.id}`}
            >
              {/* Popular / Enterprise Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#e6c58e] to-[#d9ab65] px-3.5 py-1 text-[11px] font-extrabold text-[#3b241a] shadow-md">
                  {lang === 'ar' ? plan.badge : plan.badgeEn}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{plan.icon}</span>
                  <span className="rounded-full bg-[#ede3d5] px-3 py-1 text-xs font-bold text-[#8b674d]">
                    {lang === 'ar' ? plan.name : plan.nameEn}
                  </span>
                </div>

                <p className="mt-4 text-xs leading-5 text-[#796c63] min-h-[40px]">
                  {lang === 'ar' ? plan.desc : plan.descEn}
                </p>

                {/* Price */}
                <div className="mt-5 border-b border-[#eee5da] pb-5">
                  <div className="flex items-baseline gap-1">
                    {isFree ? (
                      <span className="font-display text-4xl font-extrabold text-[#3b241a]">
                        {lang === 'ar' ? 'مجاناً' : 'Free'}
                      </span>
                    ) : (
                      <>
                        <span className="font-display text-4xl font-extrabold text-[#3b241a]">
                          {price}
                        </span>
                        <span className="text-xs font-bold text-[#a36c42]">
                          {lang === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                        <span className="text-[11px] font-semibold text-[#8f8176]">
                          {billingCycle === 'monthly' ? (lang === 'ar' ? '/ شهر' : '/ mo') : (lang === 'ar' ? '/ شهر (سنوياً)' : '/ mo (yr)')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Key specs highlight box */}
                <div className="mt-4 rounded-2xl bg-[#fdf7ef] p-3 text-xs space-y-1.5 border border-[#ddc8aa]/40">
                  <div className="font-bold text-[#3b241a] flex items-center gap-1.5">
                    <FileCheck2 size={14} className="text-[#a36c42]" />
                    <span>{plan.features.docs}</span>
                  </div>
                  <div className="text-[11px] text-[#796c63]">
                    {plan.features.size}
                  </div>
                  <div className="text-[11px] text-[#796c63]">
                    {plan.features.storage}
                  </div>
                  <div className="text-[11px] text-[#796c63]">
                    {plan.features.questions}
                  </div>
                </div>

                {/* Feature checklist */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-bold text-[#3b241a] uppercase tracking-wider">
                    {lang === 'ar' ? 'الميزات:' : 'Features:'}
                  </p>
                  {plan.features.items.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs leading-5">
                      {feat.included ? (
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#dce9db] text-[#447052]">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#fbe7e4] text-[#b34032]">
                          <XIcon size={11} strokeWidth={2.5} />
                        </span>
                      )}
                      <span className={`text-[11px] ${feat.included ? 'text-[#5e5048]' : 'text-[#a0948c] line-through'}`}>
                        {lang === 'ar' ? feat.label : feat.labelEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-7 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenSubscribe(plan)}
                  className={`w-full rounded-xl py-3 text-xs font-bold transition-all shadow-sm ${
                    plan.popular
                      ? 'bg-[#3b241a] text-[#fffdf9] hover:bg-[#533426] hover:shadow-md'
                      : isFree
                      ? 'border border-[#ddcdbb] bg-white text-[#3b241a] hover:bg-[#fdf7ef]'
                      : 'border border-[#dccab5] bg-[#fffdf9] text-[#3b241a] hover:bg-[#fdf7ef] hover:border-[#a36c42]'
                  }`}
                  data-testid={`btn-choose-${plan.id}`}
                >
                  {isFree ? (lang === 'ar' ? 'ابدأ مجاناً' : 'Get Started') : (lang === 'ar' ? 'اشترك الآن' : 'Subscribe')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Comparison Table Section */}
      <div className="mt-16 text-center">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] px-6 py-3.5 text-sm font-bold text-[#3b241a] shadow-sm transition hover:bg-[#fdf7ef] hover:border-[#a36c42]"
        >
          <span>{showTable ? (lang === 'ar' ? 'إخفاء جدول المقارنة التفصيلي' : 'Hide Detailed Comparison Table') : (lang === 'ar' ? 'عرض جدول المقارنة التفصيلي بين الباقات' : 'View Full Feature Comparison Table')}</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${showTable ? 'rotate-180' : ''}`} />
        </button>

        {showTable && (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] shadow-xl text-right">
            <table className="w-full text-sm text-[#5e5048]" dir={dir}>
              <thead className="bg-[#fdf7ef] border-b border-[#ddcdbb]">
                <tr>
                  <th className="p-4 lg:p-5 font-bold text-[#3b241a] w-[25%] text-base border-l border-[#ddcdbb]/30">
                    {lang === 'ar' ? 'الميزة / الباقة' : 'Feature / Plan'}
                  </th>
                  {plansData.map((plan) => (
                    <th key={plan.id} className="p-4 lg:p-5 text-center w-[15%] border-l border-[#ddcdbb]/30 last:border-0">
                      <div className="text-2xl mb-1">{plan.icon}</div>
                      <div className="font-bold text-sm text-[#3b241a]">{lang === 'ar' ? plan.name : plan.nameEn}</div>
                      <div className="text-sm font-extrabold text-[#a36c42] mt-1">
                        {plan.monthlyPrice === 0 ? (lang === 'ar' ? 'مجاناً' : 'Free') : `${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice} ${lang === 'ar' ? 'ج.م' : 'EGP'}`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee5da]">
                {tableFeatures.map((feat, i) => (
                  <tr key={i} className="hover:bg-white/60 transition-colors">
                    <td className="p-3 lg:p-4 px-4 font-semibold text-[#3b241a] border-l border-[#ddcdbb]/30 bg-[#fdf7ef]/20">
                      {lang === 'ar' ? feat.label : feat.labelEn}
                    </td>
                    {feat.values.map((val, j) => (
                      <td key={j} className={`p-3 lg:p-4 text-center border-l border-[#ddcdbb]/30 last:border-0 ${
                        j === 2 ? 'bg-[#fdf7ef]/40 font-bold text-[#3b241a]' : ''
                      }`}>
                        {val === '✅' ? (
                          <Check className="mx-auto text-green-600" size={18} />
                        ) : val === '❌' ? (
                          <XIcon className="mx-auto text-red-500/50" size={18} />
                        ) : (
                          <span className="text-xs font-medium">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscribe & Payment Modal */}
      {selectedPlan && (
        <div dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="absolute left-5 top-5 grid size-9 place-items-center rounded-full bg-[#ede3d5] text-[#6b4632] hover:bg-[#3b241a] hover:text-[#fffdf9]"
            >
              <XIcon size={18} />
            </button>

            {!subscribeSuccess ? (
              <div>
                <span className="text-xs font-bold text-[#a36c42]">
                  {lang === 'ar' ? 'تأكيد الاشتراك في باقة دليل' : 'Subscription Confirmation'}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#3b241a]">
                  {lang === 'ar' ? `باقة ${selectedPlan.name}` : `${selectedPlan.nameEn} Plan`}
                </h2>

                {/* Plan Summary Box */}
                <div className="mt-4 rounded-2xl bg-[#fdf7ef] border border-[#ddc8aa] p-5 text-center">
                  <div className="text-xs font-bold text-[#8c694a] mb-1">
                    {billingCycle === 'monthly' ? (lang === 'ar' ? 'اشتراك شهري' : 'Monthly Subscription') : (lang === 'ar' ? 'اشتراك سنوي (خصم ٢٠٪)' : 'Annual Subscription (20% Off)')}
                  </div>
                  <div className="text-3xl font-extrabold text-[#3b241a]">
                    {billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice} {lang === 'ar' ? 'جنيه مصري' : 'EGP'}
                    <span className="text-xs font-normal text-[#8c694a]"> / {lang === 'ar' ? 'شهر' : 'month'}</span>
                  </div>
                  <p className="mt-2 text-xs text-[#796c63]">
                    {selectedPlan.features.docs} · {selectedPlan.features.questions}
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="mt-6">
                  <label className="block text-xs font-bold text-[#5e5048] mb-3">
                    {lang === 'ar' ? 'اختر طريقة الدفع:' : 'Select Payment Method:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'wallet'
                          ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9] shadow-sm'
                          : 'border-[#ddcdbb] bg-white text-[#5e5048] hover:bg-[#fdf7ef]'
                      }`}
                    >
                      <Smartphone size={18} />
                      <span className="text-[11px]">{lang === 'ar' ? 'محافظ كاش' : 'E-Wallets'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fawry')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'fawry'
                          ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9] shadow-sm'
                          : 'border-[#ddcdbb] bg-white text-[#5e5048] hover:bg-[#fdf7ef]'
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="text-[11px]">{lang === 'ar' ? 'فوري' : 'Fawry'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'card'
                          ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9] shadow-sm'
                          : 'border-[#ddcdbb] bg-white text-[#5e5048] hover:bg-[#fdf7ef]'
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[11px]">{lang === 'ar' ? 'بطاقة بنكية' : 'Card'}</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleExecuteSubscribe} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {lang === 'ar' ? 'رقم الهاتف / المحفظة' : 'Phone / Wallet Number'}
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="01012345678"
                      className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426] disabled:opacity-75"
                    >
                      {isSubscribing ? (
                        <span>{lang === 'ar' ? 'جاري إتمام العملية...' : 'Processing...'}</span>
                      ) : (
                        <span>{lang === 'ar' ? 'تأكيد الدفع وتفعيل الباقة' : 'Confirm & Activate Plan'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-6 text-center">
                <span className="grid size-16 mx-auto place-items-center rounded-2xl bg-[#dce9db] text-[#447052] mb-5">
                  <CheckCircle2 size={36} />
                </span>
                <h3 className="font-display text-2xl font-bold text-[#3b241a] mb-2">
                  {lang === 'ar' ? 'تم تفعيل الاشتراك بنجاح! 🎉' : 'Subscription Activated! 🎉'}
                </h3>
                <p className="text-xs leading-6 text-[#796c63] mb-6">
                  {lang === 'ar'
                    ? `تم تفعيل باقة (${selectedPlan.name}) لحسابك. يمكنك الآن فحص مستنداتك واستخدام جميع الميزات فوراً.`
                    : `${selectedPlan.nameEn} plan is now active on your account.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlan(null);
                    navigate('/analyze');
                  }}
                  className="w-full rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426]"
                >
                  {lang === 'ar' ? 'ابدأ فحص عقد الآن' : 'Start Analyzing Contracts'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
