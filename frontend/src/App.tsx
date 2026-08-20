import { type ChangeEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowLeft, ArrowUpLeft, Bell, BookOpen, BriefcaseBusiness, Building2, Check,
  ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, FileCheck2,
  FileText, FolderOpen, Globe, Home as HomeIcon, Info, Landmark, Lightbulb, ListFilter,
  LockKeyhole, Menu, MessageCircleQuestion, Paperclip, Search, ShieldCheck,
  Sparkles, UploadCloud, UserRound, X, type LucideIcon,
} from 'lucide-react';
import {
  Link, Route, Switch, Router as WouterRouter, useLocation, useParams,
} from 'wouter';
import { AnalysisProvider } from '@/lib/analysis-store';
import { LanguageProvider, useLanguage, formatToday } from '@/lib/i18n';
import { Button, ArrowRightIcon } from '@/lib/ui';
import { AnalyzePage } from '@/pages/AnalyzePage';
import { ContractPage } from '@/pages/ContractPage';
import { AskPage } from '@/pages/AskPage';

const queryClient = new QueryClient();

type Service = {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  description: string;
  time: string;
  location: string;
  color: string;
  requirements: string[];
  steps: string[];
  en: {
    title: string;
    category: string;
    description: string;
    time: string;
    location: string;
    requirements: string[];
    steps: string[];
  };
};

