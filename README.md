# دليل (Dalil)

مشروع دليل — مساعد مصري لفهم المستندات والعقود: يحلّل عقدك بـ Gemini ويعرض أهم البنود بلغة بسيطة، ويجيب عن أسئلتك من داخل مستندك.

- **النسخة المنشورة**: https://dalil-lemon.vercel.app/

- **Frontend**: Vite + React + TypeScript (RTL / Arabic), في مجلد `frontend/`
- **Backend**: Node.js + Express + TypeScript + Gemini API, في مجلد `backend/`

## التشغيل محلياً (طرفيتان)

افتح طرفيتين من جذر المشروع:

```bash
# terminal 1 — الخادم الخلفي
cd backend
npm install
npm run dev
```

```bash
# terminal 2 — الواجهة
cd frontend
npm install
npm run dev
```

ثم افتح المتصفح على: `http://localhost:5173`

> **مهم**: قبل تشغيل الـ backend، انسخ `backend/.env.example` إلى `backend/.env` وضع مفتاح Gemini الخاص بك في `GEMINI_API_KEY` (مفتاح مجاني من Google AI Studio: https://aistudio.google.com/apikey).
>
> **الكوتة المجانية**: كل موديل عنده حد يومي مستقل (20 طلب/يوم على الحساب المجاني). لو ظهرت رسالة "وصلت للحد الأقصى للاستخدام المجاني لليوم"، غيّر `GEMINI_MODEL` في `backend/.env` لموديل آخر متاح لمفتاحك (مثل `gemini-3.5-flash`)، أو انتظر إعادة تعيين الكوتة في اليوم التالي. الافتراضي في `.env.example` هو `gemini-3.5-flash`.

## النشر على Vercel

الموقع منشور على **https://dalil-lemon.vercel.app/** — ومجهز للنشر كالتالي (مشروع واحد من جذر المستودع):

1. اربط المستودع بـ Vercel (أو استخدم `vercel` CLI من جذر المشروع).
2. في إعدادات المشروع على Vercel أضف المتغيرات البيئية:
   - `GEMINI_API_KEY` — مفتاح Gemini الخاص بك.
   - `GEMINI_MODEL` — اختياري (الافتراضي `gemini-3.5-flash`).
3. `vercel.json` في الجذر يضبط:
   - أمر البناء `npm run build` (يبني الـ backend لـ `backend/dist` ثم الـ frontend لـ `public/`).
   - `api/index.ts` يعرّف تطبيق Express نفسه كـ serverless function يخدم `/api/*`.
   - إعادة توجيه `/api/*` للفنكشن، وأي مسار تاني لصفحة الـ SPA.

ملاحظة: حد حجم الـ request على Vercel ~4.5MB، فالمستندات الكبيرة (أكثر من ~3MB) هتفشل على النسخة المنشورة بينما تشتغل محلياً. النشر من الـ Git: أي push لـ `main` يعمل redeploy تلقائي.

## كيف يعمل

- `POST /api/analyze` — يستقبل ملف (PDF / JPG / PNG / DOCX، أقصى ١٠ ميجابايت)، يستخرج النص (mammoth للـ DOCX)، يضيف سياقاً من قاعدة المعرفة القانونية، ويطلب من Gemini تحليلاً منظمًا (JSON) بأهم البنود وملخص المستند.
- `POST /api/ask` — إجابة أسئلة من داخل نص المستند مع الحفاظ على سياق المحادثة.
- `GET /api/health` — فحص أن الخادم يعمل.

قاعدة المعرفة القانونية موجودة في `backend/data/legal-knowledge-base.json` (مواد حقيقية: القانون المدني، قانون العمل، قانون حماية المستهلك، الدستور...). الخادم بلا حالة (stateless) — لا قاعدة بيانات، لا مصادقة، لا تخزين للملفات.

## التحقق السريع

```bash
curl http://localhost:3001/api/health
```

## ملاحظات

- صفحات الخدمات (`/services` و `/services/:id`) ما زالت تعرض بيانات تجريبية (mock) — التركيز الفعلي للمنتج على `/analyze` و `/contract` و `/ask`.
- دليل أداة للتوضيح، وليس بديلاً عن الاستشارة القانونية.