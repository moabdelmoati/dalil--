import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Check,
  X as XIcon,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Plan {
  id: string;
  icon: string;
  name: string;
  price: number;
  color: string;
}

const plans: Plan[] = [
  { id: 'free', icon: '🆓', name: 'Free', price: 0, color: 'text-gray-600' },
  { id: 'student', icon: '🎓', name: 'Student', price: 49, color: 'text-blue-600' },
  { id: 'pro', icon: '⭐', name: 'Pro', price: 99, color: 'text-amber-600' },
  { id: 'professional', icon: '💼', name: 'Professional', price: 249, color: 'text-purple-600' },
  { id: 'business', icon: '🏢', name: 'Business', price: 599, color: 'text-emerald-600' },
];

const features = [
  { key: 'docs', label: 'Documents / month', values: ['5', '30', '100', '300', '1,000'] },
  { key: 'size', label: 'Max file size', values: ['10 MB', '20 MB', '30 MB', '50 MB', '100 MB'] },
  { key: 'storage', label: 'Storage', values: ['100 MB', '500 MB', '2 GB', '10 GB', '50 GB'] },
  { key: 'ai', label: 'AI Analysis', values: ['محدود', '✅', '✅', '✅ Advanced', '✅ Advanced'] },
  { key: 'questions', label: 'Questions', values: ['20', '150', '500', '2,000', '7,000'] },
  { key: 'pdf', label: 'PDF', values: ['✅', '✅', '✅', '✅', '✅'] },
  { key: 'docx', label: 'DOCX', values: ['✅', '✅', '✅', '✅', '✅'] },
  { key: 'jpg', label: 'JPG/PNG', values: ['✅', '✅', '✅', '✅', '✅'] },
  { key: 'summary', label: 'Document Summary', values: ['✅', '✅', '✅', '✅', '✅'] },
  { key: 'extraction', label: 'Key Information Extraction', values: ['❌', '✅', '✅', '✅', '✅'] },
  { key: 'advanced', label: 'Advanced Analysis', values: ['❌', '❌', '✅', '✅', '✅'] },
  { key: 'history', label: 'Document History', values: ['❌', '✅', '✅', '✅', '✅'] },
  { key: 'export', label: 'Export Report', values: ['❌', '❌', '✅', '✅', '✅'] },
  { key: 'priority', label: 'Priority Processing', values: ['❌', '❌', '❌', '✅', '✅'] },
  { key: 'team', label: 'Team Members', values: ['1', '1', '1', '1', '5'] },
  { key: 'shared', label: 'Shared Workspace', values: ['❌', '❌', '❌', '❌', '✅'] },
  { key: 'audit', label: 'Audit Logs', values: ['❌', '❌', '❌', '❌', '✅'] },
  { key: 'support', label: 'Support', values: ['Community', 'Basic', 'Basic', 'Priority', 'Priority'] },
];