const services: Service[] = [
  {
    id: 'national-id',
    title: 'استخراج بطاقة الرقم القومي',
    category: 'الأحوال المدنية',
    categoryId: 'civil',
    description: 'اعرف الأوراق المطلوبة والخطوات قبل ما تروح السجل المدني.',
    time: 'من ٧ إلى ١٥ يوم عمل',
    location: 'السجل المدني التابع لمحل الإقامة',
    color: 'sand',
    requirements: ['بطاقة الرقم القومي القديمة أو شهادة الميلاد المميكنة', 'إيصال مرافق حديث', 'استمارة بطاقة رقم قومي'],
    steps: ['شراء الاستمارة وملء البيانات', 'تقديم المستندات والتصوير في السجل المدني', 'استلام البطاقة في الموعد المحدد'],
    en: {
      title: 'Get a national ID card',
      category: 'Civil affairs',
      description: 'Know the required papers and steps before visiting the civil registry.',
      time: '7 to 15 working days',
      location: 'The civil registry of your place of residence',
      requirements: ['Old national ID card or digitized birth certificate', 'Recent utility bill', 'National ID application form'],
      steps: ['Buy the form and fill in the details', 'Submit the documents and take photos at the civil registry', 'Collect the card on the scheduled date'],
    },
  },
  {
    id: 'birth-certificate',
    title: 'استخراج شهادة ميلاد مميكنة',
    category: 'الأحوال المدنية',
    categoryId: 'civil',
    description: 'دليل سريع لاستخراج شهادة الميلاد المميكنة لأول مرة أو بدل فاقد.',
    time: 'في نفس اليوم غالباً',
    location: 'مكاتب السجل المدني أو بوابة مصر الرقمية',
    color: 'mint',
    requirements: ['بطاقة الرقم القومي لمقدم الطلب', 'بيانات صاحب الشهادة كاملة', 'إثبات صلة القرابة عند الطلب نيابةً عن شخص آخر'],
    steps: ['تقديم طلب استخراج الشهادة', 'مراجعة البيانات ودفع الرسوم', 'استلام الشهادة المطبوعة'],
    en: {
      title: 'Get a digitized birth certificate',
      category: 'Civil affairs',
      description: 'A quick guide to getting a digitized birth certificate, whether first time or replacement.',
      time: 'Usually the same day',
      location: 'Civil registry offices or the Egypt Digital Portal',
      requirements: ['National ID card of the applicant', 'Complete details of the certificate holder', 'Proof of kinship when applying on behalf of someone else'],
      steps: ['Submit a request to extract the certificate', 'Review the data and pay the fees', 'Receive the printed certificate'],
    },
  },
  {
    id: 'real-estate',
    title: 'تسجيل شقة في الشهر العقاري',
    category: 'العقارات',
    categoryId: 'realestate',
    description: 'خريطة المستندات الأساسية لفهم طريق تسجيل الملكية.',
    time: 'يختلف حسب حالة العقار',
    location: 'مأمورية الشهر العقاري المختصة',
    color: 'rose',
    requirements: ['سند الملكية وتسلسل الملكية', 'بيان رفع مساحي أو نموذج ١٠', 'بطاقات الرقم القومي للأطراف', 'إيصال سداد الرسوم المقررة'],
    steps: ['تجهيز المستندات ومراجعة موقف العقار', 'تقديم الطلب في المأمورية المختصة', 'متابعة الطلب حتى تحرير المحرر واستلامه'],
    en: {
      title: 'Register an apartment at the real estate registry',
      category: 'Real estate',
      description: 'A map of the basic documents to understand the path to registering ownership.',
      time: 'Varies depending on the property status',
      location: 'The competent real estate registry office',
      requirements: ['Ownership deed and chain of title', 'Survey report or form 10', 'National ID cards of the parties', 'Receipt of the due fees'],
      steps: ['Prepare the documents and check the property status', 'Submit the application at the competent office', 'Follow up until the deed is drafted and received'],
    },
  },
  {
    id: 'passport',
    title: 'استخراج جواز سفر لأول مرة',
    category: 'السفر',
    categoryId: 'travel',
    description: 'اعرف ما تحتاجه لاستخراج جواز سفرك المصري دون مشوار ناقص.',
    time: 'من ٣ إلى ٧ أيام عمل',
    location: 'قسم الجوازات التابع لمحل الإقامة',
    color: 'lilac',
    requirements: ['بطاقة رقم قومي سارية', '٣ صور شخصية حديثة بخلفية بيضاء', 'الموقف من التجنيد للذكور', 'المؤهل الدراسي عند الحاجة'],
    steps: ['حجز أو التوجه إلى قسم الجوازات', 'تقديم الطلب والمستندات ودفع الرسوم', 'استلام الجواز بعد المراجعة'],
    en: {
      title: 'Get a passport for the first time',
      category: 'Travel',
      description: 'Know what you need to get your Egyptian passport without an incomplete trip.',
      time: '3 to 7 working days',
      location: 'The passport office of your place of residence',
      requirements: ['Valid national ID card', '3 recent personal photos with a white background', 'Military status for males', 'Educational qualification when needed'],
      steps: ['Book or go to the passport office', 'Submit the application and documents and pay the fees', 'Collect the passport after review'],
    },
  },
  {
    id: 'traffic-license',
    title: 'تجديد رخصة السيارة',
    category: 'المرور',
    categoryId: 'traffic',
    description: 'قائمة مرتبة بما تحتاجه لتجديد رخصة تسيير سيارتك.',
    time: 'في يوم واحد عند اكتمال الأوراق',
    location: 'وحدة المرور التابعة لمحل الإقامة',
    color: 'peach',
    requirements: ['رخصة السيارة السابقة', 'بطاقة رقم قومي سارية', 'شهادة براءة ذمة', 'وثيقة التأمين الإجباري'],
    steps: ['سداد المخالفات والتأمين', 'الفحص الفني إذا لزم', 'استلام الرخصة الجديدة'],
    en: {
      title: 'Renew your car license',
      category: 'Traffic',
      description: 'An organized list of what you need to renew your car registration license.',
      time: 'One day when the papers are complete',
      location: 'The traffic unit of your place of residence',
      requirements: ['Previous car license', 'Valid national ID card', 'Clearance certificate', 'Compulsory insurance document'],
      steps: ['Pay fines and insurance', 'Technical inspection if needed', 'Receive the new license'],
    },
  },
];

