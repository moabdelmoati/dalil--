import { useState } from 'react';
import { Link, Redirect } from 'wouter';
import { ArrowLeft, FileText, Paperclip } from 'lucide-react';
import { useAnalysis } from '@/lib/analysis-store';
import { useLanguage } from '@/lib/i18n';

type ChatMessage = { role: 'user' | 'model'; text: string };

export function AskPage() {
  const { result, fileName } = useAnalysis();
  const { t } = useLanguage();
  const examples = [t('ask.ex1'), t('ask.ex2'), t('ask.ex3')];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  if (!result) return <Redirect to="/analyze" />;

  const send = async (raw?: string) => {
    const text = (raw ?? question).trim();
    if (!text || loading) return;
    setQuestion('');
    const next = [...messages, { role: 'user' as const, text }];
    setMessages(next);
    setLoading(true);
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: result.documentText,
          documentType: result.documentType,
          question: text,
          history: messages.map((message) => ({ role: message.role, text: message.text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data && data.error ? data.error : t('ask.error.generic'));
      setMessages([...next, { role: 'model', text: data.answer }]);
    } catch {
      setMessages([...next, { role: 'model', text: t('ask.error.server') }]);
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14"><div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold tracking-[.16em] text-[#a36c42]">{t('ask.eyebrow')}</span><h1 className="mt-3 font-display text-4xl font-bold text-[#3b241a] sm:text-5xl">{t('ask.title')}</h1><p className="mt-4 leading-8 text-[#796c63]">{t('ask.body', { 0: result.title })}</p></div><div className="mt-10 overflow-hidden rounded-[1.75rem] border border-[#ddcdbb] bg-[#fffdf9] shadow-[0_14px_36px_rgba(59,36,26,.06)]"><div className="flex items-center justify-between border-b border-[#eee5da] bg-[#fdf8f1] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#3b241a] text-[#e6c58e]"><FileText size={18} /></span><div><p className="text-sm font-bold text-[#3b241a]">{result.title}</p><p className="text-xs text-[#95877d]">{t('ask.connected')} · {fileName ?? t('ask.document')}</p></div></div><Link href="/contract" className="text-xs font-bold text-[#8b674d] hover:text-[#3b241a]" data-testid="link-ask-contract">{t('ask.viewSummary')}</Link></div><div className="min-h-[270px] p-5 sm:p-8"><div className="flex max-w-xl items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6c58e] text-xs font-extrabold text-[#3b241a]">د</span><div className="rounded-2xl rounded-tr-sm bg-[#ede3d5] p-4 text-sm leading-7 text-[#5e5048]">{t('ask.greeting')}</div></div>{messages.map((message, index) => message.role === 'user' ? <div className="mt-5 flex justify-end" key={index}><div className="rounded-2xl rounded-tl-sm bg-[#3b241a] p-4 text-sm leading-7 text-[#fffdf9]">{message.text}</div></div> : <div className="mt-5 flex max-w-xl items-start gap-3" key={index}><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6c58e] text-xs font-extrabold text-[#3b241a]">د</span><div className="rounded-2xl rounded-tr-sm bg-[#ede3d5] p-4 text-sm leading-7 text-[#5e5048]">{message.text}</div></div>)}{loading && <div className="mt-5 flex max-w-xl items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6c58e] text-xs font-extrabold text-[#3b241a]">د</span><div className="rounded-2xl rounded-tr-sm bg-[#ede3d5] p-4 text-sm leading-7 text-[#5e5048]"><span className="inline-flex items-center gap-1.5"><span className="size-1.5 animate-bounce rounded-full bg-[#8f8176]" /><span className="size-1.5 animate-bounce rounded-full bg-[#8f8176] [animation-delay:.15s]" /><span className="size-1.5 animate-bounce rounded-full bg-[#8f8176] [animation-delay:.3s]" /></span></div></div>}</div><div className="border-t border-[#eee5da] p-5"><p className="mb-3 text-xs font-bold text-[#95877d]">{t('ask.examples')}</p><div className="flex flex-wrap gap-2">{examples.map((example, index) => <button type="button" onClick={() => setQuestion(example)} key={example} className="rounded-full border border-[#dfcfbd] px-3.5 py-2 text-xs font-semibold text-[#6b4632] transition hover:border-[#a36c42] hover:bg-[#fdf7ef]" data-testid={`button-question-example-${index}`}>{example}</button>)}</div><div className="mt-5 flex items-center gap-2 rounded-xl border border-[#ddcdbb] bg-[#fdfbf8] p-2 focus-within:border-[#a36c42]"><Paperclip size={18} className="mx-2 text-[#a7907d]" /><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') send(); }} placeholder={t('ask.placeholder')} className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-[#3b241a] outline-none placeholder:text-[#a7907d]" data-testid="input-document-question" /><button type="button" onClick={() => send()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#3b241a] text-[#fffdf9] transition hover:bg-[#533426] disabled:cursor-not-allowed disabled:opacity-40" disabled={!question.trim() || loading} data-testid="button-send-question" aria-label={t('aria.sendQuestion')}><ArrowLeft size={18} /></button></div></div></div><p className="mx-auto mt-5 max-w-xl text-center text-xs leading-6 text-[#95877d]">{t('ask.footer')}</p></div>;
}