export function PricingPage() {
  const { dir, lang } = useLanguage();
  const [, navigate] = useLocation();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setSubscribeSuccess(true);
    }, 1200);
  };

  const renderValue = (val: string) => {
    if (val === '✅') return <Check className="mx-auto text-green-600" size={20} />;
    if (val === '❌') return <XIcon className="mx-auto text-red-500/50" size={20} />;
    if (val === '✅ Advanced') return <span className="text-green-600 font-bold flex items-center justify-center gap-1"><Check size={16}/> Advanced</span>;
    return <span className="font-medium">{val}</span>;
  };

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-16">
      {/* Header section */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <span className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[.16em] text-[#a36c42]">
          <span className="size-2 rounded-full bg-[#d9ab65]" />
          {lang === 'ar' ? 'باقات دليل الجديدة' : 'Dalil New Subscriptions'}
        </span>
        <h1 className="font-display text-4xl font-bold leading-tight text-[#3b241a] sm:text-5xl">
          {lang === 'ar' ? 'اختر الخطة المناسبة لك' : 'Choose Your Plan'}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#796c63]">
          {lang === 'ar' 
            ? 'باقات جديدة مرنة تناسب الطلاب، المحترفين، والمؤسسات. اشترك الآن لتستفيد من قدرات الذكاء الاصطناعي.'
            : 'New flexible plans for students, professionals, and businesses.'}
        </p>
      </div>

      {/* Pricing Table Desktop */}
      <div className="overflow-x-auto rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] shadow-xl">
        <table className="w-full text-left text-sm text-[#5e5048]" dir="ltr">
          <thead className="bg-[#fdf7ef] border-b border-[#ddcdbb]">
            <tr>
              <th className="p-4 lg:p-6 font-bold text-[#3b241a] w-[20%] text-lg border-r border-[#ddcdbb]/30">Features</th>
              {plans.map(plan => (
                <th key={plan.id} className="p-4 lg:p-6 text-center w-[16%] border-r border-[#ddcdbb]/30 last:border-0">
                  <div className={`text-3xl mb-2 ${plan.color}`}>{plan.icon}</div>
                  <div className="font-display font-bold text-xl text-[#3b241a] mb-1">{plan.name}</div>
                  <div className="text-xl lg:text-2xl font-extrabold text-[#a36c42] my-3">
                    {plan.price === 0 ? 'Free' : `${plan.price} EGP`}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setSubscribeSuccess(false);
                    }}
                    className={`mt-2 w-full py-2.5 rounded-xl font-bold transition-all text-xs lg:text-sm
                      ${plan.id === 'pro' || plan.id === 'professional' 
                        ? 'bg-[#3b241a] text-[#fffdf9] hover:bg-[#2a1a12] shadow-md' 
                        : 'bg-white border border-[#ddcdbb] text-[#3b241a] hover:bg-[#f7f2ea]'}`}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee5da]">
            {features.map((feat, i) => (
              <tr key={i} className="hover:bg-white/60 transition-colors">
                <td className="p-3 lg:p-4 px-4 lg:px-6 font-semibold text-[#3b241a] border-r border-[#ddcdbb]/30 bg-[#fdf7ef]/30">
                  {feat.label}
                </td>
                {feat.values.map((val, j) => (
                  <td key={j} className={`p-3 lg:p-4 text-center border-r border-[#ddcdbb]/30 last:border-0 ${
                    j % 2 !== 0 ? 'bg-gray-50/30' : ''
                  }`}>
                    {renderValue(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscribe Modal */}
      {selectedPlan && (
        <div dir={dir} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-[#fffdf9] p-8 shadow-2xl">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute left-5 top-5 grid size-9 place-items-center rounded-full bg-[#ede3d5] text-[#6b4632] hover:bg-[#3b241a] hover:text-[#fffdf9]"
            >
              <XIcon size={18} />
            </button>

            {!subscribeSuccess ? (
              <div>
                <h2 className="font-display text-2xl font-bold text-[#3b241a] text-center mb-6">
                  {lang === 'ar' ? 'تأكيد الاشتراك' : 'Confirm Subscription'}
                </h2>
                
                <div className="bg-[#fdf7ef] rounded-2xl p-6 border border-[#ddc8aa] mb-8 text-center">
                  <div className="text-sm font-bold text-[#a36c42] mb-2">
                    {plans.find(p => p.id === selectedPlan)?.name} Plan
                  </div>
                  <div className="text-4xl font-extrabold text-[#3b241a]">
                    {plans.find(p => p.id === selectedPlan)?.price === 0 ? 'Free' : `${plans.find(p => p.id === selectedPlan)?.price} EGP`}
                  </div>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-6">
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="flex w-full items-center justify-center rounded-xl bg-[#3b241a] py-4 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426] disabled:opacity-75"
                  >
                    {isSubscribing ? 'Processing...' : (lang === 'ar' ? 'متابعة الدفع' : 'Proceed to Payment')}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-6 text-center">
                <span className="grid size-16 mx-auto place-items-center rounded-2xl bg-[#dce9db] text-[#447052] mb-6">
                  <CheckCircle2 size={36} />
                </span>
                <h3 className="font-display text-2xl font-bold text-[#3b241a] mb-2">
                  {lang === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed Successfully!'}
                </h3>
                <p className="text-sm text-[#796c63] mb-8">
                  {lang === 'ar' ? 'تم تفعيل خطتك الجديدة. يمكنك الآن الاستمتاع بكافة الميزات.' : 'Your new plan is active.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    navigate('/dashboard');
                  }}
                  className="w-full rounded-xl bg-[#3b241a] py-3.5 text-sm font-bold text-[#fffdf9] transition hover:bg-[#533426]"
                >
                  {lang === 'ar' ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