const categoryOptions = ['all', 'civil', 'realestate', 'travel', 'traffic'];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
      <span className={`grid size-10 place-items-center rounded-2xl ${light ? 'bg-[#f3d8aa] text-[#3b241a]' : 'bg-[#3b241a] text-[#f7f2ea]'}`}>
        <span className="font-display text-xl font-bold">د</span>
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-[#fffdf9]' : 'text-[#3b241a]'}`}>دليل</span>
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, dir, toggleLang, lang } = useLanguage();
  const nav = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: HomeIcon },
    { href: '/services', label: t('nav.services'), icon: Landmark },
    { href: '/analyze', label: t('nav.analyze'), icon: FileCheck2 },
    { href: '/ask', label: t('nav.ask'), icon: MessageCircleQuestion },
  ];
  return (
    <div dir={dir} className="dalil-noise min-h-[100dvh] bg-[#f7f2ea] text-[#241812]">
      <header className="sticky top-0 z-40 border-b border-[#e4d8c9] bg-[#f7f2ea]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href === '/services' && location.startsWith('/services/'));
              return (
                <Link key={item.href} href={item.href} data-testid={`link-nav-${item.href.slice(1)}`}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${active ? 'bg-[#3b241a] text-[#fffdf9] shadow-[0_6px_20px_rgba(59,36,26,.14)]' : 'text-[#796c63] hover:bg-[#ede3d5] hover:text-[#3b241a]'}`}>
                  <Icon size={16} strokeWidth={1.8} />{item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleLang} className="flex items-center gap-1.5 rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 py-2 text-xs font-bold text-[#6b4632] transition hover:border-[#a36c42] hover:bg-[#fdf7ef]" data-testid="button-toggle-lang" aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
              <Globe size={15} />{t('lang.switch')}
            </button>
            <button type="button" className="hidden rounded-xl p-2.5 text-[#796c63] transition hover:bg-[#ede3d5] hover:text-[#3b241a] sm:block" data-testid="button-notifications" aria-label={t('aria.notifications')}>
              <Bell size={19} strokeWidth={1.8} />
            </button>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="rounded-xl p-2.5 text-[#3b241a] hover:bg-[#ede3d5] md:hidden" data-testid="button-mobile-menu" aria-label={t('aria.menu')}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            <Link href="/dashboard" className="hidden size-10 place-items-center rounded-full bg-[#e6c58e] text-sm font-bold text-[#3b241a] sm:grid" data-testid="link-profile">{lang === 'ar' ? 'م' : 'M'}</Link>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-[#e4d8c9] bg-[#fffdf9] px-5 py-3 md:hidden">
            {nav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#3b241a]" data-testid={`link-mobile-${item.href.slice(1)}`}><Icon size={18} />{item.label}</Link>; })}
            <button type="button" onClick={toggleLang} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#3b241a]" data-testid="link-mobile-lang"><Globe size={18} />{t('lang.switch')}</button>
          </nav>
        )}
      </header>
      <main className="page-enter">{children}</main>
      <nav className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-4 rounded-2xl border border-[#dfd0bd] bg-[#fffdf9]/95 p-2 shadow-[0_12px_40px_rgba(59,36,26,.14)] backdrop-blur md:hidden">
        {nav.map((item) => { const Icon = item.icon; const active = location === item.href; return <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold ${active ? 'bg-[#3b241a] text-[#fffdf9]' : 'text-[#796c63]'}`} data-testid={`link-bottom-${item.href.slice(1)}`}><Icon size={17} />{item.label}</Link>; })}
      </nav>
    </div>
  );
}


function SectionIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <div className="mb-10 max-w-2xl"><span className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[.16em] text-[#a36c42]"><span className="size-1.5 rounded-full bg-[#d9ab65]" />{eyebrow}</span><h2 className="font-display text-3xl font-bold leading-[1.2] text-[#3b241a] sm:text-4xl">{title}</h2>{body && <p className="mt-4 text-base leading-8 text-[#796c63]">{body}</p>}</div>;
}

