import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  X as XIcon,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  FileCheck2,
  ShieldCheck,
  Smartphone,
  QrCode,
  CreditCard,
  ChevronLeft,
  Gift,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface PlanItem {
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
  customPriceText?: string;
  customPriceTextEn?: string;
  isCustom?: boolean;
  isDark?: boolean;
  highlight?: boolean;
  specs: {
    docs: string;
    size: string;
    storage: string;
    ai: string;
    questions: string;
  };
  features: string[];
  featuresEn: string[];
}

const mainPlans: PlanItem[] = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    icon: '🆓',
    desc: 'لتجربة المنصة والاستخدام الشخصي البسيط',
    descEn: 'For trying the platform and simple personal use',
    monthlyPrice: 0,
    annualPrice: 0,
    specs: {
      docs: '2 مستند / شهر',
      size: 'أقصى حجم: 10 ميجابايت',
      storage: 'مساحة تخزين: 100 ميجابايت',
      ai: 'تحليل الذكاء الاصطناعي: محدود',
      questions: '5 أسئلة للمستند',
    },
    features: [
      '2 فحص مستند كل شهر',
      'دعم ملفات PDF و DOCX والصور',
      'ملخص شامل لمحتوى المستند',
      '5 أسئلة ذكية لكل مستند',
      'دعم مجتمعي وتحديثات مستمرة',
    ],
    featuresEn: [
      '2 Document audits per month',
      'Supports PDF, DOCX, and Images',
      'Comprehensive Document Summary',
      '5 AI questions per document',
      'Community support & updates',
    ],
  },
  {
    id: 'student',
    name: 'طالب',
    nameEn: 'Student',
    icon: '🎓',
    badge: 'خصم الطلاب',
    badgeEn: 'Student Special',
    desc: 'مخصصة للطلاب والباحثين والخريجين الجدد',
    descEn: 'For students, researchers, and fresh graduates',
    monthlyPrice: 49,
    annualPrice: 39,
    specs: {
      docs: '10 مستندات / شهر',
      size: 'أقصى حجم: 20 ميجابايت',
      storage: 'مساحة تخزين: 500 ميجابايت',
      ai: 'تحليل الذكاء الاصطناعي: كامل',
      questions: '30 سؤال للمستند',
    },
    features: [
      '10 فحوصات مستندات كل شهر',
      'استخراج الأطراف والمعلومات الأساسية',
      '30 سؤال تفاعلي للمستندات',
      'حفظ سجل المستندات السابقة',
      'دعم فني أساسي سريع',
    ],
    featuresEn: [
      '10 Document audits per month',
      'Key Information Extraction',
      '30 Interactive AI questions',
      'Document History access',
      'Fast basic support',
    ],
  },
  {
    id: 'pro',
    name: 'محترف (Pro)',
    nameEn: 'Pro',
    icon: '⭐',
    badge: 'الأكثر طلباً 🔥',
    badgeEn: 'Most Popular 🔥',
    desc: 'الخيار المثالي للأفراد وأصحاب العمل الحر والمستأجرين',
    descEn: 'Ideal for freelancers, tenants, and active professionals',
    monthlyPrice: 99,
    annualPrice: 79,
    isDark: true,
    highlight: true,
    specs: {
      docs: '30 مستند / شهر',
      size: 'أقصى حجم: 30 ميجابايت',
      storage: 'مساحة تخزين: 2 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: متقدم',
      questions: '100 سؤال للمستند',
    },
    features: [
      '30 فحص مستند شهرياً مع أرشفة سحابية',
      'فحص قانوني متقدم وكشف الشروط الجزائية والثغرات',
      '100 سؤال تفاعلي باللهجة المصرية والمواد القانونية',
      'تصدير تقارير مراجعة تفصيلية PDF قابلة للطباعة',
      'سجل كامل لحفظ العقود وتاريخ التعديلات',
      'دعم فني ذو أولوية خاصة',
    ],
    featuresEn: [
      '30 Document audits per month with cloud vault',
      'Advanced Legal Risk & Penalty Audit',
      '100 Contextual AI questions with legal citations',
      'Export detailed printable PDF reports',
      'Full Document History & Revision Logs',
      'Priority Support',
    ],
  },
];

