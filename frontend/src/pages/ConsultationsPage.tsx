import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { logPlatformEvent } from '@/lib/usage-store';
import {
  BriefcaseBusiness, Calendar, Clock, Star, ShieldCheck, CheckCircle2,
  Video, Phone, Building, User, Filter, Search, ArrowLeft, ArrowRight,
  Sparkles, Check, AlertCircle, X, ChevronLeft, Plus, MessageSquare,
  DollarSign, FileText, Play, CheckCircle, Clock3, UserCheck, PhoneCall,
  ExternalLink, Eye, RefreshCw, Mail
} from 'lucide-react';
import { Button } from '@/lib/ui';
import { AuthModal } from '@/components/AuthModal';

export interface Lawyer {
  id: string;
  name: string;
  title: string;
  specialty: string;
  specialtyId: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number; // EGP
  location: string;
  avatar: string;
  availableDays: string;
}

export interface ConsultationBooking {
  id: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  lawyerName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  type: 'video' | 'phone' | 'office';
  details: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  fee?: number;
  createdAt: string;
  notes?: string;
}

const mockLawyers: Lawyer[] = [
  {
    id: '1',
    name: 'المستشار / طارق عبد العزيز',
    title: 'محامي بالنقض ومستشار عقود عقارية وتجارية',
    specialty: 'عقارات وعقود',
    specialtyId: 'realestate',
    experienceYears: 18,
    rating: 4.9,
    reviewCount: 142,
    consultationFee: 350,
    location: 'مدينة نصر، القاهرة',
    avatar: 'ط',
    availableDays: 'السبت، الإثنين، الأربعاء',
  },
  {
    id: '2',
    name: 'الأستاذة / نادية الشناوي',
    title: 'محامية متخصصة في تأسيس الشركات والامتثال الضريبي',
    specialty: 'شركات واستثمار',
    specialtyId: 'corporate',
    experienceYears: 12,
    rating: 5.0,
    reviewCount: 98,
    consultationFee: 450,
    location: 'المهندسين، الجيزة',
    avatar: 'ن',
    availableDays: 'الأحد، الثلاثاء، الخميس',
  },
  {
    id: '3',
    name: 'الأستاذ / سامح فوزي',
    title: 'محامي متخصص في قضايا العمل والنزاعات العمالية',
    specialty: 'قضايا عمالية',
    specialtyId: 'labor',
    experienceYears: 10,
    rating: 4.8,
    reviewCount: 76,
    consultationFee: 250,
    location: 'وسط البلد، القاهرة',
    avatar: 'س',
    availableDays: 'يومياً ما عدا الجمعة',
  },
  {
    id: '4',
    name: 'المستشارة / هبة المنشاوي',
    title: 'خبيرة قضايا الأسرة والأحوال الشخصية والتركات',
    specialty: 'أحوال شخصية وتركات',
    specialtyId: 'family',
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 185,
    consultationFee: 300,
    location: 'المعادي، القاهرة',
    avatar: 'هـ',
    availableDays: 'السبت، الأحد، الأربعاء',
  },
  {
    id: '5',
    name: 'الأستاذ / شريف جلال',
    title: 'محامي جنائي ونقض واستئناف عالي',
    specialty: 'قضايا جنائية',
    specialtyId: 'criminal',
    experienceYears: 20,
    rating: 4.9,
    reviewCount: 210,
    consultationFee: 500,
    location: 'الدقي، الجيزة',
    avatar: 'ش',
    availableDays: 'طوال أيام الأسبوع',
  },
];

const specialties = [
  { id: 'all', label: 'كافة التخصصات', en: 'All Specialties' },
  { id: 'realestate', label: 'عقارات وعقود', en: 'Real Estate & Contracts' },
  { id: 'corporate', label: 'شركات واستثمار', en: 'Corporate & Business' },
  { id: 'labor', label: 'قضايا عمالية', en: 'Labor & Employment' },
  { id: 'family', label: 'أحوال شخصية وتركات', en: 'Family Law' },
  { id: 'criminal', label: 'قضايا جنائية', en: 'Criminal Defense' },
];