function Home() {
  const { t, dir, lang } = useLanguage();
  return (
    <div dir={dir}>
      <section className="relative overflow-hidden border-b border-[#e4d8c9]">
        <div className="absolute -left-24 -top-20 size-80 rounded-full bg-[#ecd5ae]/35 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:pb-28">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fffdf9] px-3.5 py-2 text-xs font-bold text-[#6b4632] shadow-sm"><ShieldCheck size={15} /> {t('hero.badge')}</div>
            <h1 className="font-display text-[clamp(2.9rem,7vw,6.4rem)] font-bold leading-[1.08] tracking-[-.05em] text-[#3b241a]">{t('hero.h1a')}<br /><span className="text-[#a36c42]">{t('hero.h1b')}</span></h1>
            <p className="mt-7 max-w-lg text-lg leading-9 text-[#796c63]">{t('hero.body')}</p>
            <div className="mt-9 flex flex-wrap gap-3"><Button href="/analyze" testId="button-hero-analyze">{t('hero.cta1')} <ArrowLeft size={17} /></Button><Button href="/services" variant="secondary" testId="button-hero-services">{t('hero.cta2')} <ChevronLeft size={17} /></Button></div>
            <div className="mt-9 flex items-center gap-6 text-xs font-semibold text-[#8f8176]"><span className="flex items-center gap-2"><LockKeyhole size={15} /> {t('hero.priv')}</span><span className="flex items-center gap-2"><BookOpen size={15} /> {t('hero.simple')}</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -right-5 top-10 size-24 rounded-full border border-[#d9ab65]/50" /><div className="absolute -left-5 bottom-12 size-16 rounded-full border border-[#d9ab65]/40" />
            <div className="relative overflow-hidden rounded-[2rem] border border-[#dfcbb0] bg-[#3b241a] p-4 shadow-[0_28px_70px_rgba(59,36,26,.2)]">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#513426] p-6 text-[#fffdf9]">
                <div className="flex items-start justify-between"><div><p className="text-xs text-[#e6c58e]">{t('hero.card.label')}</p><h3 className="mt-2 text-xl font-bold">{t('hero.card.title')}</h3></div><FileCheck2 className="text-[#e6c58e]" size={26} strokeWidth={1.5} /></div>
                <div className="mt-9 space-y-3">
                  <div className="rounded-xl bg-white/10 p-3.5"><div className="flex items-center justify-between text-sm"><span>{t('hero.card.review')}</span><span className="rounded-full bg-[#e6c58e] px-2 py-1 text-[10px] font-bold text-[#3b241a]">{t('hero.card.points')}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[76%] rounded-full bg-[#e6c58e]" /></div></div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3.5"><span className="grid size-8 place-items-center rounded-lg bg-[#d9ab65]/20 text-[#e6c58e]"><Lightbulb size={16} /></span><p className="text-xs leading-6 text-[#ebdfd2]">{t('hero.card.tip')}</p></div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#d6c2b0]"><span>{t('hero.card.demo')}</span><Sparkles size={15} className="text-[#e6c58e]" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><SectionIntro eyebrow={t('steps.eyebrow')} title={t('steps.title')} body={t('steps.body')} /><div className="grid gap-4 md:grid-cols-3">
        {[{ n: lang === 'ar' ? '٠١' : '01', icon: UploadCloud, title: t('step1.title'), body: t('step1.body') }, { n: lang === 'ar' ? '٠٢' : '02', icon: BookOpen, title: t('step2.title'), body: t('step2.body') }, { n: lang === 'ar' ? '٠٣' : '03', icon: ClipboardCheck, title: t('step3.title'), body: t('step3.body') }].map((step) => { const Icon = step.icon; return <div key={step.n} className="group rounded-2xl border border-[#e1d3c2] bg-[#fffdf9] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(59,36,26,.08)]"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#c0925d]">{step.n}</span><span className="grid size-11 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632] transition group-hover:bg-[#3b241a] group-hover:text-[#fffdf9]"><Icon size={20} /></span></div><h3 className="mt-7 text-lg font-bold text-[#3b241a]">{step.title}</h3><p className="mt-2 leading-7 text-[#796c63]">{step.body}</p></div>; })}</div></section>
      <section className="bg-[#ede3d5]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-24"><div><SectionIntro eyebrow={t('explore.eyebrow')} title={t('explore.title')} body={t('explore.body')} /><Button href="/services" testId="button-home-explore">{t('explore.cta')} <ArrowLeft size={17} /></Button></div><div className="grid gap-3 sm:grid-cols-2">{services.slice(0, 4).map((service) => <Link href={`/services/${service.id}`} key={service.id} className="group flex items-center justify-between rounded-2xl border border-[#ddcbb7] bg-[#fffdf9]/75 p-5 transition hover:-translate-y-0.5 hover:bg-[#fffdf9]" data-testid={`card-home-service-${service.id}`}><div><p className="text-xs font-semibold text-[#a36c42]">{lang === 'ar' ? service.category : service.en.category}</p><h3 className="mt-2 font-bold text-[#3b241a]">{lang === 'ar' ? service.title : service.en.title}</h3></div><ChevronLeft size={19} className="text-[#a36c42] transition group-hover:-translate-x-1" /></Link>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-28"><div className="mx-auto max-w-2xl"><span className="text-4xl text-[#c0925d]">{t('brand.letter')}</span><h2 className="mt-4 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">{t('trust.title')}</h2><p className="mt-4 leading-8 text-[#796c63]">{t('trust.body')}</p><Button href="/dashboard" className="mt-7" testId="button-home-dashboard">{t('trust.cta')} <ArrowLeft size={17} /></Button></div></section>
    </div>
  );
}

function Dashboard() {
  const { t, lang } = useLanguage();
  const actions: { title: string; body: string; href: string; icon: LucideIcon; tone: string }[] = [
    { title: t('dash.action1.title'), body: t('dash.action1.body'), href: '/analyze', icon: FileCheck2, tone: 'bg-[#3b241a] text-[#fffdf9]' },
    { title: t('dash.action2.title'), body: t('dash.action2.body'), href: '/services', icon: Landmark, tone: 'bg-[#e6c58e] text-[#3b241a]' },
    { title: t('dash.action3.title'), body: t('dash.action3.body'), href: '/ask', icon: MessageCircleQuestion, tone: 'bg-[#d8e2d6] text-[#31513b]' },
  ];
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold text-[#a36c42]">{formatToday(lang)}</p><h1 className="mt-2 font-display text-4xl font-bold text-[#3b241a] sm:text-5xl">{t('dash.greeting')}</h1><p className="mt-3 text-[#796c63]">{t('dash.sub')}</p></div><div className="hidden items-center gap-3 rounded-2xl border border-[#e1d3c2] bg-[#fffdf9] px-4 py-3 text-sm text-[#796c63] sm:flex"><span className="grid size-8 place-items-center rounded-full bg-[#e6c58e] text-[#3b241a]"><UserRound size={16} /></span> {t('dash.account')}</div></div>
    <div className="mt-10 grid gap-4 md:grid-cols-3">{actions.map((action) => { const Icon = action.icon; return <Link key={action.href} href={action.href} className={`group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(59,36,26,.12)] ${action.tone}`} data-testid={`card-dashboard-${action.href.slice(1)}`}><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-white/15"><Icon size={21} /></span><ArrowUpLeft size={19} className="opacity-60 transition group-hover:-translate-y-1 group-hover:translate-x-1" /></div><h2 className="mt-8 text-xl font-bold">{action.title}</h2><p className="mt-2 text-sm opacity-75">{action.body}</p></Link>; })}</div>
    <div className="mt-14 grid gap-10 lg:grid-cols-[1.25fr_.75fr]"><section><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-[#3b241a]">{t('dash.docs.title')}</h2><Button href="/analyze" variant="ghost" testId="button-dashboard-upload">{t('dash.upload')} <ArrowLeft size={15} /></Button></div><div className="space-y-3">{[{ name: t('dash.doc1.name'), meta: t('dash.doc1.meta'), status: t('dash.doc1.status'), tone: 'text-[#9b5f3a] bg-[#f5e4d8]' }, { name: t('dash.doc2.name'), meta: t('dash.doc2.meta'), status: t('dash.doc2.status'), tone: 'text-[#447052] bg-[#dce9db]' }, { name: t('dash.doc3.name'), meta: t('dash.doc3.meta'), status: t('dash.doc3.status'), tone: 'text-[#447052] bg-[#dce9db]' }].map((doc, index) => <Link href={index === 0 ? '/contract' : '/ask'} key={doc.name} className="flex items-center gap-4 rounded-2xl border border-[#e1d3c2] bg-[#fffdf9] p-4 transition hover:border-[#c5aa8c] hover:shadow-sm" data-testid={`row-document-${index}`}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632]"><FileText size={20} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#3b241a]">{doc.name}</strong><small className="mt-1 block text-xs text-[#95877d]">{doc.meta}</small></span><span className={`hidden rounded-full px-3 py-1.5 text-[11px] font-bold sm:block ${doc.tone}`}>{doc.status}</span><ChevronLeft size={17} className="text-[#a7907d]" /></Link>)}</div></section><aside className="rounded-2xl border border-[#ddc8aa] bg-[#f1e1c8] p-6"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#fffdf9]/70 text-[#6b4632]"><Lightbulb size={19} /></span><span className="text-xs font-bold text-[#8c694a]">{t('dash.tip.label')}</span></div><h3 className="mt-8 text-lg font-bold leading-8 text-[#3b241a]">{t('dash.tip.title')}</h3><p className="mt-2 text-sm leading-7 text-[#80654f]">{t('dash.tip.body')}</p><div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#6b4632]"><Check size={15} /> {t('dash.tip.footer')}</div></aside></div></div>;
}

function Services() {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const filtered = useMemo(() => services.filter((service) => (category === 'all' || service.categoryId === category) && `${service.title} ${service.en.title} ${service.description} ${service.en.description}`.includes(query)), [query, category]);
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"><div className="max-w-2xl"><span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">{t('services.eyebrow')}</span><h1 className="mt-3 font-display text-4xl font-bold text-[#3b241a] sm:text-5xl">{t('services.title')}</h1><p className="mt-4 leading-8 text-[#796c63]">{t('services.body')}</p></div><div className="mt-9 flex flex-col gap-4 md:flex-row"><label className="relative flex-1"><Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a7907d]" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('services.search.placeholder')} className="h-14 w-full rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] pr-12 pl-4 text-sm text-[#3b241a] shadow-sm transition placeholder:text-[#a7907d] focus:border-[#a36c42] focus:outline-none" data-testid="input-service-search" /></label><div className="flex items-center gap-2 overflow-x-auto pb-1">{categoryOptions.map((option) => <button type="button" key={option} onClick={() => setCategory(option)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${category === option ? 'bg-[#3b241a] text-[#fffdf9]' : 'bg-[#ede3d5] text-[#6b4632] hover:bg-[#e2d3c0]'}`} data-testid={`button-filter-${option}`}>{t(`cat.${option}`)}</button>)}</div></div><div className="mt-10 flex items-center justify-between"><p className="text-sm font-semibold text-[#796c63]"><span className="text-[#3b241a]">{filtered.length}</span> {t('services.available')}</p><span className="flex items-center gap-2 text-xs text-[#95877d]"><ListFilter size={15} /> {t('services.sort')}</span></div>{filtered.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.map((service) => { const s = lang === 'ar' ? service : service.en; return <Link href={`/services/${service.id}`} key={service.id} className="group relative overflow-hidden rounded-2xl border border-[#e1d3c2] bg-[#fffdf9] p-6 transition-all hover:-translate-y-1 hover:border-[#c7aa87] hover:shadow-[0_16px_32px_rgba(59,36,26,.08)]" data-testid={`card-service-${service.id}`}><div className={`absolute right-0 top-0 h-full w-1 ${service.color === 'mint' ? 'bg-[#9db89e]' : service.color === 'rose' ? 'bg-[#ce9c88]' : service.color === 'lilac' ? 'bg-[#aa9bbb]' : service.color === 'peach' ? 'bg-[#d7a172]' : 'bg-[#d9ab65]'}`} /><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#8b674d]">{s.category}</span><h2 className="mt-4 text-lg font-bold text-[#3b241a]">{s.title}</h2></div><span className="grid size-10 place-items-center rounded-xl bg-[#f4ede3] text-[#6b4632] transition group-hover:bg-[#3b241a] group-hover:text-[#fffdf9]"><ChevronLeft size={18} /></span></div><p className="mt-3 text-sm leading-7 text-[#796c63]">{s.description}</p><div className="mt-6 flex items-center gap-5 border-t border-[#eee5da] pt-4 text-xs font-semibold text-[#95877d]"><span className="flex items-center gap-1.5"><Clock3 size={14} />{s.time}</span><span className="hidden items-center gap-1.5 sm:flex"><Building2 size={14} />{s.location.split(' ').slice(0, 3).join(' ')}</span></div></Link>; })}<div className="grid place-items-center rounded-2xl border-2 border-dashed border-[#d8c8b6] bg-[#fffdf9]/70 p-6 text-center" data-testid="card-service-coming-soon"><span className="grid size-12 place-items-center rounded-2xl bg-[#f1e1c8] text-[#8c694a]"><Sparkles size={22} /></span><h3 className="mt-4 font-bold text-[#3b241a]">{t('services.coming.title')}</h3><p className="mt-1.5 text-sm leading-6 text-[#95877d]">{t('services.coming.body')}</p></div></div> : <div className="mt-6 rounded-2xl border border-dashed border-[#cdbba5] bg-[#fffdf9] px-6 py-16 text-center"><Search size={26} className="mx-auto text-[#b99876]" /><h3 className="mt-4 font-bold text-[#3b241a]">{t('services.empty.title')}</h3><p className="mt-2 text-sm text-[#796c63]">{t('services.empty.body')}</p><Button variant="ghost" onClick={() => { setQuery(''); setCategory('all'); }} testId="button-clear-service-filter" className="mt-3">{t('services.clear')}</Button></div>}</div>;
}

function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const service = services.find((item) => item.id === id) ?? services[0];
  const s = lang === 'ar' ? service : service.en;
  return <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14"><Link href="/services" className="inline-flex items-center gap-2 text-sm font-bold text-[#8b674d] hover:text-[#3b241a]" data-testid="link-back-services"><ArrowRightIcon />{t('detail.back')}</Link><div className="mt-8 rounded-[1.75rem] bg-[#3b241a] p-7 text-[#fffdf9] sm:p-10"><div className="flex flex-col justify-between gap-8 sm:flex-row"><div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#e6c58e]">{s.category}</span><h1 className="mt-5 font-display text-3xl font-bold leading-[1.25] sm:text-5xl">{s.title}</h1><p className="mt-4 max-w-xl leading-8 text-[#dbcabb]">{s.description}</p></div><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#e6c58e] text-[#3b241a]"><Landmark size={25} /></span></div><div className="mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2"><div className="flex items-center gap-3 text-sm text-[#e6d7c8]"><Clock3 size={18} className="text-[#e6c58e]" /><span><b className="block text-[11px] font-normal text-[#a9907f]">{t('detail.timeLabel')}</b>{s.time}</span></div><div className="flex items-center gap-3 text-sm text-[#e6d7c8]"><Building2 size={18} className="text-[#e6c58e]" /><span><b className="block text-[11px] font-normal text-[#a9907f]">{t('detail.locationLabel')}</b>{s.location}</span></div></div></div><div className="mt-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><section><h2 className="flex items-center gap-3 text-xl font-bold text-[#3b241a]"><span className="grid size-9 place-items-center rounded-lg bg-[#e6c58e] text-[#3b241a]"><FolderOpen size={17} /></span>{t('detail.reqTitle')}</h2><div className="mt-5 space-y-3">{s.requirements.map((requirement, index) => <div key={requirement} className="flex gap-3 rounded-xl border border-[#e1d3c2] bg-[#fffdf9] p-4 text-sm leading-7 text-[#5e5048]" data-testid={`item-requirement-${index}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#dce9db] text-[#447052]"><Check size={14} /></span>{requirement}</div>)}</div></section><section><h2 className="flex items-center gap-3 text-xl font-bold text-[#3b241a]"><span className="grid size-9 place-items-center rounded-lg bg-[#d8e2d6] text-[#31513b]"><ClipboardCheck size={17} /></span>{t('detail.stepsTitle')}</h2><div className="mt-5">{s.steps.map((step, index) => <div key={step} className="relative flex gap-4 pb-7 last:pb-0"><div className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-4 border-[#f7f2ea] bg-[#3b241a] text-xs font-bold text-[#fffdf9]">{index + 1}</div>{index < s.steps.length - 1 && <div className="absolute right-[17px] top-9 h-[calc(100%-1.25rem)] w-px bg-[#d8c8b6]" />}<div className="rounded-xl border border-[#e1d3c2] bg-[#fffdf9] p-4 text-sm leading-7 text-[#5e5048]">{step}</div></div>)}</div></section></div><div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#ddc8aa] bg-[#f1e1c8] p-5 sm:flex-row sm:items-center"><div><p className="font-bold text-[#3b241a]">{t('detail.noteTitle')}</p><p className="mt-1 text-sm text-[#80654f]">{t('detail.noteBody')}</p></div><Button variant="secondary" testId="button-official-source" onClick={() => window.open('https://digital.gov.eg', '_blank', 'noopener,noreferrer')}>{t('detail.official')} <ArrowUpLeft size={16} /></Button></div></div>;
}






function NotFound() {
  const { t } = useLanguage();
  return <div className="grid min-h-[70vh] place-items-center px-5 text-center"><div><span className="font-display text-7xl font-bold text-[#d9ab65]">٤٠٤</span><h1 className="mt-4 text-2xl font-bold text-[#3b241a]">{t('nf.title')}</h1><p className="mt-2 text-[#796c63]">{t('nf.body')}</p><Button href="/" className="mt-6" testId="button-not-found-home">{t('nf.cta')}</Button></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Shell><Switch><Route path="/" component={Home} /><Route path="/dashboard" component={Dashboard} /><Route path="/services" component={Services} /><Route path="/services/:id" component={ServiceDetail} /><Route path="/analyze" component={AnalyzePage} /><Route path="/contract" component={ContractPage} /><Route path="/ask" component={AskPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <LanguageProvider><QueryClientProvider client={queryClient}><TooltipProvider><AnalysisProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter></AnalysisProvider><Toaster /></TooltipProvider></QueryClientProvider></LanguageProvider>;
}

export default App;