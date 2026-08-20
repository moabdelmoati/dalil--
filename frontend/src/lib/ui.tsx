import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

export function Button({ children, href, onClick, variant = 'primary', testId = 'button-action', className = '' }: { children: ReactNode; href?: string; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; testId?: string; className?: string }) {
  const styles = variant === 'primary' ? 'bg-[#3b241a] text-[#fffdf9] shadow-[0_10px_22px_rgba(59,36,26,.15)] hover:-translate-y-0.5 hover:bg-[#533426]' : variant === 'secondary' ? 'border border-[#dccab5] bg-[#fffdf9] text-[#3b241a] hover:-translate-y-0.5 hover:border-[#ad8667] hover:bg-[#fdf7ef]' : 'text-[#6b4632] hover:bg-[#ede3d5]';
  if (href) return <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${styles} ${className}`} data-testid={testId}>{children}</Link>;
  return <button type="button" onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${styles} ${className}`} data-testid={testId}>{children}</button>;
}

export function ArrowRightIcon() { return <ChevronRight size={16} />; }