const advancedPlans: PlanItem[] = [
  {
    id: 'lawyer',
    name: 'باقة المحامي (Lawyer)',
    nameEn: 'Lawyer / Counsel',
    icon: '💼',
    badge: 'للمحامين والمستشارين',
    badgeEn: 'For Lawyers & Counsel',
    desc: 'لمكاتب المحاماة، المستشارين القانونيين، ومسؤولي العقود والاستشارات',
    descEn: 'For law firms, legal consultants, and corporate counsel specialists',
    monthlyPrice: 249,
    annualPrice: 199,
    specs: {
      docs: '99 مستند / شهر',
      size: 'أقصى حجم: 50 ميجابايت',
      storage: 'مساحة تخزين: 10 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: فائق السرعة',
      questions: '400 سؤال للمستند',
    },
    features: [
      '99 فحص مستند مع أقصى سرعة معالجة قانونية',
      'تحليل عقود ضخمة ومعقدة متعددة الأطراف والصفحات',
      '400 استفسار ذكي متعمق ومستند لمواد القانون المصري',
      'تصدير تقارير رسمية باسم المكتب وبصمة تدقيق معتمدة',
      'أرشفة سحابية مشفرة لـ 10GB',
      'دعم فني مخصص ذو أولوية عبر الواتساب',
    ],
    featuresEn: [
      '99 Document audits with high-speed legal priority',
      'Deep multi-page complex contract breakdown',
      '400 Deep legal inquiries under Egyptian legislation',
      'Official branded PDF audit reports',
      '10GB Encrypted cloud storage',
      'Dedicated WhatsApp Priority Support',
    ],
  },
  {
    id: 'business',
    name: 'شركات ومؤسسات (Business)',
    nameEn: 'Business Enterprise',
    icon: '🏢',
    badge: 'للشركات والمؤسسات',
    badgeEn: 'Enterprise Teams',
    desc: 'للشركات والشركات الناشئة وفرق العمل التي تحتاج تعاوناً وأماناً متقدماً',
    descEn: 'For enterprises, startups, and multi-user teams',
    monthlyPrice: 599,
    annualPrice: 479,
    specs: {
      docs: '300 مستند / شهر',
      size: 'أقصى حجم: 100 ميجابايت',
      storage: 'مساحة تخزين: 50 جيجابايت',
      ai: 'تحليل الذكاء الاصطناعي: فائق مع تكامل مؤسسي',
      questions: '1,200 سؤال للمستند',
    },
    features: [
      '300 مستند شهرياً وسرعة معالجة قصوى وفورية',
      '5 حسابات لأعضاء الفريق (5 Team Seats)',
      'مساحة عمل مشتركة لمراجعة وتدقيق العقود كفريق',
      'سجلات التدقيق والأمان المتقدمة (Audit Logs)',
      'أرشفة سحابية ضخمة ومشفرة لـ 50GB',
      '1,200 استفسار وسؤال شهرياً',
      'مدير حساب قانوني ودعم فني مخصص على مدار الساعة',
    ],
    featuresEn: [
      '300 Documents/mo with instant priority processing',
      '5 Team Member accounts included',
      'Shared collaborative workspace for contract audits',
      'Advanced Security & Audit Activity Logs',
      '50GB Encrypted enterprise cloud storage',
      '1,200 Interactive monthly queries',
      'Dedicated 24/7 Account Manager & Support',
    ],
  },
  {
    id: 'enterprise-custom',
    name: 'مخصص وسيرفر لوكال (On-Premise)',
    nameEn: 'Custom On-Premise',
    icon: '🛡️',
    badge: 'سيرفر محلي خاص 🖥️',
    badgeEn: 'Local Server & Air-Gapped',
    desc: 'للشركات التي ترغب في تثبيت السيستم محلياً بالكامل مع الموديل الخاص وتخصيص كامل',
    descEn: 'For organizations requiring private local server deployment & custom local AI model',
    monthlyPrice: 0,
    annualPrice: 0,
    isCustom: true,
    customPriceText: 'حسب الطلب',
    customPriceTextEn: 'Custom Quote',
    isDark: true,
    specs: {
      docs: 'فحص غير محدود (Unlimited)',
      size: 'أقصى حجم: مفتوح بالكامل',
      storage: 'سيرفر محلي خاص بالشركة',
      ai: 'الموديل اللوكال الخاص (Dalil-Legal-LoRA)',
      questions: 'أسئلة واستفسارات غير محدودة',
    },
    features: [
      'تثبيت المنصة محلياً بالكامل على خوادم الشركة (On-Premise)',
      'تشغيل الموديل اللوكال الخاص (Dalil-Legal-LoRA) لسرية تامة وعزل البيانات',
      'التكلفة حسب متطلبات النظام وتكلفة السيرفر اللوكال',
      'تخصيص كامل لقواعد الفحص ونماذج العقود (Custom Workflows)',
      'فحوصات وعدد مقاعد مستخدمين غير محدود بدون قيود سحابية',
      'فريق هندسي متخصص للتركيب والدعم الميداني وتحديثات الأوزان',
    ],
    featuresEn: [
      'Full On-Premise private server installation',
      'Proprietary Dalil-Legal-LoRA local model for maximum data privacy',
      'Custom pricing based on requirements + local server infrastructure cost',
      'Tailored legal audit rules and internal contract templates',
      'Unlimited document audits and user seats',
      'Dedicated engineering support, on-site setup & maintenance SLA',
    ],
  },
];