// Initial realistic consultations for lawyers
const defaultLawyerConsultations: ConsultationBooking[] = [
  {
    id: 'con-101',
    clientName: 'م/ حازم الشريف',
    clientPhone: '01012345678',
    clientEmail: 'hazem.eng@gmail.com',
    lawyerName: 'المحامي',
    specialty: 'عقارات وعقود',
    date: new Date().toISOString().split('T')[0], // اليوم
    timeSlot: '04:30 م - 05:00 م',
    type: 'video',
    details: 'مراجعة عقد شراء قطعة أرض صناعية في العاشر من رمضان والتحقق من صحة توقيع البائع والسجل العيني وتجنب النزاعات العقارية.',
    status: 'confirmed',
    fee: 450,
    createdAt: 'اليوم، 10:15 ص',
    notes: 'المستندات تم إرفاقها وتتضمن صورة العقد وسند الملكية.',
  },
  {
    id: 'con-102',
    clientName: 'شركة النيل للتقنية (أ. عمر كمال)',
    clientPhone: '01198765432',
    clientEmail: 'omar@niletech.eg',
    lawyerName: 'المحامي',
    specialty: 'قضايا عمالية وشركات',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // غداً
    timeSlot: '02:00 م - 02:45 م',
    type: 'video',
    details: 'صياغة وتعديل لائحة العمل الداخلية للمؤسسة وتوافقها مع قانون العمل المصري رقم 14 لسنة 2025 وشروط الفصل التعسفي.',
    status: 'confirmed',
    fee: 600,
    createdAt: 'أمس، 06:40 م',
  },
  {
    id: 'con-103',
    clientName: 'السيدة / منى عبد الرحمن',
    clientPhone: '01234567890',
    clientEmail: 'mona.abdel@outlook.com',
    lawyerName: 'المحامي',
    specialty: 'أحوال شخصية وتركات',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    timeSlot: '06:00 م - 06:30 م',
    type: 'office',
    details: 'استشارة بخصوص دعوى فرز وتجنيب تركة عقارية ووقف التعديات على أملاك الورثة الشرعيين.',
    status: 'pending',
    fee: 350,
    createdAt: 'أمس، 02:20 م',
  },
  {
    id: 'con-104',
    clientName: 'أ/ خالد الصاوي',
    clientPhone: '01555544433',
    clientEmail: 'khaled.sawy@yahoo.com',
    lawyerName: 'المحامي',
    specialty: 'قضايا عمالية',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    timeSlot: '01:00 م - 01:30 م',
    type: 'phone',
    details: 'نزاع عمالي وإنهاء خدمة بدون إخطار قانوني والمطالبة بمستحقات مكافأة نهاية الخدمة ورصيد الإجازات.',
    status: 'completed',
    fee: 250,
    createdAt: 'منذ 3 أيام',
    notes: 'تمت الاستشارة هاتفياً وإرشاد الموكل لتقديم شكوى في مكتب العمل.',
  },
];

