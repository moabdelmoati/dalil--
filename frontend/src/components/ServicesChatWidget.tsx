import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/lib/ui';
import { useLanguage } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ServicesChatWidgetProps {
  serviceId?: string;
  serviceTitle?: string;
}

export function ServicesChatWidget({ serviceId, serviceTitle }: ServicesChatWidgetProps) {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `مرحباً! أنا المساعد الذكي لدليل الخدمات. كيف يمكنني مساعدتك ${serviceTitle ? `بخصوص "${serviceTitle}"` : 'اليوم'}؟`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/services-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceTitle || serviceId,
          message: userMessage.text,
          history: messages.slice(1).map((m) => ({ role: m.role, text: m.text })), // skip welcome message
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في الاتصال بالخادم');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: data.answer },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: 'عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 rounded-full bg-[#3b241a] px-5 py-4 text-[#fffdf9] shadow-xl transition-transform hover:scale-105"
        >
          <Sparkles size={20} className="text-[#e6c58e]" />
          <span className="font-bold">اسأل الذكاء الاصطناعي</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] max-h-[80vh] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl bg-[#fffdf9] shadow-2xl ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#3b241a] p-4 text-[#fffdf9]">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-[#e6c58e] text-[#3b241a]">
                <MessageSquare size={16} />
              </span>
              <div>
                <h3 className="font-bold">مساعد الخدمات</h3>
                {serviceTitle && <p className="text-xs text-[#d8c8b6]">{serviceTitle}</p>}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-[#d8c8b6] hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#3b241a] text-white rounded-tl-sm'
                      : 'bg-[#f7f2ea] border border-[#e1d3c2] text-[#3b241a] rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-[#f7f2ea] border border-[#e1d3c2] text-[#3b241a] rounded-tr-sm">
                  <Loader2 size={16} className="animate-spin text-[#8b674d]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#e1d3c2] bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 rounded-xl border border-[#e1d3c2] bg-[#f7f2ea] px-3 text-sm focus:border-[#8b674d] focus:outline-none focus:ring-1 focus:ring-[#8b674d]"
                dir="rtl"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="size-10 rounded-xl bg-[#3b241a] p-0 hover:bg-[#2a1a12] text-white grid place-items-center shrink-0 disabled:opacity-50"
              >
                <Send size={16} className={lang === 'en' ? '' : 'rotate-180'} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
