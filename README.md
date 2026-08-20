# دليل (Dalil)

مشروع دليل — مساعد مصري لفهم المستندات والعقود: يحلّل عقدك بـ Gemini ويعرض أهم البنود بلغة بسيطة، ويجيب عن أسئلتك من داخل مستندك.

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
> ملاحظة: نموذج `gemini-2.5-flash` لم يعد متاحاً للمفاتيح الجديدة — الافتراضي في `.env.example` هو `gemini-3.6-flash`، ويمكن تغييره من متغير `GEMINI_MODEL` في `backend/.env`.

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