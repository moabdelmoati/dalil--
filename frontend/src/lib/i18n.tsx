import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'ar' | 'en';

const STORAGE_KEY = 'dalil-lang';

type Dict = Record<string, string>;

const AR: Dict = {
  'app.name': 'دليل',
  'brand.letter': 'د',
  'nav.dashboard': 'لوحتك',
  'nav.services': 'الخدمات',
  'nav.analyze': 'حلّل مستنداً',
  'nav.ask': 'اسأل مستندك',
  'aria.notifications': 'الإشعارات',
  'aria.menu': 'القائمة',
  'aria.sendQuestion': 'إرسال السؤال',
  'lang.switch': 'English',

  'hero.badge': 'مرشدك المدني اليومي',
  'hero.h1a': 'افهم قبل ما تمضي،',
  'hero.h1b': 'واعرف قبل ما تروح.',
  'hero.body': 'دليل يساعدك تفهم الخدمات الحكومية، وتراجع مستنداتك وعقودك، بخطوات واضحة ولغة بسيطة.',
  'hero.cta1': 'حلّل مستندك',
  'hero.cta2': 'استكشف الخدمات',
  'hero.priv': 'خصوصيتك أولاً',
  'hero.simple': 'شرح بدون تعقيد',
  'hero.card.label': 'ملخص عقد الإيجار',
  'hero.card.title': 'قبل ما تمضي، خليك عارف',
  'hero.card.review': 'مراجعة البنود',
  'hero.card.points': '٣ نقاط تستحق الانتباه',
  'hero.card.tip': 'شرح مبسط لكل بند، ومصدر تعرف ترجع له.',
  'hero.card.demo': 'معلومة تجريبية للتوضيح',

  'steps.eyebrow': 'ثلاث خطوات أوضح',
  'steps.title': 'من الورقة إلى القرار، من غير دوخة',
  'steps.body': 'مش محتاج تكون خبير قانوني أو تحفظ أسماء النماذج. دليل يرتب لك الصورة قبل أي خطوة.',
  'step1.title': 'ارفع مستندك',
  'step1.body': 'PDF أو صورة أو DOCX — ابدأ من الورقة اللي محتاج تفهمها.',
  'step2.title': 'اقرأ الشرح',
  'step2.body': 'نوضح المصطلحات والبنود المهمة بلغة مصرية مباشرة.',
  'step3.title': 'خد قرارك وأنت عارف',
  'step3.body': 'نعرض لك الخطوة التالية والمصدر الرسمي للرجوع إليه.',

  'explore.eyebrow': 'مش بس مستندات',
  'explore.title': 'لما تروح، روح جاهز.',
  'explore.body': 'استكشف خدمات مصرية شائعة، واعرف الأوراق والخطوات ومكان التقديم قبل ما تضيع وقتك.',
  'explore.cta': 'شوف الخدمات المتاحة',
  'trust.title': 'خليك مطمّن، وخد خطوتك بعِلم.',
  'trust.body': 'دليل أداة للتوضيح والمساعدة، وليس بديلاً عن استشارة المتخصصين.',
  'trust.cta': 'ابدأ مع دليل',

  'dash.account': 'حساب تجريبي',
  'dash.greeting': 'أهلاً يا محمد',
  'dash.sub': 'خلّينا نخلّي خطوتك الجاية أوضح.',
  'dash.action1.title': 'حلّل مستنداً',
  'dash.action1.body': 'افهم عقداً أو ورقة قبل ما تمضي',
  'dash.action2.title': 'استكشف خدمة',
  'dash.action2.body': 'اعرف المطلوب قبل ما تروح',
  'dash.action3.title': 'اسأل مستندك',
  'dash.action3.body': 'خد إجابة من داخل مستندك',
  'dash.docs.title': 'مستنداتك الأخيرة',
  'dash.upload': 'مستند جديد',
  'dash.doc1.name': 'عقد إيجار شقة المعادي',
  'dash.doc1.meta': 'PDF · منذ يومين',
  'dash.doc1.status': '٣ نقاط تستحق الانتباه',
  'dash.doc2.name': 'بطاقة الرقم القومي',
  'dash.doc2.meta': 'صورة · ١٢ مايو ٢٠٢٤',
  'dash.doc2.status': 'تمت المراجعة',
  'dash.doc3.name': 'عقد عمل — شركة النيل',
  'dash.doc3.meta': 'DOCX · ٠٧ مايو ٢٠٢٤',
  'dash.doc3.status': 'تمت المراجعة',
  'dash.tip.label': 'نصيحة اليوم',
  'dash.tip.title': 'خد صورة واضحة للمستند كامل',
  'dash.tip.body': 'تأكد إن كل الصفحات ظاهرة والبيانات مقروءة، علشان الشرح يكون أدق.',
  'dash.tip.footer': 'جاهز تساعد نفسك',

  'services.eyebrow': 'دليل الخدمات',
  'services.title': 'اعرف قبل ما تروح.',
  'services.body': 'خدمات شائعة، متجمعة في مكان واحد وبشرح بسيط. المعلومات التالية تجريبية للتوضيح.',
  'services.search.placeholder': 'ابحث عن خدمة، مثل بطاقة الرقم القومي',
  'services.available': 'خدمات متاحة',
  'services.sort': 'مرتبة حسب الشيوع',
  'services.coming.title': 'المزيد من الخدمات قادمة',
  'services.coming.body': 'بنضيف خدمات جديدة باستمرار. ترقب المزيد قريباً.',
  'services.empty.title': 'مفيش خدمة بالاسم ده لسه',
  'services.empty.body': 'جرّب كلمة أبسط أو اختار تصنيف مختلف.',
  'services.clear': 'امسح البحث',
  'cat.all': 'الكل',
  'cat.civil': 'الأحوال المدنية',
  'cat.realestate': 'العقارات',
  'cat.travel': 'السفر',
  'cat.traffic': 'المرور',

  'detail.back': 'كل الخدمات',
  'detail.timeLabel': 'المدة المتوقعة',
  'detail.locationLabel': 'مكان التقديم',
  'detail.reqTitle': 'المستندات المطلوبة',
  'detail.stepsTitle': 'الخطوات ببساطة',
  'detail.noteTitle': 'المعلومات دي للتوضيح فقط',
  'detail.noteBody': 'راجع المصدر الرسمي قبل التقديم، لأن المتطلبات ممكن تتغير.',
  'detail.official': 'المصدر الرسمي',

  'nf.title': 'الصفحة دي مش موجودة',
  'nf.body': 'خلّينا نرجعك لمكان آمن.',
  'nf.cta': 'العودة للرئيسية',

  'analyze.eyebrow': 'مراجعة المستندات',
  'analyze.title': 'خلّي الورقة مفهومة.',
  'analyze.body': 'ارفع مستندك، وهتلاقي ملخصاً واضحاً لأهم البنود والنقاط اللي تستحق تسأل عنها.',
  'analyze.drop': 'اسحب المستند هنا أو اختار ملفاً',
  'analyze.hint': 'PDF، JPG، PNG أو DOCX · حجم أقصى ١٠ ميجابايت',
  'analyze.start': 'ابدأ المراجعة',
  'analyze.processing': 'بنرتّب لك محتوى المستند...',
  'analyze.processing.sub': 'ثواني ونكون جاهزين بالملخص.',
  'analyze.processing.tag': 'جاري التحليل...',
  'analyze.error.title': 'حصل خطأ أثناء المعالجة',
  'analyze.error.retry': 'جرّب مرة أخرى',
  'analyze.error.generic': 'حدث خطأ أثناء تحليل المستند. حاول مرة أخرى.',
  'analyze.error.server': 'تعذّر الاتصال بالخادم. تأكد من تشغيل الخادم ثم حاول مرة أخرى.',
  'analyze.privacy': 'المستندات في هذا العرض لا يتم تخزينها أو مشاركتها مع أي جهة أخرى. دليل يشرح لك المحتوى، ولا يغني عن مراجعة محامٍ أو الجهة المختصة.',

  'contract.eyebrow': 'ملخص المراجعة',
  'contract.reviewed': 'تمت المراجعة الآن',
  'contract.ask': 'اسأل المستند',
  'contract.overall': 'الملخص العام',
  'contract.overall.title': 'راجع قبل التوقيع',
  'contract.overall.count': 'بنود تستحق نقاشاً',
  'contract.basic': 'معلومات أساسية',
  'contract.duration': 'المدة: {0}',
  'contract.parties': 'الأطراف',
  'contract.type': 'النوع: {0}',
  'contract.note.title': 'إيه معنى المراجعة دي؟',
  'contract.note.body': 'دي نقاط للمراجعة والفهم، مش حكم إن البند مخالف أو غير قانوني. لو حاجة مش واضحة، اسأل الطرف الآخر أو استشير متخصصاً.',
  'contract.clausesTitle': 'بنود تستحق نظرة',
  'contract.clausesSub': 'افتح أي بند علشان تعرف النص وسبب أهميته.',
  'contract.reviewOf': 'مراجعة من {0} صفحات',
  'contract.original': 'النص الأصلي',
  'contract.explanation': 'شرح دليل',
  'contract.why': 'ليه يستحق الانتباه؟',
  'contract.source': 'مصدر للمراجعة',
  'contract.empty': 'لا توجد بنود تستحق مراجعة خاصة في هذا المستند. يمكنك سؤال المستند من صفحة اسأل مستندك.',
  'contract.pages': 'صفحات',
  'contract.unknown': 'غير محددة',
  'doctype.rental_apartments': 'عقد إيجار',
  'doctype.car_contracts': 'عقد سيارة',
  'doctype.employment_contracts': 'عقد عمل',
  'doctype.installment_and_appliance_contracts': 'عقد تقسيط',
  'doctype.telecom_and_subscription_contracts': 'عقد اشتراك',
  'doctype.general_contract_principles': 'مستند تعاقدي',

  'ask.eyebrow': 'اسأل مستندك',
  'ask.title': 'المستند عنده إجابة.',
  'ask.body': 'اسأل عن أي بند في {0}. الإجابات مبنية على محتوى مستندك الفعلي.',
  'ask.connected': 'متصل للمراجعة',
  'ask.document': 'ملف المستند',
  'ask.viewSummary': 'عرض الملخص',
  'ask.greeting': 'أهلاً يا محمد. اسألني عن أي بند في المستند، وأنا أوضح لك مكانه ومعناه.',
  'ask.examples': 'جرّب تسأل',
  'ask.ex1': 'هل أقدر أنهي العقد قبل معاده؟',
  'ask.ex2': 'إيه قيمة التأمين وبيترجع إمتى؟',
  'ask.ex3': 'مين مسؤول عن إصلاحات الشقة؟',
  'ask.placeholder': 'اكتب سؤالك عن المستند...',
  'ask.error.generic': 'حدث خطأ أثناء الإجابة.',
  'ask.error.server': 'حصل خطأ أثناء محاولة الإجابة. تأكد من تشغيل الخادم وحاول مرة أخرى.',
  'ask.footer': 'دليل يساعدك على الفهم، وليس بديلاً عن الاستشارة القانونية أو رأي الجهة المختصة.',
};

