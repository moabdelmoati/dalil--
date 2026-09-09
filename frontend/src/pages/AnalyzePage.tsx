import { useState, type ChangeEvent } from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle, ArrowLeft, FileText, LockKeyhole, UploadCloud, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/lib/ui';
import { useAnalysis, type AnalysisResult } from '@/lib/analysis-store';
import { API_BASE_URL } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { canGuestScan, incrementGuestScans, getGuestScansCount, logPlatformEvent } from '@/lib/usage-store';
import { AuthModal } from '@/components/AuthModal';

export function AnalyzePage() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { setAnalysis } = useAnalysis();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [, navigate] = useLocation();

  const isGuest = !user;
  const guestScansDone = getGuestScansCount();
  const guestLimitReached = isGuest && guestScansDone >= 1;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (guestLimitReached) {
      setAuthModalOpen(true);
      return;
    }
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setError(null);
  };

  const startAnalysis = async () => {
    if (!file || processing) return;

    if (guestLimitReached) {
      setAuthModalOpen(true);
      return;
    }

    setProcessing(true);
    setError(null);

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(abortTimeout);

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // response was not JSON
      }
      if (!response.ok) {
        console.error('API /api/analyze error:', response.status, data);
        setError(data && data.error ? data.error : t('analyze.error.generic'));
        setProcessing(false);
        return;
      }

      // Record guest scan and analytics (fire-and-forget, do not block UI transition)
      if (isGuest) {
        incrementGuestScans();
      }
      logPlatformEvent('scan', user?.id, file.name).catch(() => {});

      try {
        const prev = JSON.parse(localStorage.getItem('dalil_recent_scans') || '[]');
        const fileExt = file.name.split('.').pop()?.toUpperCase() || 'PDF';
        const reviewCount = data?.counts?.review || data?.clauses?.length || 0;
        const criticalCount = data?.counts?.critical || 0;
        const newDoc = {
          name: file.name,
          meta: `${fileExt} · ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}`,
          status: reviewCount > 0 
            ? (lang === 'ar' ? `${reviewCount} نقاط تستحق الانتباه` : `${reviewCount} points to note`)
            : (lang === 'ar' ? 'تمت المراجعة' : 'Reviewed'),
          tone: criticalCount > 0 
            ? 'text-[#a13b28] bg-[#f7deda]' 
            : (reviewCount > 0 ? 'text-[#9b5f3a] bg-[#f5e4d8]' : 'text-[#447052] bg-[#dce9db]'),
        };
        const updated = [newDoc, ...prev.filter((d: any) => d.name !== file.name)].slice(0, 5);
        localStorage.setItem('dalil_recent_scans', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('Failed to cache scan to localStorage:', storageErr);
      }

      setAnalysis(data as AnalysisResult, file.name);
      navigate('/contract');
    } catch (err: any) {
      clearTimeout(abortTimeout);
      console.error('Analysis error:', err);
      if (err?.name === 'AbortError') {
        setError(lang === 'ar' ? 'استغرق التحليل وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى أو بملف أصغر.' : 'Analysis timed out. Please try again or use a smaller file.');
      } else {
        setError(t('analyze.error.server'));
      }
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">{t('analyze.eyebrow')}</span>
        <h1 className="mt-3 font-display text-4xl font-bold text-[#3b241a] sm:text-5xl">{t('analyze.title')}</h1>
        <p className="mt-4 leading-8 text-[#796c63]">{t('analyze.body')}</p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        {/* Guest Scan Limit Warning */}
        {guestLimitReached ? (
          <div className="rounded-[1.75rem] border-2 border-[#ddc8aa] bg-gradient-to-b from-[#fffdf9] to-[#faf4ec] p-8 text-center shadow-lg sm:p-12 animate-in fade-in">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e6c58e] text-[#3b241a] shadow-sm">
              <Sparkles size={28} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold text-[#3b241a]">
              {lang === 'ar' ? 'استنفدت فحصك التجريبي المجاني' : 'Free Guest Scan Limit Reached'}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#796c63]">
              {lang === 'ar'
                ? 'لقد قمت بفحص مستند واحد كزائر. لمتابعة فحص مستندات غير محدودة والاستفادة من استشارات الذكاء الاصطناعي، يرجى تسجيل الدخول مجاناً.'
                : 'You have used your 1 free guest scan. To analyze unlimited documents and unlock all features, please sign in.'}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={() => setAuthModalOpen(true)} testId="button-guest-login">
                <LockKeyhole size={16} />
                <span>{lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب مجاني' : 'Sign in / Create Free Account'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!processing && (
              <label className="group block cursor-pointer rounded-[1.75rem] border-2 border-dashed border-[#ccb99f] bg-[#fffdf9] p-8 text-center transition hover:border-[#a36c42] hover:bg-[#fdf8f1] sm:p-14">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={handleFile}
                  className="sr-only"
                  data-testid="input-document-upload"
                />
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#ede3d5] text-[#6b4632] transition group-hover:scale-105 group-hover:bg-[#3b241a] group-hover:text-[#fffdf9]">
                  <UploadCloud size={28} />
                </span>
                <h2 className="mt-6 text-lg font-bold text-[#3b241a]">{file ? file.name : t('analyze.drop')}</h2>
                <p className="mt-2 text-sm text-[#95877d]">{t('analyze.hint')}</p>

                {isGuest && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#ede3d5] px-3 py-1 text-[11px] font-bold text-[#8c694a]">
                    <span>{lang === 'ar' ? 'هدية زائر: فحص مستند واحد مجاناً دون تسجيل' : 'Guest Gift: 1 Free Document Scan'}</span>
                  </div>
                )}

                {file && (
                  <div className="mt-6">
                    <Button onClick={startAnalysis} testId="button-start-analysis">
                      {t('analyze.start')} <ArrowLeft size={16} />
                    </Button>
                  </div>
                )}
              </label>
            )}

            {processing && (
              <div className="rounded-[1.75rem] border border-[#ddcdbb] bg-[#fffdf9] p-8 text-center sm:p-14">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#3b241a] text-[#e6c58e]">
                  <FileText size={27} />
                </span>
                <h2 className="mt-6 text-lg font-bold text-[#3b241a]">{t('analyze.processing')}</h2>
                <p className="mt-2 text-sm text-[#796c63]">{t('analyze.processing.sub')}</p>
                <div className="mx-auto mt-8 h-2 max-w-sm overflow-hidden rounded-full bg-[#ede3d5]">
                  <div className="progress-sheen h-full w-1/2 rounded-full bg-[#a36c42]" />
                </div>
                <p className="mt-3 text-xs font-bold text-[#a36c42]">{t('analyze.processing.tag')}</p>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-[1.75rem] border border-[#e8c0b0] bg-[#fdf3ee] p-8 text-center sm:p-10">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5ded5] text-[#9b3f2a]">
                  <AlertTriangle size={24} />
                </span>
                <h2 className="mt-5 text-lg font-bold text-[#7c3323]">{t('analyze.error.title')}</h2>
                <p className="mt-2 text-sm leading-7 text-[#8a5a4c]">{error}</p>
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setError(null);
                      setFile(null);
                    }}
                    testId="button-retry-upload"
                  >
                    {t('analyze.error.retry')} <ArrowLeft size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#ede3d5]/60 p-4 text-xs leading-6 text-[#806f61]">
          <LockKeyhole size={16} className="mt-1 shrink-0 text-[#a36c42]" />
          <span>{t('analyze.privacy')}</span>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}