const allPlans = [...mainPlans, ...advancedPlans];

const comparisonRows = [
  { label: 'عدد المستندات شهرياً', labelEn: 'Monthly Documents', vals: ['2 مستند', '10 مستندات', '30 مستند', '99 مستند', '300 مستند', 'غير محدود (Open)'] },
  { label: 'الحد الأقصى لحجم الملف', labelEn: 'Max File Size', vals: ['10 MB', '20 MB', '30 MB', '50 MB', '100 MB', 'مفتوح بالكامل'] },
  { label: 'سعة التخزين', labelEn: 'Storage', vals: ['100 MB', '500 MB', '2 GB', '10 GB', '50 GB', 'سيرفر محلي خاص'] },
  { label: 'مستوى فحص الذكاء الاصطناعي', labelEn: 'AI Analysis Level', vals: ['محدود', 'كامل', 'متقدم وشامل', 'فائق السرعة', 'فائق وموسع', 'الموديل اللوكال الخاص مدمج محلياً'] },
  { label: 'أسئلة المستند التفاعلية', labelEn: 'AI Interactive Questions', vals: ['5 أسئلة', '30 سؤال', '100 سؤال', '400 سؤال', '1,200 سؤال', 'غير محدود'] },
  { label: 'دعم صيغ PDF و DOCX والصور', labelEn: 'PDF, DOCX & Images Support', vals: ['✅', '✅', '✅', '✅', '✅', '✅'] },
  { label: 'ملخص شامل لأهم البنود', labelEn: 'Contract Summary', vals: ['✅', '✅', '✅', '✅', '✅', '✅'] },
  { label: 'استخراج الأطراف والشروط بدقة', labelEn: 'Key Terms Extraction', vals: ['❌', '✅', '✅', '✅', '✅', '✅'] },
  { label: 'فحص الشروط الجزائية والثغرات', labelEn: 'Advanced Risk & Penalty Audit', vals: ['❌', '❌', '✅', '✅', '✅', '✅'] },
  { label: 'سجل وتاريخ المستندات السابقة', labelEn: 'Document History Access', vals: ['❌', '✅', '✅', '✅', '✅', '✅'] },
  { label: 'تصدير وطباعة تقارير المراجعة PDF', labelEn: 'Export Printable PDF Report', vals: ['❌', '❌', '✅', '✅', '✅', '✅'] },
  { label: 'أولوية قصوى في سرعة المعالجة', labelEn: 'Priority Processing Speed', vals: ['❌', '❌', '❌', '✅', '✅', '✅'] },
  { label: 'عدد حسابات الفريق (Seats)', labelEn: 'Team Members (Seats)', vals: ['1', '1', '1', '1', '5', 'غير محدود'] },
  { label: 'مساحة عمل مشتركة للفريق', labelEn: 'Shared Workspace', vals: ['❌', '❌', '❌', '❌', '✅', '✅'] },
  { label: 'سجلات التدقيق والأمان (Audit Logs)', labelEn: 'Security Audit Logs', vals: ['❌', '❌', '❌', '❌', '✅', '✅'] },
  { label: 'تثبيت محلي On-Premise + سيرفر لوكال', labelEn: 'Local Server On-Premise', vals: ['❌', '❌', '❌', '❌', '❌', '✅'] },
  { label: 'مستوى الدعم الفني', labelEn: 'Support Level', vals: ['مجتمعي', 'أساسي', 'أساسي سريع', 'أولوية عبر الواتساب', 'مدير حساب 24/7', 'مهندس مخصص + SLA'] },
];