const EN: Dict = {
  'app.name': 'Dalil',
  'brand.letter': 'D',
  'nav.dashboard': 'Dashboard',
  'nav.services': 'Services',
  'nav.analyze': 'Analyze',
  'nav.ask': 'Ask',
  'aria.notifications': 'Notifications',
  'aria.menu': 'Menu',
  'aria.sendQuestion': 'Send question',
  'lang.switch': 'عربي',

  'hero.badge': 'Your daily civic guide',
  'hero.h1a': 'Understand before you sign,',
  'hero.h1b': 'and know before you go.',
  'hero.body': 'Dalil helps you understand government services and review your documents and contracts, with clear steps and simple language.',
  'hero.cta1': 'Analyze your document',
  'hero.cta2': 'Explore services',
  'hero.priv': 'Your privacy comes first',
  'hero.simple': 'Simple explanations',
  'hero.card.label': 'Rental contract summary',
  'hero.card.title': 'Know it all before you sign',
  'hero.card.review': 'Clause review',
  'hero.card.points': '3 points to note',
  'hero.card.tip': 'A simple explanation for every clause, with a source you can check.',
  'hero.card.demo': 'Sample info for illustration',

  'steps.eyebrow': 'Three clear steps',
  'steps.title': 'From paper to decision, without the headache',
  'steps.body': 'You do not need to be a legal expert or memorize form names. Dalil sorts out the picture before every step.',
  'step1.title': 'Upload your document',
  'step1.body': 'PDF, image, or DOCX — start from the paper you need to understand.',
  'step2.title': 'Read the explanation',
  'step2.body': 'We explain key terms and clauses in plain language.',
  'step3.title': 'Decide with confidence',
  'step3.body': 'We show your next step and the official source to reference.',

  'explore.eyebrow': 'Not just documents',
  'explore.title': 'When you go, go prepared.',
  'explore.body': 'Explore common Egyptian services and know the papers, steps, and application location before wasting time.',
  'explore.cta': 'See available services',
  'trust.title': 'Stay confident, and take your step informed.',
  'trust.body': 'Dalil is a tool for explanation and help, not a substitute for professional advice.',
  'trust.cta': 'Start with Dalil',

  'dash.account': 'Demo account',
  'dash.greeting': 'Hello, Mohamed',
  'dash.sub': 'Let\'s make your next step clearer.',
  'dash.action1.title': 'Analyze a document',
  'dash.action1.body': 'Understand a contract or paper before you sign',
  'dash.action2.title': 'Explore a service',
  'dash.action2.body': 'Know what is required before you go',
  'dash.action3.title': 'Ask your document',
  'dash.action3.body': 'Get an answer from inside your document',
  'dash.docs.title': 'Your recent documents',
  'dash.upload': 'New document',
  'dash.doc1.name': 'Maadi apartment rental',
  'dash.doc1.meta': 'PDF · 2 days ago',
  'dash.doc1.status': '3 points to note',
  'dash.doc2.name': 'National ID card',
  'dash.doc2.meta': 'Image · May 12, 2024',
  'dash.doc2.status': 'Reviewed',
  'dash.doc3.name': 'Employment contract — Nile Co.',
  'dash.doc3.meta': 'DOCX · May 7, 2024',
  'dash.doc3.status': 'Reviewed',
  'dash.tip.label': 'Tip of the day',
  'dash.tip.title': 'Take a clear photo of the full document',
  'dash.tip.body': 'Make sure every page is visible and the data is readable so the explanation is more accurate.',
  'dash.tip.footer': 'Ready to help yourself',

  'services.eyebrow': 'Service guide',
  'services.title': 'Know before you go.',
  'services.body': 'Common services, gathered in one place with a simple explanation. The following info is sample data for illustration.',
  'services.search.placeholder': 'Search for a service, e.g. national ID card',
  'services.available': 'services available',
  'services.sort': 'Sorted by popularity',
  'services.coming.title': 'More services coming soon',
  'services.coming.body': 'We are constantly adding new services. Stay tuned.',
  'services.empty.title': 'No service with that name yet',
  'services.empty.body': 'Try a simpler keyword or a different category.',
  'services.clear': 'Clear search',
  'cat.all': 'All',
  'cat.civil': 'Civil affairs',
  'cat.realestate': 'Real estate',
  'cat.travel': 'Travel',
  'cat.traffic': 'Traffic',

  'detail.back': 'All services',
  'detail.timeLabel': 'Expected duration',
  'detail.locationLabel': 'Application location',
  'detail.reqTitle': 'Required documents',
  'detail.stepsTitle': 'The steps, simply',
  'detail.noteTitle': 'This information is for illustration only',
  'detail.noteBody': 'Check the official source before applying, as requirements may change.',
  'detail.official': 'Official source',

  'nf.title': 'This page does not exist',
  'nf.body': 'Let\'s get you back to a safe place.',
  'nf.cta': 'Back to home',

  'analyze.eyebrow': 'Document review',
  'analyze.title': 'Make the paper clear.',
  'analyze.body': 'Upload your document and get a clear summary of the key clauses and points worth asking about.',
  'analyze.drop': 'Drop the document here or choose a file',
  'analyze.hint': 'PDF, JPG, PNG, or DOCX · max size 10 MB',
  'analyze.start': 'Start review',
  'analyze.processing': 'Organizing your document...',
  'analyze.processing.sub': 'Seconds and the summary will be ready.',
  'analyze.processing.tag': 'Analyzing...',
  'analyze.error.title': 'Something went wrong',
  'analyze.error.retry': 'Try again',
  'analyze.error.generic': 'An error occurred while analyzing the document. Please try again.',
  'analyze.error.server': 'Could not reach the server. Make sure it is running and try again.',
  'analyze.privacy': 'Documents in this view are not stored or shared with anyone else. Dalil explains the content and is not a substitute for a lawyer or the relevant authority.',

  'contract.eyebrow': 'Review summary',
  'contract.reviewed': 'reviewed just now',
  'contract.ask': 'Ask the document',
  'contract.overall': 'Overall summary',
  'contract.overall.title': 'Review before signing',
  'contract.overall.count': 'clauses worth discussing',
  'contract.basic': 'Key information',
  'contract.duration': 'Duration: {0}',
  'contract.parties': 'Parties',
  'contract.type': 'Type: {0}',
  'contract.note.title': 'What does this review mean?',
  'contract.note.body': 'These are points for review and understanding, not a judgment that a clause is invalid or illegal. If something is unclear, ask the other party or consult a specialist.',
  'contract.clausesTitle': 'Clauses worth a look',
  'contract.clausesSub': 'Open any clause to see its text and why it matters.',
  'contract.reviewOf': 'Review of {0} pages',
  'contract.original': 'Original text',
  'contract.explanation': 'Dalil explanation',
  'contract.why': 'Why does it deserve attention?',
  'contract.source': 'Source for review',
  'contract.empty': 'There are no clauses requiring special review in this document. You can ask the document from the Ask page.',
  'contract.pages': 'pages',
  'contract.unknown': 'not specified',
  'doctype.rental_apartments': 'Rental contract',
  'doctype.car_contracts': 'Car contract',
  'doctype.employment_contracts': 'Employment contract',
  'doctype.installment_and_appliance_contracts': 'Installment contract',
  'doctype.telecom_and_subscription_contracts': 'Subscription contract',
  'doctype.general_contract_principles': 'Contract document',

  'ask.eyebrow': 'Ask your document',
  'ask.title': 'Your document has answers.',
  'ask.body': 'Ask about any clause in {0}. Answers are based on the actual content of your document.',
  'ask.connected': 'connected for review',
  'ask.document': 'document file',
  'ask.viewSummary': 'View summary',
  'ask.greeting': 'Hello, Mohamed. Ask me about any clause in the document and I will show you where it is and what it means.',
  'ask.examples': 'Try asking',
  'ask.ex1': 'Can I terminate the contract before its term?',
  'ask.ex2': 'What is the deposit amount and when is it returned?',
  'ask.ex3': 'Who is responsible for apartment repairs?',
  'ask.placeholder': 'Type your question about the document...',
  'ask.error.generic': 'An error occurred while answering.',
  'ask.error.server': 'An error occurred while trying to answer. Make sure the server is running and try again.',
  'ask.footer': 'Dalil helps you understand and is not a substitute for legal advice or the opinion of the relevant authority.',
};

const DICTS: Record<Lang, Dict> = { ar: AR, en: EN };

export function formatToday(lang: Lang): string {
  const date = new Date();
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface I18nValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ar';
    return (localStorage.getItem(STORAGE_KEY) as Lang) || 'ar';
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[lang];
    return {
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      setLang,
      toggleLang: () => setLang((current) => (current === 'ar' ? 'en' : 'ar')),
      t: (key, params) => {
        let text = dict[key] ?? key;
        if (params) {
          for (const [name, value] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
          }
        }
        return text;
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}