export function ConsultationsPage() {
  const { user, profile } = useAuth();
  const { lang, dir } = useLanguage();

  const isLawyer = profile?.role === 'lawyer';

  // State
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all');

  // Active tab: If user is lawyer, default to 'lawyer-dashboard', otherwise 'browse'
  const [activeTab, setActiveTab] = useState<'browse' | 'my-bookings' | 'lawyer-dashboard'>(
    isLawyer ? 'lawyer-dashboard' : 'browse'
  );

  // Sync activeTab when profile loads/changes
  useEffect(() => {
    if (isLawyer) {
      setActiveTab('lawyer-dashboard');
    }
  }, [isLawyer]);

  // Lawyer Consultations List
  const [lawyerConsultations, setLawyerConsultations] = useState<ConsultationBooking[]>(() => {
    try {
      const stored = localStorage.getItem('dalil_lawyer_consultations');
      return stored ? JSON.parse(stored) : defaultLawyerConsultations;
    } catch {
      return defaultLawyerConsultations;
    }
  });

  // Client's own bookings
  const [myBookings, setMyBookings] = useState<ConsultationBooking[]>(() => {
    try {
      const stored = localStorage.getItem('dalil_saved_consultations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Booking Modal State (for regular clients)
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('11:00 ص - 11:30 ص');
  const [bookingType, setBookingType] = useState<'video' | 'phone' | 'office'>('video');
  const [caseDescription, setCaseDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Active Call/Session Modal for Lawyer
  const [activeSession, setActiveSession] = useState<ConsultationBooking | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // Add Consultation Modal for Lawyer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('12:00 م - 12:30 م');
  const [newType, setNewType] = useState<'video' | 'phone' | 'office'>('video');
  const [newFee, setNewFee] = useState(350);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filtered lawyers for browsing
  const filteredLawyers = mockLawyers.filter((lawyer) => {
    const matchesSpecialty = selectedSpecialty === 'all' || lawyer.specialtyId === selectedSpecialty;
    const matchesSearch =
      lawyer.name.includes(searchQuery) ||
      lawyer.title.includes(searchQuery) ||
      lawyer.specialty.includes(searchQuery) ||
      lawyer.location.includes(searchQuery);
    return matchesSpecialty && matchesSearch;
  });

  // Filtered consultations for lawyer
  const filteredLawyerConsultations = lawyerConsultations.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.clientName?.includes(searchQuery) ||
      item.details.includes(searchQuery) ||
      item.specialty.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Stats calculation for Lawyer
  const totalBookings = lawyerConsultations.length;
  const confirmedCount = lawyerConsultations.filter((c) => c.status === 'confirmed').length;
  const pendingCount = lawyerConsultations.filter((c) => c.status === 'pending').length;
  const completedCount = lawyerConsultations.filter((c) => c.status === 'completed').length;
  const totalEarnings = lawyerConsultations
    .filter((c) => c.status === 'confirmed' || c.status === 'completed')
    .reduce((sum, c) => sum + (c.fee || 350), 0);

  // Action handlers for Lawyer
  const handleUpdateStatus = (id: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    const updated = lawyerConsultations.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    setLawyerConsultations(updated);
    localStorage.setItem('dalil_lawyer_consultations', JSON.stringify(updated));
  };

  const handleAddManualConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newTopic) return;

    const newBooking: ConsultationBooking = {
      id: 'con-' + Math.random().toString(36).substring(2, 7),
      clientName: newClientName,
      clientPhone: newClientPhone,
      lawyerName: profile?.full_name || 'أنت (المحامي)',
      specialty: 'استشارة عامة',
      date: newDate,
      timeSlot: newTime,
      type: newType,
      details: newTopic,
      status: 'confirmed',
      fee: Number(newFee) || 350,
      createdAt: 'اليوم',
    };

    const updated = [newBooking, ...lawyerConsultations];
    setLawyerConsultations(updated);
    localStorage.setItem('dalil_lawyer_consultations', JSON.stringify(updated));

    setIsAddModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewTopic('');
  };

  // Client booking flow
  const handleStartBooking = (lawyer: Lawyer) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedLawyer(lawyer);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) return;

    setIsSubmitting(true);

    const newBooking: ConsultationBooking = {
      id: 'book-' + Math.random().toString(36).substring(2, 9),
      clientName: profile?.full_name || user?.email?.split('@')[0] || 'العميل',
      lawyerName: selectedLawyer.name,
      specialty: selectedLawyer.specialty,
      date: bookingDate,
      timeSlot: bookingTime,
      type: bookingType,
      details: caseDescription,
      status: 'confirmed',
      fee: selectedLawyer.consultationFee,
      createdAt: new Date().toLocaleDateString('ar-EG'),
    };

    // Save to client's bookings
    const updatedClient = [newBooking, ...myBookings];
    setMyBookings(updatedClient);
    localStorage.setItem('dalil_saved_consultations', JSON.stringify(updatedClient));

    // Also add to lawyer consultations so lawyer sees it immediately!
    const updatedLawyer = [newBooking, ...lawyerConsultations];
    setLawyerConsultations(updatedLawyer);
    localStorage.setItem('dalil_lawyer_consultations', JSON.stringify(updatedLawyer));

    await logPlatformEvent('consultation', user?.id, `حجز استشارة مع ${selectedLawyer.name}`);

    setIsSubmitting(false);
    setBookingSuccess(true);
  };

  return (
    <div dir={dir} className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ddc8aa] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-bold text-[#8c694a] shadow-sm">
            <ShieldCheck size={16} />
            <span>
              {isLawyer
                ? (lang === 'ar' ? 'بوابة المحامي المعتمد' : 'Certified Lawyer Portal')
                : (lang === 'ar' ? 'محامون معتمدون وموثقون' : 'Certified Legal Advisors')}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold text-[#3b241a] sm:text-5xl">
            {isLawyer && activeTab === 'lawyer-dashboard'
              ? (lang === 'ar' ? 'الاستشارات المحجوزة لديك' : 'Your Booked Consultations')
              : (lang === 'ar' ? 'حجز استشارة قانونية' : 'Book a Legal Consultation')}
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#796c63] sm:text-base">
            {isLawyer && activeTab === 'lawyer-dashboard'
              ? (lang === 'ar'
                ? `أهلاً بك يا ${profile?.full_name || 'أستاذنا الكريم'}. هنا تجد جميع طلبات الاستشارة الواردة من الموكلين، مواعيد الجلسات، وأدوات بدء المكالمات المباشرة.`
                : 'Manage incoming consultation bookings from clients, confirm appointments, and start live video/phone sessions.')
              : (lang === 'ar'
                ? 'تواصل مباشرة مع نخبة من المحامين والمستشارين القانونيين المعتمدين في مصر عبر مكالمة فيديو، هاتف، أو مقابلة بمكتب المحامي.'
                : 'Directly connect with top certified Egyptian lawyers for verified legal advice.')}
          </p>
        </div>

        {/* View Tabs Header */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] p-1.5 shadow-sm">
          {isLawyer ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('lawyer-dashboard')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'lawyer-dashboard'
                    ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm'
                    : 'text-[#796c63] hover:text-[#3b241a]'
                }`}
              >
                <Calendar size={16} />
                <span>{lang === 'ar' ? 'استشاراتي المحجوزة' : 'Incoming Bookings'}</span>
                <span className="grid size-5 place-items-center rounded-full bg-[#e6c58e] text-[10px] font-bold text-[#3b241a]">
                  {lawyerConsultations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  activeTab === 'browse'
                    ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm'
                    : 'text-[#796c63] hover:text-[#3b241a]'
                }`}
              >
                <BriefcaseBusiness size={15} />
                <span>{lang === 'ar' ? 'دليل المحامين' : 'Lawyers Directory'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'browse'
                    ? 'bg-[#3b241a] text-[#fffdf9]'
                    : 'text-[#796c63] hover:text-[#3b241a]'
                }`}
              >
                <BriefcaseBusiness size={16} />
                <span>{lang === 'ar' ? 'استعراض المحامين' : 'Browse Lawyers'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my-bookings')}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === 'my-bookings'
                    ? 'bg-[#3b241a] text-[#fffdf9]'
                    : 'text-[#796c63] hover:text-[#3b241a]'
                }`}
              >
                <Calendar size={16} />
                <span>{lang === 'ar' ? 'استشاراتي المحجوزة' : 'My Bookings'}</span>
                {myBookings.length > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-[#e6c58e] text-[10px] font-bold text-[#3b241a]">
                    {myBookings.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LAWYER DASHBOARD VIEW: BOOKED CONSULTATIONS FOR LAWYERS               */}
      {/* ========================================================================= */}
      {isLawyer && activeTab === 'lawyer-dashboard' && (
        <div className="mt-8 space-y-8 animate-in fade-in duration-300">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
            <div className="rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#8c694a]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'إجمالي الاستشارات' : 'Total Bookings'}</span>
                <Calendar size={18} />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#3b241a] sm:text-3xl">{totalBookings}</p>
              <span className="mt-1 block text-[11px] text-[#95877d]">{lang === 'ar' ? 'طلبات واردة من الموكلين' : 'Incoming client requests'}</span>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-xs font-bold">{lang === 'ar' ? 'مواعيد مؤكدة' : 'Confirmed'}</span>
                <CheckCircle2 size={18} />
              </div>
              <p className="mt-3 text-2xl font-bold text-emerald-950 sm:text-3xl">{confirmedCount}</p>
              <span className="mt-1 block text-[11px] text-emerald-800">{lang === 'ar' ? 'جاهزة للانعقاد' : 'Ready to start'}</span>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-bold">{lang === 'ar' ? 'قيد المراجعة والتأكيد' : 'Pending Review'}</span>
                <Clock3 size={18} />
              </div>
              <p className="mt-3 text-2xl font-bold text-amber-950 sm:text-3xl">{pendingCount}</p>
              <span className="mt-1 block text-[11px] text-amber-800">{lang === 'ar' ? 'بانتظار موافقتك' : 'Needs approval'}</span>
            </div>

            <div className="rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#8c694a]">
                <span className="text-xs font-bold">{lang === 'ar' ? 'إجمالي الأتعاب' : 'Total Fees'}</span>
                <DollarSign size={18} />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#3b241a] sm:text-3xl">{totalEarnings.toLocaleString()} <span className="text-sm font-normal text-[#8c694a]">ج.م</span></p>
              <span className="mt-1 block text-[11px] text-[#95877d]">{lang === 'ar' ? 'المستحقات المقدرة' : 'Expected revenue'}</span>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="flex flex-col gap-4 rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a7907d]" size={17} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث باسم الموكل أو الموضوع أو القضية...' : 'Search by client, topic or case...'}
                className="h-11 w-full rounded-2xl border border-[#e4d8c9] bg-[#faf6ef] pr-11 pl-4 text-xs text-[#3b241a] placeholder:text-[#a7907d] focus:border-[#a36c42] focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all' as const, label: 'الكل' },
                { id: 'confirmed' as const, label: 'مؤكدة' },
                { id: 'pending' as const, label: 'قيد الانتظار' },
                { id: 'completed' as const, label: 'مكتملة' },
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    statusFilter === f.id
                      ? 'bg-[#3b241a] text-[#fffdf9] shadow-sm'
                      : 'bg-[#ede3d5] text-[#6b4632] hover:bg-[#e2d3c0]'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <Button
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[#8c694a] hover:bg-[#725237] text-white"
              >
                <Plus size={15} />
                <span>{lang === 'ar' ? 'إضافة استشارة' : 'Add Booking'}</span>
              </Button>
            </div>
          </div>

          {/* Lawyer Consultations Cards */}
          {filteredLawyerConsultations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ddcdbb] bg-[#fffdf9] p-12 text-center">
              <Calendar className="mx-auto size-12 text-[#bca797]" />
              <h3 className="mt-3 text-base font-bold text-[#3b241a]">
                {lang === 'ar' ? 'لا توجد استشارات مطابقة للبحث' : 'No matching consultations found'}
              </h3>
              <p className="mt-1 text-xs text-[#796c63]">
                {lang === 'ar' ? 'ستظهر هنا أي استشارات جديدة يحجزها الموكلون معك فوراً.' : 'Any new appointments booked by clients will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredLawyerConsultations.map((booking) => {
                const isConfirmed = booking.status === 'confirmed';
                const isPending = booking.status === 'pending';
                const isCompleted = booking.status === 'completed';

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col justify-between rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      {/* Top Row: Client & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-12 place-items-center rounded-2xl bg-[#ede3d5] text-base font-bold text-[#3b241a]">
                            {booking.clientName ? booking.clientName.charAt(0) : 'م'}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#3b241a] flex items-center gap-2">
                              <span>{booking.clientName || 'موكل المنصة'}</span>
                            </h3>
                            <span className="text-xs font-semibold text-[#8c694a]">{booking.specialty}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={13} />
                            <span>{lang === 'ar' ? 'مؤكدة' : 'Confirmed'}</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                            <Clock3 size={13} />
                            <span>{lang === 'ar' ? 'بانتظار التأكيد' : 'Pending'}</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                            <Check size={13} />
                            <span>{lang === 'ar' ? 'مكتملة' : 'Completed'}</span>
                          </span>
                        )}
                      </div>

                      {/* Case Details */}
                      <div className="mt-4 rounded-2xl bg-[#faf6ef] p-4 text-xs leading-6 text-[#5b4a40]">
                        <span className="font-bold text-[#3b241a] block mb-1">
                          {lang === 'ar' ? 'موضوع الاستشارة وتفاصيل القضية:' : 'Consultation details:'}
                        </span>
                        <p>{booking.details}</p>
                      </div>

                      {/* Time & Mode Grid */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-[#efe5d7] bg-[#fffdf9] p-3 text-xs">
                        <div>
                          <span className="block text-[11px] text-[#95877d]">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span>
                          <strong className="text-[#3b241a]">{booking.date}</strong>
                        </div>
                        <div>
                          <span className="block text-[11px] text-[#95877d]">{lang === 'ar' ? 'الموعد:' : 'Time:'}</span>
                          <strong className="text-[#3b241a]">{booking.timeSlot}</strong>
                        </div>
                        <div>
                          <span className="block text-[11px] text-[#95877d]">{lang === 'ar' ? 'الأتعاب:' : 'Fee:'}</span>
                          <strong className="text-emerald-800">{booking.fee || 350} ج.م</strong>
                        </div>
                      </div>

                      {/* Contact Info if available */}
                      {(booking.clientPhone || booking.clientEmail) && (
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#796c63]">
                          {booking.clientPhone && (
                            <span className="flex items-center gap-1">
                              <Phone size={13} className="text-[#8c694a]" />
                              <span>{booking.clientPhone}</span>
                            </span>
                          )}
                          {booking.clientEmail && (
                            <span className="flex items-center gap-1">
                              <Mail size={13} className="text-[#8c694a]" />
                              <span>{booking.clientEmail}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for Lawyer */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0e7db] pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#8c694a]">
                        {booking.type === 'video' && <Video size={16} className="text-blue-600" />}
                        {booking.type === 'phone' && <Phone size={16} className="text-emerald-600" />}
                        {booking.type === 'office' && <Building size={16} className="text-[#8c694a]" />}
                        <span>
                          {booking.type === 'video'
                            ? (lang === 'ar' ? 'جلسة فيديو مباشرة' : 'Live Video')
                            : booking.type === 'phone'
                            ? (lang === 'ar' ? 'اتصال صوتي' : 'Phone Call')
                            : (lang === 'ar' ? 'حضور بالمكتب' : 'Office Visit')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
                          >
                            <CheckCircle2 size={14} className="ml-1" />
                            {lang === 'ar' ? 'تأكيد الموعد' : 'Confirm'}
                          </Button>
                        )}

                        {isConfirmed && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActiveSession(booking);
                                setIsCallActive(true);
                              }}
                              className="bg-[#3b241a] hover:bg-[#513426] text-white text-xs shadow-sm flex items-center gap-1"
                            >
                              <Play size={13} />
                              <span>{lang === 'ar' ? 'بدء الجلسة الآن' : 'Start Session'}</span>
                            </Button>

                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              {lang === 'ar' ? 'تم الانعقاد' : 'Mark Done'}
                            </button>
                          </>
                        )}

                        {isCompleted && (
                          <span className="text-xs font-semibold text-[#8c694a] bg-[#faf6ef] px-3 py-1 rounded-xl">
                            {lang === 'ar' ? '✓ تم تقديم الاستشارة بنجاح' : '✓ Completed'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. REGULAR BROWSE LAWYERS VIEW (For Clients or When Lawyer toggles it)     */}
      {/* ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="mt-8 animate-in fade-in duration-300">
          {/* Filters & Search */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a7907d]" size={19} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث باسم المحامي، التخصص، أو المنطقة...' : 'Search by name, specialty, location...'}
                className="h-13 w-full rounded-2xl border border-[#ddcdbb] bg-[#fffdf9] pr-12 pl-4 text-sm text-[#3b241a] shadow-sm transition placeholder:text-[#a7907d] focus:border-[#a36c42] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {specialties.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setSelectedSpecialty(item.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition ${
                    selectedSpecialty === item.id
                      ? 'bg-[#3b241a] text-[#fffdf9]'
                      : 'bg-[#ede3d5] text-[#6b4632] hover:bg-[#e2d3c0]'
                  }`}
                >
                  {lang === 'ar' ? item.label : item.en}
                </button>
              ))}
            </div>
          </div>

          {/* Lawyers Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="flex flex-col justify-between rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-sm transition-all hover:border-[#a36c42] hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid size-14 place-items-center rounded-2xl bg-[#ede3d5] text-xl font-bold text-[#3b241a]">
                        {lawyer.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#3b241a]">{lawyer.name}</h3>
                        <span className="inline-block rounded-full bg-[#faf6ef] px-2.5 py-0.5 text-[11px] font-bold text-[#8c694a]">
                          {lawyer.specialty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{lawyer.rating}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-[#796c63]">{lawyer.title}</p>

                  <div className="mt-5 space-y-2 rounded-2xl bg-[#faf6ef] p-3 text-xs text-[#5e5149]">
                    <div className="flex justify-between">
                      <span className="text-[#95877d]">{lang === 'ar' ? 'الخبرة المهنية:' : 'Experience:'}</span>
                      <strong className="text-[#3b241a]">{lawyer.experienceYears} سنة</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#95877d]">{lang === 'ar' ? 'الموقع:' : 'Location:'}</span>
                      <strong className="text-[#3b241a]">{lawyer.location}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#95877d]">{lang === 'ar' ? 'المواعيد المتاحة:' : 'Available:'}</span>
                      <strong className="text-[#3b241a]">{lawyer.availableDays}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[#f0e7db] pt-4">
                  <div>
                    <span className="block text-[10px] text-[#95877d]">{lang === 'ar' ? 'رسوم الاستشارة (30 دقيقة)' : 'Fee (30 min)'}</span>
                    <span className="text-base font-bold text-[#3b241a]">{lawyer.consultationFee} ج.م</span>
                  </div>
                  <Button onClick={() => handleStartBooking(lawyer)} className="rounded-xl px-5 text-xs">
                    {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
                    <ArrowLeft size={14} className="mr-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLIENT'S OWN BOOKINGS VIEW                                             */}
      {/* ========================================================================= */}
      {!isLawyer && activeTab === 'my-bookings' && (
        <div className="mt-8">
          {myBookings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ddcdbb] bg-[#fffdf9] p-12 text-center">
              <Calendar className="mx-auto size-12 text-[#bca797]" />
              <h3 className="mt-3 text-base font-bold text-[#3b241a]">
                {lang === 'ar' ? 'لا توجد لديك استشارات محجوزة حالياً' : 'No Bookings Found'}
              </h3>
              <p className="mt-1 text-xs text-[#796c63]">
                {lang === 'ar' ? 'يمكنك تصفح المحامين المعتمدين وحجز أول استشارة قانونية الآن.' : 'Browse certified lawyers and schedule your first session.'}
              </p>
              <Button onClick={() => setActiveTab('browse')} className="mt-5">
                {lang === 'ar' ? 'استعراض المحامين' : 'Browse Lawyers'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myBookings.map((booking) => (
                <div key={booking.id} className="rounded-3xl border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-[#ede3d5] px-2.5 py-0.5 text-[10px] font-bold text-[#8c694a]">
                        {booking.specialty}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-[#3b241a]">{booking.lawyerName}</h3>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={13} />
                      <span>{lang === 'ar' ? 'حجز مؤكد' : 'Confirmed'}</span>
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#faf6ef] p-3 text-xs">
                    <div>
                      <span className="block text-[#95877d]">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span>
                      <strong className="text-[#3b241a]">{booking.date}</strong>
                    </div>
                    <div>
                      <span className="block text-[#95877d]">{lang === 'ar' ? 'الموعد:' : 'Time Slot:'}</span>
                      <strong className="text-[#3b241a]">{booking.timeSlot}</strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#796c63]">
                    <span className="flex items-center gap-1.5">
                      {booking.type === 'video' ? <Video size={14} className="text-blue-600" /> : booking.type === 'phone' ? <Phone size={14} className="text-emerald-600" /> : <Building size={14} className="text-[#a36c42]" />}
                      <span>{booking.type === 'video' ? 'مكالمة فيديو عن بعد' : booking.type === 'phone' ? 'مكالمة هاتفية' : 'زيارة مكتبية'}</span>
                    </span>
                    <span className="text-[11px] text-[#95877d]">تم الحجز: {booking.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: LIVE SESSION / CALL FOR LAWYER                                  */}
      {/* ========================================================================= */}
      {isCallActive && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setIsCallActive(false)}
              className="absolute left-5 top-5 rounded-xl p-2 text-[#796c63] hover:bg-[#ede3d5] hover:text-[#3b241a]"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-blue-100 text-blue-700 shadow-sm animate-pulse">
                {activeSession.type === 'video' ? <Video size={30} /> : <PhoneCall size={30} />}
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-[#3b241a]">
                {lang === 'ar' ? 'جلسة الاستشارة القانونية المباشرة' : 'Live Consultation Session'}
              </h2>
              <p className="mt-1 text-xs text-[#8c694a] font-semibold">
                مع الموكل: {activeSession.clientName}
              </p>

              {/* Call Details Card */}
              <div className="mt-6 rounded-2xl bg-[#faf6ef] p-4 text-right text-xs leading-6 text-[#5b4a40] space-y-2">
                <div className="flex justify-between border-b border-[#ece2d4] pb-2">
                  <span className="text-[#8c694a] font-bold">موضوع الاستشارة:</span>
                  <span className="font-bold text-[#3b241a]">{activeSession.specialty}</span>
                </div>
                <p className="text-[11px] text-[#6b584d] pt-1">{activeSession.details}</p>
                <div className="flex justify-between text-[11px] text-[#95877d] pt-1">
                  <span>الموعد المحدد: {activeSession.timeSlot}</span>
                  <span>الأتعاب: {activeSession.fee || 350} ج.م</span>
                </div>
              </div>

              {/* Live Room Mock / Join */}
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center">
                <span className="inline-block size-3 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                <span className="text-xs font-bold text-emerald-800">الغرفة الافتراضية المشفرة جاهزة للانعقاد</span>
                <p className="text-[11px] text-emerald-700 mt-1">يمكنك فتح نافذة الفيديو أو الاتصال بالموكل مباشرة.</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => {
                    handleUpdateStatus(activeSession.id, 'completed');
                    setIsCallActive(false);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <CheckCircle size={15} className="ml-1.5" />
                  <span>{lang === 'ar' ? 'إنهاء الاستشارة وتوثيقها' : 'Complete & Document'}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsCallActive(false)}
                >
                  <span>{lang === 'ar' ? 'إغلاق النافذة' : 'Close'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: ADD MANUAL CONSULTATION FOR LAWYER                              */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute left-4 top-4 rounded-xl p-2 text-[#796c63] hover:bg-[#ede3d5] hover:text-[#3b241a]"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl font-bold text-[#3b241a]">
              {lang === 'ar' ? 'إضافة استشارة محجوزة يدوياً' : 'Add Client Consultation'}
            </h2>
            <p className="mt-1 text-xs text-[#796c63]">
              {lang === 'ar' ? 'سجّل موعد استشارة وارد من عميل خارجي أو مكتبك.' : 'Record a direct appointment for a client.'}
            </p>

            <form onSubmit={handleAddManualConsultation} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3b241a] mb-1">اسم العميل / الموكل:</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="مثال: أحمد عبد الله"
                  className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3b241a] mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="010..."
                    className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3b241a] mb-1">الأتعاب المقررة (ج.م):</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b241a] mb-1">موضوع الاستشارة وملخص القضية:</label>
                <textarea
                  required
                  rows={3}
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="اكتب ملخص المشكلة أو القضية أو العقد..."
                  className="w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] p-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3b241a] mb-1">تاريخ الجلسة:</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3b241a] mb-1">الوقت:</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#ddcdbb] bg-[#faf6ef] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                  >
                    <option value="11:00 ص - 11:30 ص">11:00 ص - 11:30 ص</option>
                    <option value="12:00 م - 12:30 م">12:00 م - 12:30 م</option>
                    <option value="02:00 م - 02:30 م">02:00 م - 02:30 م</option>
                    <option value="05:00 م - 05:30 م">05:00 م - 05:30 م</option>
                    <option value="07:00 م - 07:30 م">07:00 م - 07:30 م</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3b241a] mb-1">نوع الجلسة:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'video' as const, label: 'فيديو' },
                    { id: 'phone' as const, label: 'هاتف' },
                    { id: 'office' as const, label: 'بالمكتب' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setNewType(t.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        newType === t.id
                          ? 'bg-[#3b241a] text-white border-[#3b241a]'
                          : 'bg-[#faf6ef] text-[#6b4632] border-[#ddcdbb]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-[#3b241a] text-white">
                  حفظ الاستشارة
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: CLIENT BOOKING MODAL                                            */}
      {/* ========================================================================= */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#ddcdbb] bg-[#fffdf9] p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLawyer(null)}
              className="absolute left-4 top-4 rounded-xl p-2 text-[#796c63] hover:bg-[#ede3d5] hover:text-[#3b241a]"
            >
              <X size={20} />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#dce9db] text-[#447052] shadow-sm">
                  <CheckCircle2 size={32} />
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-[#3b241a]">
                  {lang === 'ar' ? 'تم تأكيد حجز الاستشارة بنجاح!' : 'Consultation Confirmed!'}
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#796c63]">
                  {lang === 'ar'
                    ? `تم تأكيد موعدك مع ${selectedLawyer.name} بتاريخ ${bookingDate} في الموعد (${bookingTime}). سيصلك إشعار ورابط المكالمة.`
                    : `Your consultation with ${selectedLawyer.name} has been scheduled.`}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setSelectedLawyer(null);
                      setActiveTab('my-bookings');
                    }}
                  >
                    {lang === 'ar' ? 'عرض استشاراتي' : 'View My Bookings'}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 border-b border-[#f0e7db] pb-4">
                  <div className="grid size-12 place-items-center rounded-2xl bg-[#ede3d5] text-lg font-bold text-[#3b241a]">
                    {selectedLawyer.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#3b241a]">{selectedLawyer.name}</h3>
                    <p className="text-xs text-[#8c694a]">{selectedLawyer.specialty} · {selectedLawyer.consultationFee} ج.م</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmBooking} className="mt-5 space-y-4">
                  {/* Select Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#3b241a] mb-1">
                      {lang === 'ar' ? 'اختر التاريخ:' : 'Select Date:'}
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    />
                  </div>

                  {/* Select Time Slot */}
                  <div>
                    <label className="block text-xs font-bold text-[#3b241a] mb-1">
                      {lang === 'ar' ? 'الموعد المناسب:' : 'Time Slot:'}
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] px-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none"
                    >
                      <option value="10:00 ص - 10:30 ص">10:00 ص - 10:30 ص (صباحاً)</option>
                      <option value="11:00 ص - 11:30 ص">11:00 ص - 11:30 ص (صباحاً)</option>
                      <option value="01:00 م - 01:30 م">01:00 م - 01:30 م (ظهراً)</option>
                      <option value="06:00 م - 06:30 م">06:00 م - 06:30 م (مساءً)</option>
                      <option value="08:00 م - 08:30 م">08:00 م - 08:30 م (مساءً)</option>
                    </select>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#3b241a] mb-1.5">
                      {lang === 'ar' ? 'طريقة الاستشارة:' : 'Consultation Mode:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'video' as const, label: 'فيديو أونلاين', icon: Video },
                        { id: 'phone' as const, label: 'مكالمة هاتفية', icon: Phone },
                        { id: 'office' as const, label: 'بمقر المكتب', icon: Building },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = bookingType === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setBookingType(item.id)}
                            className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                              isSelected
                                ? 'border-[#3b241a] bg-[#3b241a] text-[#fffdf9]'
                                : 'border-[#ddcdbb] bg-[#fffdf9] text-[#6b4632] hover:bg-[#faf6ef]'
                            }`}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Case Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#3b241a] mb-1">
                      {lang === 'ar' ? 'ملخص الاستشارة أو القضية:' : 'Brief description:'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={caseDescription}
                      onChange={(e) => setCaseDescription(e.target.value)}
                      placeholder={lang === 'ar' ? 'صف بإيجاز المشكلة القانونية أو الاستفسار المطلوب...' : 'Describe your legal inquiry...'}
                      className="w-full rounded-xl border border-[#ddcdbb] bg-[#fffdf9] p-3 text-xs text-[#3b241a] focus:border-[#a36c42] focus:outline-none placeholder:text-[#a7907d]"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full justify-center text-xs font-bold py-3"
                    >
                      {isSubmitting
                        ? (lang === 'ar' ? 'جاري التأكيد...' : 'Confirming...')
                        : (lang === 'ar' ? `تأكيد الحجز (${selectedLawyer.consultationFee} ج.م)` : 'Confirm Booking')}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal for guests */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