export function PricingPage() {
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'fawry'>('card');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleOpenSubscribe = (plan: PlanItem) => {
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

  const renderCard = (plan: PlanItem) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    const isFree = plan.monthlyPrice === 0;

    return (
      <div
        key={plan.id}
        className={`relative flex flex-col justify-between rounded-[2rem] p-7 transition-all ${
          plan.isDark
            ? 'bg-[#3b241a] text-[#fffdf9] shadow-[0_25px_50px_rgba(59,36,26,.25)] ring-2 ring-[#e6c58e]/30'
            : 'border-2 border-[#ddc8aa] bg-[#fffdf9] text-[#3b241a] shadow-sm hover:border-[#a36c42] hover:shadow-[0_20px_40px_rgba(59,36,26,.08)]'
        } ${plan.highlight ? 'lg:-translate-y-3' : ''}`}
        data-testid={`card-pricing-${plan.id}`}
      >
        {/* Badge */}
        {plan.badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#e6c58e] to-[#d9ab65] px-4 py-1 text-xs font-extrabold text-[#3b241a] shadow-md">
            {lang === 'ar' ? plan.badge : plan.badgeEn}
          </div>
        )}

        <div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{plan.icon}</span>
              <div>
                <h3 className={`font-display text-xl font-bold ${plan.isDark ? 'text-[#fffdf9]' : 'text-[#3b241a]'}`}>
                  {lang === 'ar' ? plan.name : plan.nameEn}
                </h3>
              </div>
            </div>
          </div>

          <p className={`mt-3 text-xs leading-5 min-h-[40px] ${plan.isDark ? 'text-[#dbcabb]' : 'text-[#796c63]'}`}>
            {lang === 'ar' ? plan.desc : plan.descEn}
          </p>

          {/* Price */}
          <div className={`mt-5 border-b pb-5 ${plan.isDark ? 'border-white/10' : 'border-[#eee5da]'}`}>
            <div className="flex items-baseline gap-1.5">
              {plan.isCustom ? (
                <div>
                  <span className={`font-display text-3xl font-extrabold ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#3b241a]'}`}>
                    {lang === 'ar' ? (plan.customPriceText || 'حسب الطلب') : (plan.customPriceTextEn || 'Custom Quote')}
                  </span>
                  <span className={`block mt-1 text-xs font-semibold ${plan.isDark ? 'text-[#dbcabb]' : 'text-[#8c694a]'}`}>
                    {lang === 'ar' ? '+ تكلفة السيرفر اللوكال' : '+ Local Server Cost'}
                  </span>
                </div>
              ) : isFree ? (
                <span className={`font-display text-5xl font-extrabold ${plan.isDark ? 'text-[#fffdf9]' : 'text-[#3b241a]'}`}>
                  {lang === 'ar' ? 'مجاناً' : 'Free'}
                </span>
              ) : (
                <>
                  <span className={`font-display text-5xl font-extrabold ${plan.isDark ? 'text-[#fffdf9]' : 'text-[#3b241a]'}`}>
                    {price}
                  </span>
                  <span className={`text-sm font-bold ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#a36c42]'}`}>
                    {lang === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                  <span className={`text-xs font-semibold ${plan.isDark ? 'text-[#c2af9f]' : 'text-[#8f8176]'}`}>
                    {billingCycle === 'monthly' ? (lang === 'ar' ? '/ شهر' : '/ mo') : (lang === 'ar' ? '/ شهر (سنوياً)' : '/ mo (yr)')}
                  </span>
                </>
              )}
            </div>
            {billingCycle === 'annual' && !isFree && !plan.isCustom && (
              <span className={`mt-1 block text-[11px] font-bold ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#447052]'}`}>
                {lang === 'ar' ? 'تم تطبيق خصم ٢٠٪ للدفع السنوي' : '20% annual discount applied'}
              </span>
            )}
          </div>

          {/* Specs Box */}
          <div className={`mt-5 rounded-2xl p-4 text-xs space-y-2 ${
            plan.isDark ? 'bg-white/5 border border-white/10' : 'bg-[#fdf7ef] border border-[#ddc8aa]/50'
          }`}>
            <div className={`font-bold flex items-center gap-2 text-sm ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#3b241a]'}`}>
              <FileCheck2 size={16} />
              <span>{plan.specs.docs}</span>
            </div>
            <div className={`text-xs ${plan.isDark ? 'text-[#dbcabb]' : 'text-[#6b584d]'}`}>
              • {plan.specs.size}
            </div>
            <div className={`text-xs ${plan.isDark ? 'text-[#dbcabb]' : 'text-[#6b584d]'}`}>
              • {plan.specs.storage}
            </div>
            <div className={`text-xs font-semibold ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#8c694a]'}`}>
              • {plan.specs.ai}
            </div>
            <div className={`text-xs ${plan.isDark ? 'text-[#dbcabb]' : 'text-[#6b584d]'}`}>
              • {plan.specs.questions}
            </div>
          </div>

          {/* Features List */}
          <div className="mt-6 space-y-3">
            <p className={`text-xs font-bold uppercase tracking-wider ${plan.isDark ? 'text-[#e6c58e]' : 'text-[#3b241a]'}`}>
              {lang === 'ar' ? 'ما تتضمنه الباقة:' : 'What is included:'}
            </p>
            {(lang === 'ar' ? plan.features : plan.featuresEn).map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs leading-5">
                <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                  plan.isDark ? 'bg-[#e6c58e] text-[#3b241a]' : 'bg-[#dce9db] text-[#447052]'
                }`}>
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={plan.isDark ? 'text-[#f0e6dc]' : 'text-[#5e5048]'}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-8 pt-3">
          <button
            type="button"
            onClick={() => handleOpenSubscribe(plan)}
            className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-[0.99] ${
              plan.isDark
                ? 'bg-gradient-to-r from-[#e6c58e] to-[#d9ab65] text-[#3b241a] hover:brightness-105'
                : isFree
                ? 'border border-[#ddcdbb] bg-white text-[#3b241a] hover:bg-[#fdf7ef]'
                : 'bg-[#3b241a] text-[#fffdf9] hover:bg-[#533426]'
            }`}
            data-testid={`btn-choose-${plan.id}`}
          >
            {plan.isCustom ? (
              lang === 'ar' ? 'طلب عرض سعر وسيرفر محلي' : 'Request On-Premise Quote'
            ) : isFree ? (
              lang === 'ar' ? 'ابدأ الاستخدام مجاناً' : 'Get Started Free'
            ) : (
              lang === 'ar' ? 'اشترك في هذه الباقة' : 'Subscribe Now'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
      {/* Header section */}
      <div className="mx-auto max-w-3xl text-center mb-12">
        <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[.16em] text-[#a36c42]">
          <span className="size-2 rounded-full bg-[#d9ab65]" />
          {lang === 'ar' ? 'باقات واشتراكات دليل' : 'Dalil Plans & Subscriptions'}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-[#3b241a] sm:text-5xl lg:text-6xl">
          {lang === 'ar' ? 'اختر الخطة المناسبة لاحتياجك' : 'Choose Your Ideal Plan'}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#796c63] sm:text-lg">
          {lang === 'ar'
            ? 'باقات واضحة وقوية تبدأ من الاستخدام المجاني وحتى باقات الخبراء والمؤسسات. فحص ذكي، كشف للثغرات، ودعم قانوني فوري.'
            : 'Clear, robust pricing options designed for individuals, legal consultants, and enterprises.'}
        </p>

        {/* Free Month Promo Banner */}
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fdf7ef] px-5 py-2.5 text-xs font-bold text-[#8c694a] shadow-sm">
          <Gift size={16} className="text-[#a36c42]" />
          <span>{lang === 'ar' ? 'شهر مجاني عند الاشتراك السنوي 🎁' : '1 Month Free with Annual Billing 🎁'}</span>
          <span className="hidden sm:inline text-[#a36c42]">· {lang === 'ar' ? 'وفر ٢٠٪ على كافة الباقات' : 'Save 20% on all plans'}</span>
        </div>

        {/* Billing cycle toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
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
              className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
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

      {/* Part 1: Top 3 Core Plans */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-[#3b241a] mb-6 flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#a36c42]" />
          {lang === 'ar' ? 'باقات الأفراد والطلاب:' : 'Individual & Student Plans:'}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {mainPlans.map(renderCard)}
        </div>
      </div>

      {/* Part 2: Advanced & Business Plans */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-[#3b241a] mb-6 flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#a36c42]" />
          {lang === 'ar' ? 'باقات الخبراء والشركات:' : 'Professional & Enterprise Plans:'}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {advancedPlans.map(renderCard)}
        </div>
      </div>

      {/* Part 3: Full Comparison Table (جدول الفروقات الشامل تحت الكروت مباشرة) */}
      <div className="mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ede3d5] px-3.5 py-1 text-xs font-bold text-[#8c694a]">
            {lang === 'ar' ? 'مقارنة دقيقة' : 'Detailed Breakdown'}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
            {lang === 'ar' ? 'جدول الفروقات والمقارنة الشاملة' : 'Comprehensive Feature Comparison'}
          </h2>
          <p className="mt-2 text-sm text-[#796c63]">
            {lang === 'ar'
              ? 'قارن بين تفاصيل كل باقة جنباً إلى جنب لتختار الباقة الأنسب لمتطلباتك وحجم أعمالك.'
              : 'Compare all tier specifications and capabilities side-by-side.'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] shadow-xl">
          <table className="w-full text-sm text-[#5e5048]" dir={dir}>
            <thead className="bg-[#fdf7ef] border-b border-[#ddcdbb]">
              <tr>
                <th className="p-5 font-bold text-[#3b241a] w-[22%] text-base border-l border-[#ddcdbb]/30">
                  {lang === 'ar' ? 'الميزة والمواصفة' : 'Feature / Specification'}
                </th>
                {allPlans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`p-5 text-center w-[15.6%] border-l border-[#ddcdbb]/30 last:border-0 ${
                      plan.highlight ? 'bg-[#f7ebd9]/60 font-bold' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{plan.icon}</div>
                    <div className="font-bold text-sm text-[#3b241a]">{lang === 'ar' ? plan.name : plan.nameEn}</div>
                    <div className="text-base font-extrabold text-[#a36c42] mt-1.5">
                      {plan.isCustom ? (
                        <span className="text-xs font-bold">{lang === 'ar' ? 'حسب الطلب' : 'Custom Quote'}</span>
                      ) : plan.monthlyPrice === 0 ? (
                        lang === 'ar' ? 'مجاناً' : 'Free'
                      ) : (
                        `${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee5da]">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-white/60 transition-colors">
                  <td className="p-4 px-5 font-semibold text-[#3b241a] border-l border-[#ddcdbb]/30 bg-[#fdf7ef]/30 text-sm">
                    {lang === 'ar' ? row.label : row.labelEn}
                  </td>
                  {row.vals.map((val, j) => (
                    <td
                      key={j}
                      className={`p-4 text-center border-l border-[#ddcdbb]/30 last:border-0 text-xs font-medium ${
                        j === 2 ? 'bg-[#f7ebd9]/30 font-bold text-[#3b241a]' : ''
                      }`}
                    >
                      {val === '✅' ? (
                        <Check className="mx-auto text-green-600" size={19} strokeWidth={2.5} />
                      ) : val === '❌' ? (
                        <XIcon className="mx-auto text-red-500/40" size={18} strokeWidth={2} />
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                  {selectedPlan.isCustom
                    ? (lang === 'ar' ? 'طلب تثبيت محلي وخاص' : 'On-Premise Deployment Request')
                    : (lang === 'ar' ? 'تأكيد الاشتراك في باقة دليل' : 'Subscription Confirmation')}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#3b241a]">
                  {lang === 'ar' ? `باقة ${selectedPlan.name}` : `${selectedPlan.nameEn} Plan`}
                </h2>

                {/* Plan Summary Box */}
                <div className="mt-4 rounded-2xl bg-[#fdf7ef] border border-[#ddc8aa] p-5 text-center">
                  {selectedPlan.isCustom ? (
                    <>
                      <div className="text-xs font-bold text-[#8c694a] mb-1">
                        {lang === 'ar' ? 'سيرفر محلي خاص بالشركة' : 'Private On-Premise Server'}
                      </div>
                      <div className="text-2xl font-extrabold text-[#3b241a]">
                        {lang === 'ar' ? 'حسب الطلب وتكلفة السيرفر' : 'Custom Quote + Server Cost'}
                      </div>
                      <p className="mt-2 text-xs text-[#796c63]">
                        {lang === 'ar' ? 'فحص غير محدود · الموديل اللوكال الخاص Dalil-Legal-LoRA' : 'Unlimited Audits · Proprietary Local Model'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-[#8c694a] mb-1">
                        {billingCycle === 'monthly' ? (lang === 'ar' ? 'اشتراك شهري' : 'Monthly Subscription') : (lang === 'ar' ? 'اشتراك سنوي (خصم ٢٠٪)' : 'Annual Subscription (20% Off)')}
                      </div>
                      <div className="text-3xl font-extrabold text-[#3b241a]">
                        {billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice} {lang === 'ar' ? 'جنيه مصري' : 'EGP'}
                        <span className="text-xs font-normal text-[#8c694a]"> / {lang === 'ar' ? 'شهر' : 'month'}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#796c63]">
                        {selectedPlan.specs.docs} · {selectedPlan.specs.questions}
                      </p>
                    </>
                  )}
                </div>

                {/* Payment Methods (only for standard paid plans) */}
                {!selectedPlan.isCustom && (
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
                )}

                <form onSubmit={handleExecuteSubscribe} className="mt-5 space-y-3">
                  {selectedPlan.isCustom && (
                    <div>
                      <label className="block text-xs font-bold text-[#5e5048]">
                        {lang === 'ar' ? 'اسم المؤسسة / الشركة' : 'Company / Organization Name'}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={lang === 'ar' ? 'مثال: شركة النور للاستشارات' : 'e.g. Acme Corp'}
                        className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {selectedPlan.isCustom
                        ? (lang === 'ar' ? 'رقم الهاتف / الواتساب للتواصل' : 'Contact Phone / WhatsApp')
                        : (lang === 'ar' ? 'رقم الهاتف / المحفظة' : 'Phone / Wallet Number')}
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
                        <span>{lang === 'ar' ? 'جاري إرسال الطلب...' : 'Sending Request...'}</span>
                      ) : selectedPlan.isCustom ? (
                        <span>{lang === 'ar' ? 'إرسال طلب السيرفر والتسعير' : 'Submit On-Premise Request'}</span>
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
                  {selectedPlan.isCustom
                    ? (lang === 'ar' ? 'تم استلام طلبكم بنجاح! 🚀' : 'Request Received Successfully! 🚀')
                    : (lang === 'ar' ? 'تم تفعيل الاشتراك بنجاح! 🎉' : 'Subscription Activated! 🎉')}
                </h3>
                <p className="text-xs leading-6 text-[#796c63] mb-6">
                  {selectedPlan.isCustom
                    ? (lang === 'ar'
                        ? 'سيتواصل معكم الفريق الهندسي لتحديد مواصفات السيرفر اللوكال والـ Hardware المطلوب وتكلفة التثبيت والتخصيص.'
                        : 'Our engineering team will contact you shortly to configure your local server specs and deployment quote.')
                    : (lang === 'ar'
                        ? `تم تفعيل باقة (${selectedPlan.name}) لحسابك بنجاح. يمكنك الآن فحص مستنداتك واستخدام كافة الميزات فوراً.`
                        : `${selectedPlan.nameEn} plan is now active on your account.`)}
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
