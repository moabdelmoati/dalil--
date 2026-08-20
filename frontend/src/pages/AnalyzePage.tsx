import { useState, type ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, ArrowLeft, FileText, LockKeyhole, UploadCloud } from 'lucide-react';
import { Button } from '@/lib/ui';
import { useAnalysis, type AnalysisResult } from '@/lib/analysis-store';

export function AnalyzePage() {
  const { setAnalysis } = useAnalysis();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setError(null);
  };

  const startAnalysis = async () => {
    if (!file || processing) return;
    setProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data && data.error ? data.error : 'حدث خطأ أثناء تحليل المستند. حاول مرة أخرى.');
        setProcessing(false);
        return;
      }
      setAnalysis(data as AnalysisResult, file.name);
      navigate('/contract');
    } catch {
      setError('تعذّر الاتصال بالخادم. تأكد من تشغيل الخادم ثم حاول مرة أخرى.');
      setProcessing(false);
    }
  };

  return <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14"><div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">مراجعة المستندات</span><h1 className="mt-3 font-display text-4xl font-bold text-[#3b241a] sm:text-5xl">خلّي الورقة مفهومة.</h1><p className="mt-4 leading-8 text-[#796c63]">ارفع مستندك، وهتلاقي ملخصاً واضحاً لأهم البنود والنقاط اللي تستحق تسأل عنها.</p></div><div className="mx-auto mt-10 max-w-2xl">{!processing && <label className="group block cursor-pointer rounded-[1.75rem] border-2 border-dashed border-[#ccb99f] bg-[#fffdf9] p-8 text-center transition hover:border-[#a36c42] hover:bg-[#fdf8f1] sm:p-14"><input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFile} className="sr-only" data-testid="input-document-upload" /><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ede3d5] text-[#6b4632] transition group-hover:scale-105 group-hover:bg-[#3b241a] group-hover:text-[#fffdf9]"><UploadCloud size={28} /></span><h2 className="mt-6 text-lg font-bold text-[#3b241a]">{file ? file.name : 'اسحب المستند هنا أو اختار ملفاً'}</h2><p className="mt-2 text-sm text-[#95877d]">PDF، JPG، PNG أو DOCX · حجم أقصى ١٠ ميجابايت</p>{file && <div className="mt-6"><Button onClick={startAnalysis} testId="button-start-analysis">ابدأ المراجعة <ArrowLeft size={16} /></Button></div>}</label>}{processing && <div className="rounded-[1.75rem] border border-[#ddcdbb] bg-[#fffdf9] p-8 text-center sm:p-14"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#3b241a] text-[#e6c58e]"><FileText size={27} /></span><h2 className="mt-6 text-lg font-bold text-[#3b241a]">بنرتّب لك محتوى المستند...</h2><p className="mt-2 text-sm text-[#796c63]">ثواني ونكون جاهزين بالملخص.</p><div className="mx-auto mt-8 h-2 max-w-sm overflow-hidden rounded-full bg-[#ede3d5]"><div className="progress-sheen h-full w-1/2 rounded-full bg-[#a36c42]" /></div><p className="mt-3 text-xs font-bold text-[#a36c42]">جاري التحليل...</p></div>}{error && <div className="mt-6 rounded-[1.75rem] border border-[#e8c0b0] bg-[#fdf3ee] p-8 text-center sm:p-10"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5ded5] text-[#9b3f2a]"><AlertTriangle size={24} /></span><h2 className="mt-5 text-lg font-bold text-[#7c3323]">حصل خطأ أثناء المعالجة</h2><p className="mt-2 text-sm leading-7 text-[#8a5a4c]">{error}</p><div className="mt-6"><Button onClick={() => { setError(null); setFile(null); }} testId="button-retry-upload">جرّب مرة أخرى <ArrowLeft size={16} /></Button></div></div>}<div className="mt-6 flex items-start gap-3 rounded-xl bg-[#ede3d5]/60 p-4 text-xs leading-6 text-[#806f61]"><LockKeyhole size={16} className="mt-1 shrink-0 text-[#a36c42]" /><span>المستندات في هذا العرض لا يتم تخزينها أو مشاركتها مع أي جهة أخرى. دليل يشرح لك المحتوى، ولا يغني عن مراجعة محامٍ أو الجهة المختصة.</span></div></div></div>;
}