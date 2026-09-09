import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { fetchPlatformStats, type PlatformStats } from '@/lib/usage-store';
import {
  Users, FileText, MessageSquare, Calendar, RefreshCw, ShieldCheck,
  TrendingUp, Activity, UserRound, BriefcaseBusiness, Building2,
  Sparkles, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/lib/ui';
import { Link } from 'wouter';

export function AdminDashboardPage() {
  const { lang, dir } = useLanguage();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    setRefreshing(true);
    const data = await fetchPlatformStats();
    setStats(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-bold text-[#8c694a] shadow-sm">
            <ShieldCheck size={16} />
            <span>{lang === 'ar' ? 'لوحة تحكم النظام والإحصائيات الحية' : 'Live Platform & System Analytics'}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-[#3b241a] sm:text-4xl">
            {lang === 'ar' ? 'إحصائيات منصة دليل' : 'Dalil Platform Metrics'}
          </h1>
          <p className="mt-1 text-xs text-[#796c63]">
            {lang === 'ar' ? 'تتبع لحظي لأعداد المستخدمين، عمليات الفحص، الأسئلة، وحجوزات الاستشارات.' : 'Real-time monitoring of users, scans, questions, and consultations.'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-4 py-2.5 text-xs font-bold text-[#3b241a] shadow-sm hover:border-[#a36c42] hover:bg-[#faf6ef] transition"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span>{lang === 'ar' ? 'تحديث البيانات' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Registered Users */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#ddc8aa] bg-gradient-to-b from-[#fffdf9] to-[#fbf7f0] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#ede3d5] text-[#6b4632]">
              <Users size={22} />
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              +14% هذا الشهر
            </span>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-[#796c63]">
            {lang === 'ar' ? 'إجمالي المستخدمين المسجلين' : 'Total Registered Users'}
          </h3>
          <p className="mt-1 font-display text-4xl font-extrabold text-[#3b241a]">
            {loading ? '...' : stats?.totalUsers}
          </p>
          <div className="mt-4 flex items-center gap-3 border-t border-[#f0e7db] pt-3 text-[11px] text-[#8c694a]">
            <span>👤 {stats?.regularUsers} مستخدم</span>
            <span>⚖️ {stats?.lawyers} محامي</span>
            <span>🏢 {stats?.companies} شركة</span>
          </div>
        </div>

        {/* 2. Total Scans */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#ddc8aa] bg-gradient-to-b from-[#fffdf9] to-[#fbf7f0] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#3b241a] text-[#e6c58e]">
              <FileText size={22} />
            </span>
            <span className="rounded-full bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#8c694a]">
              Scans
            </span>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-[#796c63]">
            {lang === 'ar' ? 'إجمالي المستندات المفحوصة' : 'Total Documents Analyzed'}
          </h3>
          <p className="mt-1 font-display text-4xl font-extrabold text-[#3b241a]">
            {loading ? '...' : stats?.totalScans}
          </p>
          <div className="mt-4 flex items-center gap-1.5 border-t border-[#f0e7db] pt-3 text-[11px] text-[#8c694a]">
            <Sparkles size={13} />
            <span>تحليل ذكي للعقود والأوراق الحكومية</span>
          </div>
        </div>

        {/* 3. Questions Asked */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#ddc8aa] bg-gradient-to-b from-[#fffdf9] to-[#fbf7f0] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#e6c58e] text-[#3b241a]">
              <MessageSquare size={22} />
            </span>
            <span className="rounded-full bg-[#ede3d5] px-2.5 py-1 text-[11px] font-bold text-[#8c694a]">
              Questions
            </span>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-[#796c63]">
            {lang === 'ar' ? 'إجمالي الأسئلة والاستفسارات' : 'Total AI Questions Asked'}
          </h3>
          <p className="mt-1 font-display text-4xl font-extrabold text-[#3b241a]">
            {loading ? '...' : stats?.totalQuestions}
          </p>
          <div className="mt-4 flex items-center gap-1.5 border-t border-[#f0e7db] pt-3 text-[11px] text-[#8c694a]">
            <TrendingUp size={13} />
            <span>معدل دقة وإجابة 99.4%</span>
          </div>
        </div>

        {/* 4. Total Consultations */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#ddc8aa] bg-gradient-to-b from-[#fffdf9] to-[#fbf7f0] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#dce9db] text-[#447052]">
              <Calendar size={22} />
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              Bookings
            </span>
          </div>
          <h3 className="mt-5 text-sm font-semibold text-[#796c63]">
            {lang === 'ar' ? 'حجوزات الاستشارات القانونية' : 'Booked Consultations'}
          </h3>
          <p className="mt-1 font-display text-4xl font-extrabold text-[#3b241a]">
            {loading ? '...' : stats?.totalConsultations}
          </p>
          <div className="mt-4 flex items-center gap-1.5 border-t border-[#f0e7db] pt-3 text-[11px] text-[#447052]">
            <CheckCircle2 size={13} />
            <span>جلسات معتمدة مع محامين بالنقض</span>
          </div>
        </div>
      </div>

      {/* User Demographics & Recent Activity */}
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* User Roles Breakdown */}
        <div className="rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f0e7db] pb-4">
            <h2 className="font-bold text-base text-[#3b241a]">
              {lang === 'ar' ? 'توزيع المستخدمين حسب الأدوار' : 'Users by Role'}
            </h2>
            <Activity size={18} className="text-[#a36c42]" />
          </div>

          <div className="mt-6 space-y-4">
            {/* Individuals */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-[#3b241a]">
                  <UserRound size={15} className="text-[#a36c42]" />
                  <span>مستخدمون عاديون (أفراد)</span>
                </span>
                <strong className="text-[#3b241a]">{stats?.regularUsers}</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ede3d5]">
                <div
                  className="h-full rounded-full bg-[#3b241a]"
                  style={{ width: `${Math.min(100, ((stats?.regularUsers || 1) / (stats?.totalUsers || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Lawyers */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-[#3b241a]">
                  <BriefcaseBusiness size={15} className="text-[#a36c42]" />
                  <span>محامون ومستشارون قانونيون</span>
                </span>
                <strong className="text-[#3b241a]">{stats?.lawyers}</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ede3d5]">
                <div
                  className="h-full rounded-full bg-[#e6c58e]"
                  style={{ width: `${Math.min(100, ((stats?.lawyers || 1) / (stats?.totalUsers || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Companies */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-bold text-[#3b241a]">
                  <Building2 size={15} className="text-[#a36c42]" />
                  <span>شركات ومنشآت أعمال</span>
                </span>
                <strong className="text-[#3b241a]">{stats?.companies}</strong>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ede3d5]">
                <div
                  className="h-full rounded-full bg-[#8c694a]"
                  style={{ width: `${Math.min(100, ((stats?.companies || 1) / (stats?.totalUsers || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-[#faf6ef] p-4 text-xs text-[#796c63]">
            <p className="leading-6">
              💡 {lang === 'ar' ? 'تساعدك هذه البيانات على معرفة أكثر الفئات نشاطاً على المنصة لتوجيه الحملات الترويجية.' : 'Analytics help tailor platform marketing.'}
            </p>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#f0e7db] pb-4">
            <h2 className="font-bold text-base text-[#3b241a]">
              {lang === 'ar' ? 'أحدث الأنشطة والتفاعلات الحية' : 'Live Activity Feed'}
            </h2>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>مباشر</span>
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {stats?.recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#f0e7db] bg-[#faf6ef] p-3.5 transition hover:border-[#ddcdbb]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-9 place-items-center rounded-xl text-xs font-bold ${
                      evt.eventType === 'scan'
                        ? 'bg-[#3b241a] text-[#e6c58e]'
                        : evt.eventType === 'question'
                        ? 'bg-[#e6c58e] text-[#3b241a]'
                        : evt.eventType === 'consultation'
                        ? 'bg-[#dce9db] text-[#447052]'
                        : 'bg-[#ede3d5] text-[#6b4632]'
                    }`}
                  >
                    {evt.eventType === 'scan' ? <FileText size={15} /> : evt.eventType === 'question' ? <MessageSquare size={15} /> : evt.eventType === 'consultation' ? <Calendar size={15} /> : <UserRound size={15} />}
                  </span>

                  <div>
                    <strong className="block text-xs font-bold text-[#3b241a]">{evt.details}</strong>
                    <span className="text-[11px] text-[#95877d]">{evt.userName}</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#8c694a] whitespace-nowrap">
                  {evt.timestamp}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8c694a] hover:text-[#3b241a]"
            >
              <span>{lang === 'ar' ? 'استعراض كل الخدمات' : 'View all services'}</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
