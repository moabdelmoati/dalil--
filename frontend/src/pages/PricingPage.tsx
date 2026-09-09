import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  Sparkles,
  Zap,
  Building2,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Smartphone,
  QrCode,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  X,
  Lock,
  ScanLine,
  Code2,
  HardDrive,
  Gift,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/lib/ui';

export function PricingPage() {
  const { t, lang, dir } = useLanguage();
  const [, navigate] = useLocation();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Enterprise calculator state
  const [calcDocs, setCalcDocs] = useState<number>(500);

  // Modal states
  const [selectedPlanForSubscribe, setSelectedPlanForSubscribe] = useState<'starter' | 'pro' | null>(null);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  // Subscribe modal form states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'fawry'>('card');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // Enterprise modal form states
  const [entForm, setEntForm] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    volume: '500',
    notes: '',
  });
  const [isEntSubmitting, setIsEntSubmitting] = useState(false);
  const [entSuccess, setEntSuccess] = useState(false);

  // Calculate enterprise price estimate starting from $0.20 base scan price
  const enterpriseEstimate = useMemo(() => {
    let rate = 0.20;
    if (calcDocs > 5000) rate = 0.08;
    else if (calcDocs > 2000) rate = 0.12;
    else if (calcDocs > 500) rate = 0.16;
    else rate = 0.20;

    const baseCost = Math.round(calcDocs * rate);
    return {
      total: Math.max(baseCost, 30),
      unitRate: rate.toFixed(2),
    };
  }, [calcDocs]);

  const toggleFaq = (index: number) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const handleOpenSubscribe = (plan: 'starter' | 'pro') => {
    setSelectedPlanForSubscribe(plan);
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

  const handleExecuteEnterpriseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEntSubmitting(true);
    setTimeout(() => {
      setIsEntSubmitting(false);
      setEntSuccess(true);
    }, 1200);
  };

  const starterPriceDisplay = billingCycle === 'monthly' ? '2' : '20';
  const proPriceDisplay = billingCycle === 'monthly' ? '4' : '40';
  const periodText = billingCycle === 'monthly' 
    ? (lang === 'ar' ? '/ شهرياً' : '/ month') 
    : (lang === 'ar' ? '/ سنوياً' : '/ year');

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      {/* Header section */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[.16em] text-[#a36c42]">
          <span className="size-2 rounded-full bg-[#d9ab65]" />
          {t('pricing.eyebrow')}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-[#3b241a] sm:text-5xl lg:text-6xl">
          {t('pricing.title')}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#796c63] sm:text-lg">
          {t('pricing.body')}
        </p>

        {/* Free Month Promo Banner */}
        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fdf7ef] px-4 py-2 text-xs font-bold text-[#8c694a] shadow-sm">
          <Gift size={16} className="text-[#a36c42]" />
          <span>{t('pricing.freeTrial.badge')}</span>
          <span className="hidden sm:inline text-[#a36c42]">· {t('pricing.freeTrial.note')}</span>
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
              {t('pricing.billing.monthly')}
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
              {t('pricing.billing.annual')}
              <span className="rounded-full bg-[#e6c58e] px-2 py-0.5 text-[10px] font-extrabold text-[#3b241a]">
                {t('pricing.billing.save')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Main Pricing Cards Grid */}
      <div className="mt-14 grid gap-8 lg:grid-cols-3 lg:items-stretch">
        {/* Plan 1: Starter ($2) */}
        <div
          className="relative flex flex-col justify-between rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] p-8 shadow-sm transition-all hover:border-[#c5aa8c] hover:shadow-[0_16px_35px_rgba(59,36,26,.06)]"
          data-testid="card-pricing-starter"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#ede3d5] px-3.5 py-1 text-xs font-bold text-[#8b674d]">
                {t('pricing.starter.name')}
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632]">
                <FileCheck2 size={18} />
              </span>
            </div>

            {/* Free Trial Tag */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#dce9db] px-2.5 py-1 text-[11px] font-bold text-[#447052]">
              <Gift size={13} />
              <span>{lang === 'ar' ? 'أول شهر مجاناً بالكامل' : '1st Month Free'}</span>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#796c63] min-h-[44px]">
              {t('pricing.starter.desc')}
            </p>

            <div className="mt-6 flex items-baseline gap-1 border-b border-[#eee5da] pb-6">
              <span className="text-2xl font-bold text-[#a36c42]">$</span>
              <span className="font-display text-5xl font-extrabold text-[#3b241a]">
                {starterPriceDisplay}
              </span>
              <span className="text-xs font-semibold text-[#8f8176]">
                {periodText}
              </span>
            </div>

            {billingCycle === 'annual' && (
              <p className="mt-2 text-[11px] font-semibold text-[#a36c42]">
                {t('pricing.starter.periodAnnual')}
              </p>
            )}

            <div className="mt-6 space-y-3.5">
              <p className="text-xs font-bold text-[#3b241a]">
                {lang === 'ar' ? 'ما تشمله الباقة:' : 'What\'s included:'}
              </p>
              {[
                t('pricing.starter.f1'),
                t('pricing.starter.f2'),
                t('pricing.starter.f3'),
                t('pricing.starter.f4'),
                t('pricing.starter.f5'),
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs leading-5 text-[#5e5048]">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#dce9db] text-[#447052]">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className={i === 0 || i === 2 ? 'font-bold text-[#3b241a]' : ''}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => handleOpenSubscribe('starter')}
              className="w-full rounded-2xl border border-[#dccab5] bg-[#fffdf9] py-3.5 text-sm font-bold text-[#3b241a] transition-all hover:border-[#a36c42] hover:bg-[#fdf7ef] hover:shadow-sm"
              data-testid="btn-choose-starter"
            >
              {t('pricing.starter.cta')}
            </button>
          </div>
        </div>

        {/* Plan 2: Pro ($4) - FEATURED */}
        <div
          className="relative flex flex-col justify-between rounded-3xl border-2 border-[#a36c42] bg-[#fffdf9] p-8 text-[#3b241a] shadow-[0_24px_50px_rgba(59,36,26,.15)] lg:-translate-y-2"
          style={{ backgroundColor: '#fffdf9', color: '#3b241a' }}
          data-testid="card-pricing-pro"
        >
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#e6c58e] to-[#d9ab65] px-4 py-1 text-xs font-extrabold text-[#3b241a] shadow-md">
            {t('pricing.pro.badge')}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#fdf7ef] px-3.5 py-1 text-xs font-bold text-[#a36c42]">
                {t('pricing.pro.name')}
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-[#e6c58e] text-[#3b241a]">
                <Zap size={18} />
              </span>
            </div>

            {/* Free Trial Tag */}
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e6c58e]/20 px-2.5 py-1 text-[11px] font-bold text-[#a36c42]">
              <Gift size={13} />
              <span>{lang === 'ar' ? 'أول شهر مجاناً بالكامل 🎁' : '1st Month Free Trial 🎁'}</span>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#796c63] min-h-[44px]">
              {t('pricing.pro.desc')}
            </p>

            <div className="mt-6 flex items-baseline gap-1 border-b border-[#eee5da] pb-6">
              <span className="text-2xl font-bold text-[#a36c42]">$</span>
              <span className="font-display text-5xl font-extrabold text-[#3b241a]">
                {proPriceDisplay}
              </span>
              <span className="text-xs font-semibold text-[#8c694a]">
                {periodText}
              </span>
            </div>

            {billingCycle === 'annual' && (
              <p className="mt-2 text-[11px] font-semibold text-[#a36c42]">
                {t('pricing.pro.periodAnnual')}
              </p>
            )}

            <div className="mt-6 space-y-3.5">
              <p className="text-xs font-bold text-[#3b241a]">
                {lang === 'ar' ? 'الميزات المتقدمة للباقة:' : 'Advanced plan features:'}
              </p>
              {[
                t('pricing.pro.f1'),
                t('pricing.pro.f2'),
                t('pricing.pro.f3'),
                t('pricing.pro.f4'),
                t('pricing.pro.f5'),
                t('pricing.pro.f6'),
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs leading-5 text-[#5e5048]">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#e6c58e] text-[#3b241a]">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className={i === 0 || i === 2 ? 'font-bold text-[#3b241a]' : ''}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => handleOpenSubscribe('pro')}
              className="w-full rounded-2xl bg-gradient-to-r from-[#e6c58e] to-[#d9ab65] py-3.5 text-sm font-extrabold text-[#3b241a] shadow-lg transition-all hover:brightness-105 active:scale-[0.99]"
              data-testid="btn-choose-pro"
            >
              {t('pricing.pro.cta')}
            </button>
          </div>
        </div>

        {/* Plan 3: Enterprise (Pay-as-you-go) */}
        <div
          className="relative flex flex-col justify-between rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] p-8 shadow-sm transition-all hover:border-[#c5aa8c] hover:shadow-[0_16px_35px_rgba(59,36,26,.06)]"
          data-testid="card-pricing-enterprise"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#ede3d5] px-3.5 py-1 text-xs font-bold text-[#8b674d]">
                {t('pricing.enterprise.badge')}
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632]">
                <Building2 size={18} />
              </span>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#8c694a]">
              <ScanLine size={13} />
              <span>{lang === 'ar' ? 'سعر المسح: ٢٠ سنت ($0.20) / مستند' : 'Scan: 20¢ ($0.20) / doc'}</span>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#796c63] min-h-[44px]">
              {t('pricing.enterprise.desc')}
            </p>

            <div className="mt-6 flex items-baseline gap-2 border-b border-[#eee5da] pb-6">
              <span className="font-display text-3xl font-extrabold text-[#3b241a]">
                {t('pricing.enterprise.price')}
              </span>
              <span className="text-xs font-semibold text-[#8f8176]">
                ({t('pricing.enterprise.period')})
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-[#a36c42]">
              {t('pricing.enterprise.periodAnnual')}
            </p>

            <div className="mt-6 space-y-3.5">
              <p className="text-xs font-bold text-[#3b241a]">
                {lang === 'ar' ? 'حلول مؤسسية متكاملة:' : 'Enterprise capabilities:'}
              </p>
              {[
                t('pricing.enterprise.f1'),
                t('pricing.enterprise.f2'),
                t('pricing.enterprise.f3'),
                t('pricing.enterprise.f4'),
                t('pricing.enterprise.f5'),
                t('pricing.enterprise.f6'),
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs leading-5 text-[#5e5048]">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-[#d8e2d6] text-[#31513b]">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEnterpriseModalOpen(true);
                setEntSuccess(false);
              }}
              className="w-full rounded-2xl border border-[#3b241a] bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition-all hover:bg-[#533426] hover:shadow-md"
              data-testid="btn-choose-enterprise"
            >
              {t('pricing.enterprise.cta')}
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Detailed Add-ons & Usage Breakdown Section */}
      <div className="mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">
            <HardDrive size={15} className="inline mr-1" />
            {t('pricing.addons.title')}
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
            {t('pricing.addons.subtitle')}
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Addon 1: Scan Price */}
          <div className="rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#a36c42] hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#fdf2e9] text-[#a36c42]">
                <ScanLine size={22} />
              </span>
              <div>
                <h3 className="font-bold text-[#3b241a]">{t('pricing.addon.scan.title')}</h3>
                <span className="text-xs text-[#8c694a] font-semibold">{t('pricing.addon.scan.unit')}</span>
              </div>
            </div>
            <div className="mt-5 border-y border-[#eee5da] py-3">
              <span className="font-display text-2xl font-extrabold text-[#3b241a]">
                {t('pricing.addon.scan.price')}
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#796c63]">
              {t('pricing.addon.scan.desc')}
            </p>
          </div>

          {/* Addon 2: API Usage */}
          <div className="rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#a36c42] hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#ede3d5] text-[#6b4632]">
                <Code2 size={22} />
              </span>
              <div>
                <h3 className="font-bold text-[#3b241a]">{t('pricing.addon.api.title')}</h3>
                <span className="text-xs text-[#8c694a] font-semibold">{t('pricing.addon.api.unit')}</span>
              </div>
            </div>
            <div className="mt-5 border-y border-[#eee5da] py-3">
              <span className="font-display text-2xl font-extrabold text-[#3b241a]">
                {t('pricing.addon.api.price')}
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#796c63]">
              {t('pricing.addon.api.desc')}
            </p>
          </div>

          {/* Addon 3: Cloud Vault & Security */}
          <div className="rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-sm transition hover:border-[#a36c42] hover:shadow-md">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#dce9db] text-[#447052]">
                <HardDrive size={22} />
              </span>
              <div>
                <h3 className="font-bold text-[#3b241a]">{t('pricing.addon.storage.title')}</h3>
                <span className="text-xs text-[#447052] font-semibold">{t('pricing.addon.storage.unit')}</span>
              </div>
            </div>
            <div className="mt-5 border-y border-[#eee5da] py-3">
              <span className="font-display text-2xl font-extrabold text-[#3b241a]">
                {t('pricing.addon.storage.price')}
              </span>
            </div>
            <p className="mt-3 text-xs leading-6 text-[#796c63]">
              {t('pricing.addon.storage.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Enterprise Interactive Cost Estimator */}
      <div className="mt-16 rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-7 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#a36c42]">
              <Calculator size={16} />
              {t('pricing.calc.title')}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#3b241a] sm:text-3xl">
              {lang === 'ar' ? 'حاسبة التكلفة التقديرية حسب الاستهلاك' : 'Interactive Enterprise Cost Calculator'}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#796c63]">
              {t('pricing.calc.desc')}
            </p>
          </div>

          {/* Result Card */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#ddc8aa] bg-[#fdf7ef] p-5 lg:min-w-[340px]">
            <div className="flex-1">
              <span className="block text-xs font-bold text-[#8c694a]">{t('pricing.calc.estPrice')}</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-[#3b241a]">${enterpriseEstimate.total}</span>
                <span className="text-xs text-[#796c63]">{lang === 'ar' ? '/ شهرياً' : '/ month'}</span>
              </div>
              <span className="mt-1 block text-[11px] text-[#a36c42]">
                {t('pricing.calc.unitPrice')} ${enterpriseEstimate.unitRate}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEntForm((prev) => ({ ...prev, volume: String(calcDocs) }));
                setIsEnterpriseModalOpen(true);
                setEntSuccess(false);
              }}
              className="rounded-xl bg-[#3b241a] px-4 py-2.5 text-xs font-bold text-[#fffdf9] transition hover:bg-[#533426]"
            >
              {lang === 'ar' ? 'طلب عرض رسمي' : 'Get Quote'}
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm font-bold text-[#3b241a]">
            <span>100 {t('pricing.calc.docs')} ($0.20/doc)</span>
            <span className="rounded-full bg-[#3b241a] px-3.5 py-1 text-xs text-[#fffdf9]">
              {calcDocs.toLocaleString()} {t('pricing.calc.docs')}
            </span>
            <span>10,000+ {t('pricing.calc.docs')} ($0.08/doc)</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={calcDocs}
            onChange={(e) => setCalcDocs(Number(e.target.value))}
            className="mt-4 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-[#ede3d5] accent-[#a36c42]"
            data-testid="input-enterprise-slider"
          />
        </div>
      </div>

      {/* Full Feature Comparison Table */}
      <div className="mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">
            <Layers size={14} className="inline mr-1" />
            {t('pricing.compare.title')}
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
            {t('pricing.compare.subtitle')}
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-[#e1d3c2] bg-[#fffdf9] shadow-sm">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="border-b border-[#e4d8c9] bg-[#f7f2ea]">
                <th className="p-5 text-sm font-bold text-[#3b241a] sm:w-1/3">
                  {t('pricing.compare.feature')}
                </th>
                <th className="p-5 text-center text-sm font-bold text-[#3b241a]">
                  {t('pricing.compare.basic')}
                </th>
                <th className="p-5 text-center text-sm font-bold text-[#a36c42] bg-[#f3d8aa]/20">
                  {t('pricing.compare.pro')} ⭐
                </th>
                <th className="p-5 text-center text-sm font-bold text-[#3b241a]">
                  {t('pricing.compare.enterprise')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee5da] text-xs sm:text-sm">
              {/* Category 1: Trial & Documents */}
              <tr className="bg-[#ede3d5]/40 font-bold text-[#8b674d]">
                <td colSpan={4} className="px-5 py-3 text-xs tracking-wider uppercase">
                  {t('pricing.compare.secDocs')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.trial')}
                </td>
                <td className="p-5 text-center font-bold text-[#447052]">{t('pricing.compare.trial.basic')}</td>
                <td className="p-5 text-center font-bold text-[#447052] bg-[#f3d8aa]/10">
                  {t('pricing.compare.trial.pro')}
                </td>
                <td className="p-5 text-center font-bold text-[#a36c42]">
                  {t('pricing.compare.trial.ent')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.docLimit')}
                </td>
                <td className="p-5 text-center font-bold text-[#3b241a]">{t('pricing.compare.docLimit.basic')}</td>
                <td className="p-5 text-center font-bold text-[#3b241a] bg-[#f3d8aa]/10">
                  {t('pricing.compare.docLimit.pro')}
                </td>
                <td className="p-5 text-center font-bold text-[#a36c42]">
                  {t('pricing.compare.docLimit.ent')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {lang === 'ar' ? 'سعر المسح الإضافي (Extra Scan)' : 'Extra Scan Price'}
                </td>
                <td className="p-5 text-center text-[#5e5048]">٢٠ سنت ($0.20)</td>
                <td className="p-5 text-center font-bold text-[#3b241a] bg-[#f3d8aa]/10">٢٠ سنت ($0.20)</td>
                <td className="p-5 text-center font-bold text-[#a36c42]">يبدأ من 20¢ وتنازلي</td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {lang === 'ar' ? 'استخراج البنود الحساسة' : 'Sensitive Clause Extraction'}
                </td>
                <td className="p-5 text-center"><Check size={18} className="mx-auto text-[#447052]" /></td>
                <td className="p-5 text-center bg-[#f3d8aa]/10"><Check size={18} className="mx-auto text-[#447052]" /></td>
                <td className="p-5 text-center"><Check size={18} className="mx-auto text-[#447052]" /></td>
              </tr>

              {/* Category 2: Ask & Tools */}
              <tr className="bg-[#ede3d5]/40 font-bold text-[#8b674d]">
                <td colSpan={4} className="px-5 py-3 text-xs tracking-wider uppercase">
                  {t('pricing.compare.secAsk')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.askLimit')}
                </td>
                <td className="p-5 text-center font-bold text-[#3b241a]">{t('pricing.compare.askLimit.basic')}</td>
                <td className="p-5 text-center font-bold text-[#3b241a] bg-[#f3d8aa]/10">
                  {t('pricing.compare.askLimit.pro')}
                </td>
                <td className="p-5 text-center font-bold text-[#a36c42]">
                  {t('pricing.compare.askLimit.ent')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.pdfExport')}
                </td>
                <td className="p-5 text-center text-[#95877d]">—</td>
                <td className="p-5 text-center bg-[#f3d8aa]/10"><Check size={18} className="mx-auto text-[#447052]" /></td>
                <td className="p-5 text-center"><Check size={18} className="mx-auto text-[#447052]" /></td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {lang === 'ar' ? 'التخزين السحابي والتأمين' : 'Cloud Storage & Vault'}
                </td>
                <td className="p-5 text-center text-[#5e5048]">{lang === 'ar' ? 'سجل أساسي (30 يوماً)' : '30 Days History'}</td>
                <td className="p-5 text-center font-bold text-[#3b241a] bg-[#f3d8aa]/10">
                  {lang === 'ar' ? 'أرشفة دائمة' : 'Permanent Archive'}
                </td>
                <td className="p-5 text-center font-bold text-[#a36c42]">
                  {lang === 'ar' ? 'خزينة مشفرة AES-256' : 'AES-256 Secure Vault'}
                </td>
              </tr>

              {/* Category 3: Integration & Enterprise */}
              <tr className="bg-[#ede3d5]/40 font-bold text-[#8b674d]">
                <td colSpan={4} className="px-5 py-3 text-xs tracking-wider uppercase">
                  {t('pricing.compare.secSupport')}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.apiAccess')}
                </td>
                <td className="p-5 text-center text-[#95877d]">—</td>
                <td className="p-5 text-center text-[#95877d] bg-[#f3d8aa]/10">—</td>
                <td className="p-5 text-center"><Check size={18} className="mx-auto text-[#447052]" /></td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.teamSeats')}
                </td>
                <td className="p-5 text-center text-[#5e5048]">{lang === 'ar' ? 'مستخدم واحد' : '1 User'}</td>
                <td className="p-5 text-center text-[#5e5048] bg-[#f3d8aa]/10">{lang === 'ar' ? 'مستخدم واحد' : '1 User'}</td>
                <td className="p-5 text-center font-bold text-[#a36c42]">
                  {lang === 'ar' ? 'غير محدود للفرق' : 'Unlimited Multi-Seat'}
                </td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.customAi')}
                </td>
                <td className="p-5 text-center text-[#95877d]">—</td>
                <td className="p-5 text-center text-[#95877d] bg-[#f3d8aa]/10">—</td>
                <td className="p-5 text-center"><Check size={18} className="mx-auto text-[#447052]" /></td>
              </tr>
              <tr>
                <td className="p-5 font-semibold text-[#3b241a]">
                  {t('pricing.compare.supportLevel')}
                </td>
                <td className="p-5 text-center text-[#5e5048]">{t('pricing.compare.support.basic')}</td>
                <td className="p-5 text-center font-bold text-[#3b241a] bg-[#f3d8aa]/10">{t('pricing.compare.support.pro')}</td>
                <td className="p-5 text-center font-bold text-[#a36c42]">{t('pricing.compare.support.ent')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">
            <HelpCircle size={15} className="inline mr-1" />
            {t('pricing.faq.title')}
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
            {t('pricing.faq.subtitle')}
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {[
            { q: t('pricing.faq.q1'), a: t('pricing.faq.a1') },
            { q: t('pricing.faq.q2'), a: t('pricing.faq.a2') },
            { q: t('pricing.faq.q3'), a: t('pricing.faq.a3') },
            { q: t('pricing.faq.q4'), a: t('pricing.faq.a4') },
          ].map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-[#e1d3c2] bg-[#fffdf9] transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-5 text-right font-bold text-[#3b241a] transition hover:bg-[#faf4ec]"
                  data-testid={`faq-item-button-${index}`}
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    size={19}
                    className={`shrink-0 text-[#a36c42] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[#f0e4d6] bg-[#fdfbf7] p-5 text-xs sm:text-sm leading-7 text-[#796c63]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-20 rounded-[2rem] border border-[#ddc8aa] bg-[#f1e1c8] p-8 text-center sm:p-12">
        <div className="mx-auto max-w-2xl">
          <span className="grid size-12 mx-auto place-items-center rounded-2xl bg-[#3b241a] text-[#e6c58e]">
            <ShieldCheck size={24} />
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold text-[#3b241a] sm:text-3xl">
            {lang === 'ar' ? 'ضمان الأمان والخصوصية بنسبة ١٠٠٪' : '100% Privacy & Security Guaranteed'}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#80654f]">
            {lang === 'ar'
              ? 'نحن نحترم سرية أوراقك وعقودك. جميع التحليلات تتم وفق معايير تشفير مشددة، ولا يتم مشاركة أي محتوى مع أطراف ثالثة. يمكنك تجربة المنصة مجاناً لمدة شهر بثقة تامة.'
              : 'Your documents and contract data remain strictly confidential with end-to-end encryption. Try our 1-month free trial with full confidence.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => handleOpenSubscribe('pro')}
              className="rounded-xl bg-[#3b241a] px-6 py-3 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426]"
            >
              {lang === 'ar' ? 'ابدأ شهرك المجاني الآن (باقة ٤$)' : 'Start 1-Month Free Trial (Pro $4)'}
            </button>
            <Button href="/services" variant="secondary">
              {lang === 'ar' ? 'استكشف الخدمات المجانية' : 'Explore Free Services'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal 1: Subscribe / Checkout Modal */}
      {selectedPlanForSubscribe && (
        <div dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-2xl sm:p-8"
            data-testid="modal-subscription-checkout"
          >
            <button
              type="button"
              onClick={() => setSelectedPlanForSubscribe(null)}
              className="absolute left-5 top-5 grid size-9 place-items-center rounded-full bg-[#ede3d5] text-[#6b4632] hover:bg-[#3b241a] hover:text-[#fffdf9]"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!subscribeSuccess ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#dce9db] px-2.5 py-0.5 text-xs font-bold text-[#447052]">
                    {lang === 'ar' ? 'شهر مجاني 🎁' : '1 Month Free Trial 🎁'}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-[#3b241a]">
                  {selectedPlanForSubscribe === 'starter' ? t('pricing.starter.name') : t('pricing.pro.name')}
                </h2>
                
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#ede3d5]/60 p-3.5 text-sm font-bold text-[#3b241a]">
                  <span>
                    {selectedPlanForSubscribe === 'starter'
                      ? (billingCycle === 'monthly' ? '$2 / ' + t('pricing.starter.period') : '$20 / ' + t('pricing.billing.annual'))
                      : (billingCycle === 'monthly' ? '$4 / ' + t('pricing.pro.period') : '$40 / ' + t('pricing.billing.annual'))}
                  </span>
                  <span className="rounded-md bg-[#e6c58e] px-2 py-0.5 text-xs text-[#3b241a]">
                    {lang === 'ar' ? 'يبدأ الخصم بعد ٣٠ يوماً' : 'Billed after 30 days'}
                  </span>
                </div>

                {/* Trial Explanation note */}
                <p className="mt-2 text-xs leading-5 text-[#8c694a] bg-[#fdf7ef] p-2.5 rounded-xl border border-[#edd8be]">
                  {lang === 'ar'
                    ? '✨ ستحصل على ٣٠ يوماً مجاناً لتجربة كافة المميزات. يمكنك إلغاء الاشتراك في أي وقت قبل انتهاء الشهر دون أي خصم.'
                    : '✨ You get 30 days completely free to experience all features. You can cancel anytime before the trial ends without being charged.'}
                </p>

                {/* Payment Methods Selector */}
                <div className="mt-5">
                  <label className="block text-xs font-bold text-[#5e5048]">
                    {t('pricing.modal.paymentSelect')}
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'card'
                          ? 'border-[#a36c42] bg-[#fdf7ef] text-[#3b241a] shadow-sm'
                          : 'border-[#ddcdbb] bg-[#fffdf9] text-[#796c63]'
                      }`}
                    >
                      <CreditCard size={18} className="text-[#a36c42]" />
                      <span>{lang === 'ar' ? 'بطاقة بنكية' : 'Card'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'wallet'
                          ? 'border-[#a36c42] bg-[#fdf7ef] text-[#3b241a] shadow-sm'
                          : 'border-[#ddcdbb] bg-[#fffdf9] text-[#796c63]'
                      }`}
                    >
                      <Smartphone size={18} className="text-[#a36c42]" />
                      <span>{lang === 'ar' ? 'فودافون كاش' : 'Wallet'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fawry')}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                        paymentMethod === 'fawry'
                          ? 'border-[#a36c42] bg-[#fdf7ef] text-[#3b241a] shadow-sm'
                          : 'border-[#ddcdbb] bg-[#fffdf9] text-[#796c63]'
                      }`}
                    >
                      <QrCode size={18} className="text-[#a36c42]" />
                      <span>{lang === 'ar' ? 'فوري / ميزة' : 'Fawry'}</span>
                    </button>
                  </div>
                </div>

                {/* Form fields based on selected payment */}
                <form onSubmit={handleExecuteSubscribe} className="mt-4 space-y-3.5">
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#5e5048]">
                          {t('pricing.modal.cardName')}
                        </label>
                        <input
                          required
                          type="text"
                          placeholder={lang === 'ar' ? 'محمد أحمد علي' : 'Mohamed Ahmed'}
                          className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#5e5048]">
                          {t('pricing.modal.cardNumber')}
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={19}
                          placeholder="4123 •••• •••• 9821"
                          className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#5e5048]">
                            {t('pricing.modal.expDate')}
                          </label>
                          <input
                            required
                            type="text"
                            maxLength={5}
                            placeholder="12/28"
                            className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#5e5048]">
                            {t('pricing.modal.cvv')}
                          </label>
                          <input
                            required
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div>
                      <label className="block text-xs font-bold text-[#5e5048]">
                        {t('pricing.modal.walletNumber')}
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="01012345678"
                        className="mt-1 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                      />
                      <p className="mt-2 text-[11px] text-[#796c63]">
                        {lang === 'ar'
                          ? 'سيتم تفعيل الشهر المجاني وتأكيد وسيلة الدفع عبر رسالة نصية.'
                          : 'Your free trial will be activated and confirmed via mobile SMS.'}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'fawry' && (
                    <div className="rounded-xl border border-dashed border-[#a36c42] bg-[#fdf7ef] p-4 text-center">
                      <QrCode size={36} className="mx-auto text-[#a36c42]" />
                      <p className="mt-2 font-mono text-sm font-bold text-[#3b241a]">
                        FAWRY-FREE-TRIAL-882
                      </p>
                      <p className="mt-1 text-xs text-[#796c63]">
                        {lang === 'ar'
                          ? 'كود التفعيل التجريبي المجاني لمدة شهر عبر منافذ فوري أو محفظة ميزة.'
                          : 'Use this code to activate your 1-month trial with Fawry/Meeza.'}
                      </p>
                    </div>
                  )}

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426] disabled:opacity-75 shadow-md"
                    >
                      {isSubscribing ? (
                        <span>{t('pricing.modal.btnProcessing')}</span>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>{lang === 'ar' ? 'تفعيل الشهر المجاني وبدء الاستخدام' : 'Activate 1-Month Free Trial'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success confirmation */
              <div className="py-6 text-center">
                <span className="grid size-16 mx-auto place-items-center rounded-2xl bg-[#dce9db] text-[#447052]">
                  <CheckCircle2 size={36} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-[#3b241a]">
                  {lang === 'ar' ? 'تم تفعيل شهرك المجاني بنجاح! 🎁' : 'Your Free Month is Active! 🎁'}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#796c63]">
                  {t('pricing.modal.successDesc', {
                    '0': selectedPlanForSubscribe === 'starter' ? t('pricing.starter.name') : t('pricing.pro.name'),
                  })}
                </p>
                <div className="mt-8 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForSubscribe(null);
                      navigate('/analyze');
                    }}
                    className="w-full rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426]"
                  >
                    {lang === 'ar' ? 'ابدأ بتحليل أول مستند الآن' : 'Analyze your first document now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForSubscribe(null);
                      navigate('/dashboard');
                    }}
                    className="w-full rounded-xl border border-[#ddcdbb] py-3 text-xs font-bold text-[#6b4632] hover:bg-[#ede3d5]"
                  >
                    {t('pricing.modal.btnDashboard')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Enterprise Quote / Contact Modal */}
      {isEnterpriseModalOpen && (
        <div dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#e1d3c2] bg-[#fffdf9] p-6 shadow-2xl sm:p-8"
            data-testid="modal-enterprise-quote"
          >
            <button
              type="button"
              onClick={() => setIsEnterpriseModalOpen(false)}
              className="absolute left-5 top-5 grid size-9 place-items-center rounded-full bg-[#ede3d5] text-[#6b4632] hover:bg-[#3b241a] hover:text-[#fffdf9]"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {!entSuccess ? (
              <div>
                <span className="text-xs font-bold text-[#a36c42]">
                  {t('pricing.enterprise.badge')}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#3b241a]">
                  {t('pricing.modal.entTitle')}
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#796c63]">
                  {t('pricing.modal.entDesc')}
                </p>

                <form onSubmit={handleExecuteEnterpriseSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {t('pricing.modal.entName')} *
                    </label>
                    <input
                      required
                      type="text"
                      value={entForm.company}
                      onChange={(e) => setEntForm({ ...entForm, company: e.target.value })}
                      placeholder={lang === 'ar' ? 'شركة النيل للحلول القانونية' : 'Nile Legal Solutions'}
                      className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#5e5048]">
                        {t('pricing.modal.entContact')} *
                      </label>
                      <input
                        required
                        type="text"
                        value={entForm.contact}
                        onChange={(e) => setEntForm({ ...entForm, contact: e.target.value })}
                        placeholder={lang === 'ar' ? 'أحمد الشافعي' : 'Ahmed'}
                        className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5e5048]">
                        {t('pricing.modal.entPhone')} *
                      </label>
                      <input
                        required
                        type="tel"
                        value={entForm.phone}
                        onChange={(e) => setEntForm({ ...entForm, phone: e.target.value })}
                        placeholder="+20 100 000 0000"
                        className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {t('pricing.modal.entEmail')} *
                    </label>
                    <input
                      required
                      type="email"
                      value={entForm.email}
                      onChange={(e) => setEntForm({ ...entForm, email: e.target.value })}
                      placeholder="name@company.com"
                      className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {t('pricing.modal.entVolume')}
                    </label>
                    <input
                      type="text"
                      value={entForm.volume}
                      onChange={(e) => setEntForm({ ...entForm, volume: e.target.value })}
                      placeholder="e.g. 500 - 2000"
                      className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5e5048]">
                      {t('pricing.modal.entNotes')}
                    </label>
                    <textarea
                      rows={3}
                      value={entForm.notes}
                      onChange={(e) => setEntForm({ ...entForm, notes: e.target.value })}
                      placeholder={lang === 'ar' ? 'نرغب في ربط واجهة API بفريق الموارد البشرية مع أرشفة مشفرة...' : 'We need API integration for HR contract review & cloud vault...'}
                      className="mt-1.5 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-sm text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isEntSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426] disabled:opacity-75"
                    >
                      {isEntSubmitting ? (
                        <span>{lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</span>
                      ) : (
                        <span>{t('pricing.modal.entSubmit')}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success message */
              <div className="py-6 text-center">
                <span className="grid size-16 mx-auto place-items-center rounded-2xl bg-[#dce9db] text-[#447052]">
                  <CheckCircle2 size={36} />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold text-[#3b241a]">
                  {t('pricing.modal.entSuccessTitle')}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#796c63]">
                  {t('pricing.modal.entSuccessDesc')}
                </p>
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEnterpriseModalOpen(false)}
                    className="w-full rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426]"
                  >
                    {lang === 'ar' ? 'حسناً، تم' : 'Close'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
