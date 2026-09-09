import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  ShieldCheck,
  Zap,
  Scale,
  Building2,
  FileCheck2,
  Users,
  Check,
  X,
  Target,
  Rocket,
  Compass,
  Award,
  HelpCircle,
  ExternalLink,
  Laptop,
  Smartphone,
  Cpu,
  Database,
  Cloud,
  Lock,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/lib/ui';

export function PresentationPage() {
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalSlides = 10;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (dir === 'rtl') prevSlide();
        else nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (dir === 'rtl') nextSlide();
        else prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#f7f2ea] text-[#3b241a] font-sans antialiased selection:bg-[#e6c58e] selection:text-[#3b241a]">
      {/* Top Presentation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#ddcdbb] bg-[#fffdf9]/95 px-5 py-3.5 backdrop-blur-md print:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-[#3b241a] text-[#fffdf9] font-bold text-sm">
            د
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#a36c42]">
              Dalil Pitch Deck 2026
            </span>
            <h1 className="text-sm font-bold text-[#3b241a]">
              منصة دليل — العرض التقديمي للتحكيم
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#ede3d5] px-3.5 py-1 text-xs font-bold text-[#8c694a]">
            <span>{currentSlide + 1}</span>
            <span className="opacity-40">/</span>
            <span>{totalSlides}</span>
          </div>

          <div className="flex items-center gap-1 border-r border-l border-[#ddcdbb] px-2 mx-1">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="grid size-8 place-items-center rounded-lg border border-[#ddcdbb] bg-white text-[#3b241a] transition hover:bg-[#ede3d5] disabled:opacity-40"
              title="السابق"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="grid size-8 place-items-center rounded-lg border border-[#ddcdbb] bg-white text-[#3b241a] transition hover:bg-[#ede3d5] disabled:opacity-40"
              title="التالي"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="hidden sm:grid size-8 place-items-center rounded-lg border border-[#ddcdbb] bg-white text-[#6b4632] hover:bg-[#ede3d5]"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={handlePrint}
            className="grid size-8 place-items-center rounded-lg border border-[#ddcdbb] bg-white text-[#6b4632] hover:bg-[#ede3d5]"
            title="طباعة / حفظ PDF"
          >
            <Printer size={16} />
          </button>

          <Button href="/" variant="secondary" className="text-xs py-1.5 px-3">
            خروج للمنصة
          </Button>
        </div>
      </header>

      {/* Main Slide Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <div className="relative min-h-[620px] rounded-[2.5rem] border border-[#ddcdbb] bg-[#fffdf9] p-8 lg:p-14 shadow-xl transition-all">
          
          {/* SLIDE 1: Title & Vision */}
          {currentSlide === 0 && (
            <div className="flex flex-col justify-between min-h-[520px] text-center">
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fdf7ef] px-4 py-1.5 text-xs font-extrabold text-[#8c694a] shadow-sm">
                  <Sparkles size={15} className="text-[#a36c42]" />
                  <span>هاكاثون الذكاء الاصطناعي والحلول الذكية 2026</span>
                </div>

                <div className="mt-8 flex justify-center">
                  <span className="grid size-20 place-items-center rounded-3xl bg-[#3b241a] text-4xl font-bold text-[#fffdf9] shadow-lg">
                    د
                  </span>
                </div>

                <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-[#3b241a] sm:text-6xl lg:text-7xl">
                  دليل | Dalil ⚖️🇪🇬
                </h1>
                <p className="mt-4 font-display text-2xl font-bold text-[#a36c42] sm:text-3xl">
                  المساعد القانوني الذكي لفحص العقود والمستندات
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#796c63] sm:text-lg">
                  "افهم عقدك قبل ما تمضي.. حمايتك القانونية في جيبك بثوانٍ معدودة"
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#eee5da] pt-8 text-center">
                <div className="rounded-2xl bg-[#fdf7ef] p-4 border border-[#ddc8aa]/40">
                  <span className="block text-2xl font-extrabold text-[#3b241a]">10 ثوانٍ</span>
                  <span className="text-xs text-[#796c63]">سرعة فحص العقد</span>
                </div>
                <div className="rounded-2xl bg-[#fdf7ef] p-4 border border-[#ddc8aa]/40">
                  <span className="block text-2xl font-extrabold text-[#a36c42]">Gemini 3.6</span>
                  <span className="text-xs text-[#796c63]">محرك الرؤية والتحليل</span>
                </div>
                <div className="rounded-2xl bg-[#fdf7ef] p-4 border border-[#ddc8aa]/40">
                  <span className="block text-2xl font-extrabold text-[#447052]">100%</span>
                  <span className="text-xs text-[#796c63]">توافق مع القانون المصري</span>
                </div>
                <div className="rounded-2xl bg-[#fdf7ef] p-4 border border-[#ddc8aa]/40">
                  <span className="block text-2xl font-extrabold text-[#3b241a]">Live MVP</span>
                  <span className="text-xs text-[#796c63]">مشروع عامل بالكامل</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Problem Statement & Evidence */}
          {currentSlide === 1 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Target size={16} />
                <span>المشكلة الواقعية · The Problem</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                معضلة "التوقيع الأعمى" والمصيدة القانونية في مصر
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#a13b28] text-white font-bold">1</span>
                    <h3 className="font-bold text-lg text-[#3b241a]">70% يوقعون دون مراجعة</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#796c63]">
                    المواطن والشركات الصغيرة يوقعون على عقود الإيجار والعمل والتقسيط دون استشارة محامٍ، نظراً للتكلفة العالية (أتعاب المحامي 500 – 3000 جنيه للعقد) وبطء المواعيد.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#a13b28] text-white font-bold">2</span>
                    <h3 className="font-bold text-lg text-[#3b241a]">فخاخ الشروط الجزائية المجحفة</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#796c63]">
                    شروط كارثية خفية مثل: غرامة تأخير 5% يومياً من القيمة الإيجارية، مصادرة التأمين بتقدير منفرد من المؤجر، أو شرط جزائي تعسفي يسلب حق التقاضي.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#a13b28] text-white font-bold">3</span>
                    <h3 className="font-bold text-lg text-[#3b241a]">تكدس 60% من قضايا المحاكم</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#796c63]">
                    أكثر من 60% من نزاعات الدوائر المدنية ناتجة عن عدم فهم الالتزامات التعاقدية قبل التوقيع، وكان يمكن منعها بالكامل بمراجعة وقائية بسيطة.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#a13b28] text-white font-bold">4</span>
                    <h3 className="font-bold text-lg text-[#3b241a]">فجوة المصطلحات القانونية</h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#796c63]">
                    الصياغات القانونية مصممة بلغة معقدة تخلق عدم تكافؤ في القوة بين الشركات الكبرى أو الملاك وبين المواطن العادي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: The Solution */}
          {currentSlide === 2 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Sparkles size={16} />
                <span>الحل والقيمة المضافة · The Solution</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                منصة "دليل": محامٍ ذكي ومحترف في جيبك بثوانٍ
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div className="rounded-3xl border-2 border-[#a36c42] bg-[#fffdf9] p-6 shadow-md">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#fdf7ef] text-[#a36c42]">
                    <Zap size={24} />
                  </div>
                  <h3 className="mt-4 font-bold text-xl text-[#3b241a]">فحص فوري في 10 ثوانٍ</h3>
                  <p className="mt-2 text-xs leading-6 text-[#796c63]">
                    ارفع أي عقد (PDF، صور سكانر، أو ملفات Word)، وسيقوم الذكاء الاصطناعي بقراءته فوراً واستخراج الأطراف والمدة والقيمة المالية.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#ede3d5] text-[#6b4632]">
                    <Scale size={24} />
                  </div>
                  <h3 className="mt-4 font-bold text-xl text-[#3b241a]">لغة مصرية شارحة ومبسطة</h3>
                  <p className="mt-2 text-xs leading-6 text-[#796c63]">
                    شرح كل بند بلغة دارجة واضحة ("زي ما محامي شاطر بيشرح لواحد صاحبه في كلمتين") مع بيان سبب خطورة البند وما يجب التفاوض عليه.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#ddcdbb] bg-[#fdf7ef] p-6 shadow-sm">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#dce9db] text-[#447052]">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="mt-4 font-bold text-xl text-[#3b241a]">سند من القانون المصري</h3>
                  <p className="mt-2 text-xs leading-6 text-[#796c63]">
                    ربط كل بند بنصوص مواد حقيقية من القانون المدني، وقانون العمل رقم 12 لسنة 2003، وقانون حماية المستهلك لضمان الحماية القانونية.
                  </p>
                </div>
              </div>

              {/* Color coded risk indicators */}
              <div className="mt-8 rounded-2xl bg-[#3b241a] p-5 text-white flex flex-wrap items-center justify-around gap-4 text-center">
                <div className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full bg-[#e5484d]" />
                  <span className="text-xs font-bold">🔴 بنود حرجة (Critical): شروط تعسفية مجحفة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full bg-[#f76b15]" />
                  <span className="text-xs font-bold">🟡 بنود تحذيرية (Warning): تحتاج تفاوضاً</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full bg-[#46a758]" />
                  <span className="text-xs font-bold">🟢 بنود طبيعية (Normal): شروط قياسية متوازنة</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Core Features Walkthrough */}
          {currentSlide === 3 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Rocket size={16} />
                <span>المميزات والخدمات · Core Features</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                منظومة متكاملة لحماية حقوق المواطن والمؤسسات
              </h2>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#fdf7ef] text-[#a36c42] font-bold">01</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">فحص المستندات المتعدد</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    دعم ملفات PDF النصية والممسوحة ضوئياً، وصور الهواتف عالية الدقة، وملفات Word، مع استخراج كامل للأطراف والغرامات والبنود.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632] font-bold">02</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">مساعد "اسأل مستندك" التفاعلي</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    شات بوت ذكي يجيب عن أي تساؤل خاص بالعقد (مثال: "هل يقدر يطردني لو اتأخرت أسبوع؟" أو "مين يدفع فواتير المياه؟") من صلب العقد.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#dce9db] text-[#447052] font-bold">03</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">دليل وشات الخدمات الحكومية</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    شرح شامل لإجراءات الأحوال المدنية، المرور، والشهر العقاري مع شات بوت ذكي مدمج يوضح الخطوات والمستندات المطلوبة.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#fdf7ef] text-[#a36c42] font-bold">04</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">حجز الاستشارات القانونية</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    إمكانية تصعيد الحالات المعقدة وطلب استشارة موثوقة مع نخبة من المحامين المعتمدين بنقابة المحامين.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#ede3d5] text-[#6b4632] font-bold">05</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">باقات تسعير مرنة ودفع محلي</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    باقات واضحة (مجاني، طالب، محترف، مهني، شركات) مع تكامل الدفع عبر فودافون كاش، محافظ المحمول، فوري، والبطاقات البنكية.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#dce9db] text-[#447052] font-bold">06</span>
                  <h3 className="mt-3 font-bold text-base text-[#3b241a]">سجل مشفر وحماية خصوصية</h3>
                  <p className="mt-1.5 text-xs leading-6 text-[#796c63]">
                    حفظ وتوثيق العقود المفحوصة للمستخدم المشترك دون مشاركة البيانات الحساسة مع أي طرف خارجي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Google Technology Integration (Bonus +5) */}
          {currentSlide === 4 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Cloud size={16} />
                <span>حزمة تقنيات Google المستخدمة · Google Technology Bonus (+5)</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                بنية تحتية سحابية متقدمة مدعومة بأحدث تقنيات Google
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border-2 border-[#4285F4]/40 bg-[#fffdf9] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#4285F4]/10 text-[#4285F4] font-bold text-xl">
                      <Cpu size={24} />
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-[#3b241a]">Google Gemini 3.6 Flash</h3>
                      <span className="text-xs text-[#4285F4] font-semibold">Multimodal AI Engine</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-[#5e5048] leading-6">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>قراءة بصرية مباشرة لمستندات PDF والصور عالية الدقة (Inline Data).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>إخراج بيانات قانونية منظمة بدقة متناهية عبر JSON Structured Schema.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>سرعة فائقة في المعالجة بأقل من 10 ثوانٍ لمنع الـ Timeouts.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border-2 border-[#FFCA28]/60 bg-[#fffdf9] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#FFCA28]/20 text-[#3b241a] font-bold text-xl">
                      <Database size={24} />
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-[#3b241a]">Google Firebase Ecosystem</h3>
                      <span className="text-xs text-[#a36c42] font-semibold">Authentication & Cloud Firestore</span>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-[#5e5048] leading-6">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>تسجيل دخول آمن بحسابات Google OAuth وحماية الهوية عبر Firebase Auth.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>مزامنة لحظية لسجلات المستخدمين وباقات الاشتراك وحصص الاستخدام عبر Firestore.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-[#447052]" />
                      <span>تأمين القواعد السحابية (Security Rules) لمنع أي وصول غير مصرح به.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border-2 border-[#34A853]/40 bg-[#fffdf9] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#34A853]/10 text-[#34A853] font-bold text-xl">
                      <Cloud size={24} />
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-[#3b241a]">Google Cloud & Storage</h3>
                      <span className="text-xs text-[#34A853] font-semibold">Reliable Scalable Storage</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-[#5e5048]">
                    إدارة وحفظ ملفات العقود المرفوعة والتدفقات الثنائية (Binary Streams) بأعلى معايير التوافرية والاعتمادية السحابية.
                  </p>
                </div>

                <div className="rounded-3xl border-2 border-[#3b241a]/20 bg-[#fffdf9] p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#3b241a] text-[#fffdf9] font-bold text-xl">
                      <Lock size={22} />
                    </span>
                    <div>
                      <h3 className="font-bold text-lg text-[#3b241a]">التشفير والأمان المصرفي</h3>
                      <span className="text-xs text-[#8c694a] font-semibold">End-to-End Encryption</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-[#5e5048]">
                    تشفير كامل TLS 1.3 / HTTPS، عزل تام لمفاتيح الـ API في الخادم دون تسريبها لمتصفح المستخدم نهائياً، مع حماية تامة للخصوصية.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: Hybrid Local Rule Engine */}
          {currentSlide === 5 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Cpu size={16} />
                <span>الموديل والمحرك المحلي الهجين · Hybrid Rule Engine</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                ابتكار المعمارية الهجينة: استمرارية 100% بدون توقف
              </h2>

              <div className="mt-8 rounded-3xl bg-[#3b241a] p-8 text-[#fffdf9]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6">
                  <div>
                    <span className="rounded-full bg-[#e6c58e]/20 px-3 py-1 text-xs font-bold text-[#e6c58e]">
                      Zero-Downtime Guarantee
                    </span>
                    <h3 className="mt-3 font-display text-2xl font-bold">
                      لماذا قمنا ببناء محرك استدلال قانوني محلي (Local Fallback)؟
                    </h3>
                  </div>
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#e6c58e] text-[#3b241a]">
                    <ShieldCheck size={32} />
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-3 text-xs leading-6">
                  <div>
                    <h4 className="font-bold text-[#e6c58e] text-sm mb-2">1. الحماية من انقطاع الخدمة</h4>
                    <p className="text-[#dbcabb]">
                      لو تعطلت شبكة الـ API أو حدثت مشكلة خوادم خارجية، ينتقل السيرفر تلقائياً إلى المحرك المحلي الداخلي فوراً دون أن يشعر المستخدم بأي عطل.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#e6c58e] text-sm mb-2">2. استجابة في أقل من 50ms</h4>
                    <p className="text-[#dbcabb]">
                      المحرك المحلي مبني بخوارزميات Regex متطورة وفحص مباشر لأنماط العقود المصرية يتيح التحليل الفوري للمستندات في بضع أجزاء من الثانية.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#e6c58e] text-sm mb-2">3. قاعدة معرفة قانونية مدمجة</h4>
                    <p className="text-[#dbcabb]">
                      ملف قاعدة المعرفة (<code className="text-[#e6c58e]">legal-knowledge-base.json</code>) يحتوي على مئات المواد المحددة من القانون المدني وقانون العمل المحققة والموثقة.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#ddcdbb] bg-[#fdf7ef] p-5 text-center">
                <p className="text-sm font-bold text-[#3b241a]">
                  النتيجة: مزيج يجمع بين الذكاء البصري العميق لـ Gemini 3.6 وموثوقية المحرك المحلي بنسبة 99.9%.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 7: Competitors & Competitive Advantage */}
          {currentSlide === 6 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Scale size={16} />
                <span>المنافسون والميزة التنافسية · Competitor Analysis</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                لماذا يتفوق "دليل" على البدائل المتاحة؟
              </h2>

              <div className="mt-8 overflow-x-auto rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] shadow-sm">
                <table className="w-full text-xs text-[#5e5048]" dir={dir}>
                  <thead className="bg-[#fdf7ef] border-b border-[#ddcdbb] font-bold text-[#3b241a]">
                    <tr>
                      <th className="p-4 text-right">وجه المقارنة</th>
                      <th className="p-4 text-center bg-[#f7ebd9]/60 text-sm font-extrabold text-[#3b241a]">منصة دليل ⚖️</th>
                      <th className="p-4 text-center">المحامي التقليدي 👨‍💼</th>
                      <th className="p-4 text-center">ChatGPT العام 🤖</th>
                      <th className="p-4 text-center">منصات LegalTech الغربية 🌐</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee5da]">
                    <tr>
                      <td className="p-3.5 font-bold text-[#3b241a]">التكلفة المادية</td>
                      <td className="p-3.5 text-center bg-[#f7ebd9]/30 font-bold text-[#447052]">باقة مجانية / اشتراك رمزي</td>
                      <td className="p-3.5 text-center text-[#a13b28]">500 – 3000 جنيه للعقد</td>
                      <td className="p-3.5 text-center">20$ شهرياً (بدون تخصص)</td>
                      <td className="p-3.5 text-center text-[#a13b28]">مكلفة جداً بالدولار</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3b241a]">سرعة الإنجاز</td>
                      <td className="p-3.5 text-center bg-[#f7ebd9]/30 font-bold text-[#447052]">أقل من 10 ثوانٍ فورياً</td>
                      <td className="p-3.5 text-center text-[#a13b28]">يومان إلى أسبوع</td>
                      <td className="p-3.5 text-center">دقيقة واحدة</td>
                      <td className="p-3.5 text-center">ساعات</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3b241a]">التخصص في القانون المصري</td>
                      <td className="p-3.5 text-center bg-[#f7ebd9]/30 font-bold text-[#447052]">100% مدني وعمل ومستهلك</td>
                      <td className="p-3.5 text-center">نعم</td>
                      <td className="p-3.5 text-center text-[#a13b28]">ضعيف وقد يهلوس بالمواد</td>
                      <td className="p-3.5 text-center text-[#a13b28]">معدوم (قوانين غربية فقط)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3b241a]">لغة الشرح والفهم</td>
                      <td className="p-3.5 text-center bg-[#f7ebd9]/30 font-bold text-[#447052]">لهجة مصرية مبسطة وسهلة</td>
                      <td className="p-3.5 text-center">مصطلحات صعبة ومعقدة</td>
                      <td className="p-3.5 text-center">فصحى أكاديمية جافة</td>
                      <td className="p-3.5 text-center text-[#a13b28]">إنجليزية فقط</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[#3b241a]">اسأل مستندك التفاعلي</td>
                      <td className="p-3.5 text-center bg-[#f7ebd9]/30 font-bold text-[#447052]">متاح ومخصص لصلب العقد</td>
                      <td className="p-3.5 text-center">يتطلب مكالمة أو زيارة</td>
                      <td className="p-3.5 text-center">عام وبلا قيود</td>
                      <td className="p-3.5 text-center">غير متاح للمصريين</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 8: Business Model & Pricing */}
          {currentSlide === 7 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Award size={16} />
                <span>نموذج العمل والتسعير · Business Model & ROI</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                نموذج اشتراكات SaaS متدرج ومستدام مالياً
              </h2>

              <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-5 text-center">
                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-4">
                  <span className="text-2xl">🆓</span>
                  <h4 className="font-bold text-sm text-[#3b241a] mt-2">مجاني Free</h4>
                  <p className="text-xl font-extrabold text-[#3b241a] mt-2">0 ج.م</p>
                  <p className="text-[11px] text-[#796c63] mt-2">5 مستندات / شهر لتجربة المنصة</p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-4">
                  <span className="text-2xl">🎓</span>
                  <h4 className="font-bold text-sm text-[#3b241a] mt-2">طالب Student</h4>
                  <p className="text-xl font-extrabold text-[#3b241a] mt-2">49 ج.م</p>
                  <p className="text-[11px] text-[#796c63] mt-2">30 مستند / شهر + استخراج أطراف</p>
                </div>

                <div className="rounded-2xl border-2 border-[#a36c42] bg-[#3b241a] text-[#fffdf9] p-4 shadow-md">
                  <span className="text-2xl">⭐</span>
                  <h4 className="font-bold text-sm text-[#e6c58e] mt-2">محترف Pro</h4>
                  <p className="text-xl font-extrabold text-[#fffdf9] mt-2">99 ج.م</p>
                  <p className="text-[11px] text-[#dbcabb] mt-2">100 مستند + فحص ثغرات + PDF</p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-4">
                  <span className="text-2xl">💼</span>
                  <h4 className="font-bold text-sm text-[#3b241a] mt-2">مهني Professional</h4>
                  <p className="text-xl font-extrabold text-[#3b241a] mt-2">249 ج.م</p>
                  <p className="text-[11px] text-[#796c63] mt-2">300 مستند + أولوية سرعة + واتساب</p>
                </div>

                <div className="rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-4 col-span-2 sm:col-span-1">
                  <span className="text-2xl">🏢</span>
                  <h4 className="font-bold text-sm text-[#3b241a] mt-2">شركات Business</h4>
                  <p className="text-xl font-extrabold text-[#3b241a] mt-2">599 ج.م</p>
                  <p className="text-[11px] text-[#796c63] mt-2">1,000 مستند + 5 مقاعد فريق</p>
                </div>
              </div>

              {/* Revenue Streams & Payment */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#fdf7ef] p-5 border border-[#ddc8aa]">
                  <h4 className="font-bold text-sm text-[#3b241a] mb-2 flex items-center gap-2">
                    <CreditCard size={18} className="text-[#a36c42]" />
                    <span>تكامل بوابات الدفع المحلية المصرية:</span>
                  </h4>
                  <p className="text-xs text-[#796c63] leading-6">
                    دعم مباشر لمحفظة فودافون كاش، إتصالات، أورانج كاش، إنستاباي، شبكة فوري للتحصيل النقدي، والبطاقات البنكية لتسهيل الاشتراك على كافة شرائح المجتمع.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fdf7ef] p-5 border border-[#ddc8aa]">
                  <h4 className="font-bold text-sm text-[#3b241a] mb-2 flex items-center gap-2">
                    <Building2 size={18} className="text-[#a36c42]" />
                    <span>مصادر دخل إضافية (Future Revenues):</span>
                  </h4>
                  <p className="text-xs text-[#796c63] leading-6">
                    عمولات حجز الاستشارات القانونية، ربط واجهات برمجة التطبيقات (B2B API Integration) لمنصات العقارات وإدارة الموارد البشرية (HR).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 9: Strategic Product Roadmap */}
          {currentSlide === 8 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                <Compass size={16} />
                <span>خارطة الطريق الاستراتيجية · Strategic Product Roadmap</span>
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                الرؤية المستقبلية وخطط التوسع (2026 - 2027)
              </h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {/* Phase 1 */}
                <div className="rounded-3xl border-2 border-[#447052] bg-[#fdf7ef] p-6">
                  <span className="inline-block rounded-full bg-[#dce9db] px-3 py-1 text-xs font-bold text-[#447052]">
                    المرحلة الأولى · تم إنجازها ✅
                  </span>
                  <h3 className="mt-4 font-bold text-lg text-[#3b241a]">الإطلاق والتحقق (Live MVP)</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-6 text-[#796c63]">
                    <li>• فحص العقود المتعدد الوسائط (PDF/DOCX/Images).</li>
                    <li>• محرك الاستدلال القانوني الهجين (Gemini + Local).</li>
                    <li>• ميزة "اسأل مستندك" والمساعد الذكي.</li>
                    <li>• نظام الاشتراكات والمصادقة بـ Firebase.</li>
                  </ul>
                </div>

                {/* Phase 2 */}
                <div className="rounded-3xl border-2 border-[#a36c42] bg-[#fffdf9] p-6 shadow-md">
                  <span className="inline-block rounded-full bg-[#ede3d5] px-3 py-1 text-xs font-bold text-[#8c694a]">
                    المرحلة الثانية · Q4 2026
                  </span>
                  <h3 className="mt-4 font-bold text-lg text-[#3b241a]">الصياغة والتوقيع الرقمي</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-6 text-[#796c63]">
                    <li>• التوليد الآلي للعقود وصياغتها الذكية المتوافقة.</li>
                    <li>• التكامل مع التوقيع الإلكتروني المعتمد.</li>
                    <li>• دعم العقود المكتوبة بخط اليد بالكامل (Handwritten OCR).</li>
                    <li>• تطبيق الموبايل لنظامي Android و iOS.</li>
                  </ul>
                </div>

                {/* Phase 3 */}
                <div className="rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-6">
                  <span className="inline-block rounded-full bg-[#f4ede3] px-3 py-1 text-xs font-bold text-[#6b4632]">
                    المرحلة الثالثة · 2027
                  </span>
                  <h3 className="mt-4 font-bold text-lg text-[#3b241a]">التوسع وسوق المحامين</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-6 text-[#796c63]">
                    <li>• إطلاق سوق المحامين (Lawyer Marketplace).</li>
                    <li>• إتاحة B2B API للبنوك والشركات العقارية والـ HR.</li>
                    <li>• التوسع الإقليمي في أسواق الخليج وشمال إفريقيا (السعودية، الإمارات، المغرب).</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[#3b241a] p-4 text-center text-white text-xs">
                <span className="font-bold text-[#e6c58e]">الهدف الاستراتيجي:</span> جعل "دليل" البنية التحتية القانونية الرقمية الأولى لكل مواطن وشركة في الشرق الأوسط.
              </div>
            </div>
          )}

          {/* SLIDE 10: Impact, SDGs & Call to Action */}
          {currentSlide === 9 && (
            <div className="flex flex-col justify-between min-h-[520px]">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#a36c42] uppercase tracking-wider">
                  <Award size={16} />
                  <span>الأثر التنموي وخاتمة العرض · Impact & Conclusion</span>
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
                  العدالة الوقائية في متناول كل مواطن مصري
                </h2>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#ddcdbb] bg-[#fdf7ef] p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-[#447052] text-white font-bold text-xl">
                        16
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-[#3b241a]">SDG 16: السلام والعدالة</h3>
                        <span className="text-xs text-[#447052] font-semibold">Universal Access to Justice</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-7 text-[#796c63]">
                      تسهيل الوصول إلى الحماية القانونية وكسر احتكار المعلومة، وتمكين الفئات الأكثر هشاشة من فهم حقوقهم قبل توقيع أي التزام مدني أو إيجاري.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[#ddcdbb] bg-[#fdf7ef] p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-12 place-items-center rounded-2xl bg-[#a36c42] text-white font-bold text-xl">
                        8
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-[#3b241a]">SDG 8: العمل اللائق ونمو الاقتصاد</h3>
                        <span className="text-xs text-[#a36c42] font-semibold">Decent Work & Economic Protection</span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-7 text-[#796c63]">
                      حماية العاملين المستقلين وأصحاب الأعمال الناشئة من شروط العمل المجحفة وضياع المستحقات أو فخاخ عدم المنافسة غير القانونية.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border-2 border-[#a36c42] bg-[#3b241a] p-8 text-center text-white">
                  <h3 className="font-display text-3xl font-bold text-[#e6c58e]">
                    جرب المنصة الآن مباشرة (Live Demo)
                  </h3>
                  <p className="mt-2 text-sm text-[#dbcabb]">
                    المنصة منشورة ومتاحة للاستخدام الفعلي بكامل ميزاتها على الرابط التالي:
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#e6c58e] px-6 py-3 text-sm font-extrabold text-[#3b241a] shadow-lg">
                    <span>https://dalileg.vercel.app/</span>
                    <ExternalLink size={16} />
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#eee5da] pt-6 flex flex-wrap items-center justify-between text-xs text-[#796c63]">
                <p>شكراً لحسن استماعكم — يسعدنا استقبال أسئلة وملاحظات لجنة التحكيم الموقرة (Q&A Session).</p>
                <div className="font-bold text-[#3b241a]">فريق عمل دليل | Dalil 2026</div>
              </div>
            </div>
          )}

        </div>

        {/* Slide Thumbnails & Quick Navigator */}
        <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-4 print:hidden">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                currentSlide === i
                  ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm scale-105'
                  : 'bg-[#ede3d5] text-[#6b4632] hover:bg-[#ddcdbb]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
