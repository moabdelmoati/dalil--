import type { AnalysisResult, ClauseTone } from '../types.ts';

export const SYSTEM_VOICE_RULES = [
  'لا تصرّح أبدًا أن أي بند غير قانوني أو باطل بشكل قاطع.',
  'استخدم صياغة حذرة: "يستحق المراجعة" أو "قد يحتاج إلى توضيح" أو "راجع هذا البند قبل التوقيع".',
  'لا تخترع مصادر أو أرقام مواد قانونية أبدًا.',
];

export const ANALYZE_SYSTEM_INSTRUCTION = `أنت "دليل" — مساعد مصري متخصص في شرح العقود والوثائق القانونية بلغة بسيطة ومباشرة، موجه للمواطن العادي.

قواعد أساسية يجب الالتزام بها بدقة:
1. ${SYSTEM_VOICE_RULES[0]}
2. ${SYSTEM_VOICE_RULES[1]}
3. ${SYSTEM_VOICE_RULES[2]}
4. عمود "original" لكل بند يجب أن يكون اقتباسًا حرفيًا من نص المستند نفسه، وليس إعادة صياغة.
5. أدرج فقط البنود التي تستحق المراجعة أو الانتباه في مصفوفة clauses، وسجّل عدد البنود العادية في counts.normal فقط دون إدراجها.
6. كل بند يحتاج مصدرًا: إذا طبقت مادة حقيقية من قاعدة المعرفة المرفقة، اذكرها باسمها ورقمها (مثل "المادة 224 من القانون المدني المصري"). وإذا لم ينطبق أي نص من قاعدة المعرفة على البند تحديدًا، اكتب "مبدأ تعاقدي عام — يُنصح بالمراجعة".
7. اقرأ المستند المرفق كاملًا قبل الكتابة، وانسخ نصه الكامل الحرفي في حقل documentText.
8. التزم بالـ JSON schema المطلوب تمامًا، وأخرج JSON صالحًا فقط دون أي نص خارجي.`;

export const ASK_SYSTEM_INSTRUCTION = `أنت "دليل" — مساعد يشرح مستندًا قانونيًا محددًا للمواطن العادي بلغة مصرية مبسطة.

قواعد أساسية يجب الالتزام بها بدقة:
1. أجب فقط بالاعتماد على نص المستند المقدَّم في الرسالة وقاعدة المعرفة القانونية المرفقة.
2. لا تخترع معلومات ليست في المستند. إذا لم تجد الإجابة في المستند، قل ذلك بوضوح.
3. أشر إلى الجزء من المستند الذي أتت منه الإجابة (اقتبس منه).
4. ${SYSTEM_VOICE_RULES[0]}
5. ${SYSTEM_VOICE_RULES[1]}
6. ${SYSTEM_VOICE_RULES[2]}
7. انصح بمراجعة متخصص (محامٍ أو الجهة المختصة) لأي أمر عالي الأهمية.
8. أخرج نص الإجابة فقط دون أي تنسيق أو عناوين خارجية.`;

export interface AnalyzePromptParams {
  fileName: string;
  groundContext: string;
  pageCount: number;
  contentText?: string;
}

export function buildAnalyzeUserPrompt(params: AnalyzePromptParams): string {
  const documentPart = params.contentText
    ? `المستند (نص مستخرج من ملف ${params.fileName}):\n${params.contentText}`
    : `المستند المرفق في هذه الرسالة هو: ${params.fileName}`;

  return `${documentPart}

قاعدة المعرفة القانونية المرجعية — استخدمها لإسناد المصادر فقط، ولا تخترع مواد:
--- بداية قاعدة المعرفة ---
${params.groundContext}
--- نهاية قاعدة المعرفة ---

المطلوب: حلّل المستند بالكامل، ثم أخرج JSON مطابقًا للـ schema المطلوب.

التعليمات:
- title: عنوان المستند المستنتج بالعربية.
- documentType: إحدى الفئات التالية فقط: rental_apartments أو car_contracts أو employment_contracts أو installment_and_appliance_contracts أو telecom_and_subscription_contracts أو general_contract_principles.
- summary.monthlyValue: القيمة الشهرية إن وُجدت (مثل "١٢,٥٠٠ جنيه / شهر") وإلا null.
- summary.duration: مدة العقد إن وُجدت (مثل "سنة واحدة") وإلا null.
- summary.parties: أطراف العقد (مثل "مؤجر ومستأجر").
- counts: عدد البنود في المستند كاملًا مقسمة إلى normal (عادية) و review (تستحق مراجعة) و attention (تستحق انتباه).
- clauses: فقط البنود التي تستحق المراجعة أو الانتباه. لكل بند:
  - original: اقتباس حرفي من المستند.
  - tag: واحد من القيم التالية فقط: "تستحق الانتباه" أو "راجع التفاصيل" أو "سؤال مهم"، ويجب أن يطابق tone: amber ← "تستحق الانتباه"، blue ← "راجع التفاصيل"، olive ← "سؤال مهم".
  - tone: واحد من amber أو blue أو olive.
  - explanation: شرح مبسط للبند.
  - why: لماذا يهم المستخدم.
  - source: مادة حقيقية من قاعدة المعرفة إن طبقت (باسمها ورقمها)، وإلا "مبدأ تعاقدي عام — يُنصح بالمراجعة". لا تخترع أرقام مواد.
- documentText: النص الكامل الحرفي للمستند.

عدد صفحات المستند المحسوب مسبقًا: ${params.pageCount} — أعد كتابته في حقل pageCount دون تغيير.`;
}

export interface AskPromptParams {
  documentText: string;
  documentType: string;
  groundContext: string;
  question: string;
}

export function buildAskUserPrompt(params: AskPromptParams): string {
  return `المستند:
---
${params.documentText}
---

نوع المستند: ${params.documentType}

قاعدة المعرفة القانونية المرجعية:
--- بداية قاعدة المعرفة ---
${params.groundContext}
--- نهاية قاعدة المعرفة ---

سؤال المستخدم: ${params.question}

أجب وفق التعليمات النظامية. أخرج نص الإجابة فقط.`;
}

export const ANALYZE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    documentType: { type: 'STRING' },
    pageCount: { type: 'INTEGER' },
    summary: {
      type: 'OBJECT',
      properties: {
        monthlyValue: { type: 'STRING' },
        duration: { type: 'STRING' },
        parties: { type: 'STRING' },
      },
      required: ['monthlyValue', 'duration', 'parties'],
    },
    counts: {
      type: 'OBJECT',
      properties: {
        normal: { type: 'INTEGER' },
        review: { type: 'INTEGER' },
        attention: { type: 'INTEGER' },
      },
      required: ['normal', 'review', 'attention'],
    },
    clauses: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          tag: { type: 'STRING', enum: ['تستحق الانتباه', 'راجع التفاصيل', 'سؤال مهم'] },
          tone: { type: 'STRING', enum: ['amber', 'blue', 'olive'] },
          original: { type: 'STRING' },
          explanation: { type: 'STRING' },
          why: { type: 'STRING' },
          source: { type: 'STRING' },
        },
        required: ['title', 'tag', 'tone', 'original', 'explanation', 'why', 'source'],
      },
    },
    documentText: { type: 'STRING' },
  },
  required: ['title', 'documentType', 'summary', 'counts', 'clauses', 'documentText'],
};

const VALID_TONES: ClauseTone[] = ['amber', 'blue', 'olive'];
const VALID_TAGS = ['تستحق الانتباه', 'راجع التفاصيل', 'سؤال مهم'];
const TAG_BY_TONE: Record<ClauseTone, string> = {
  amber: 'تستحق الانتباه',
  blue: 'راجع التفاصيل',
  olive: 'سؤال مهم',
};
const VALID_DOCUMENT_TYPES = [
  'rental_apartments',
  'car_contracts',
  'employment_contracts',
  'installment_and_appliance_contracts',
  'telecom_and_subscription_contracts',
  'general_contract_principles',
];

export function sanitizeAnalysisResult(raw: Partial<AnalysisResult>): AnalysisResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const clauses = Array.isArray(raw.clauses) ? raw.clauses : [];
  const cleanClauses = clauses
    .map((clause) => {
      const tone = VALID_TONES.includes(clause.tone as ClauseTone) ? (clause.tone as ClauseTone) : 'amber';
      const tag = VALID_TAGS.includes(clause.tag) ? clause.tag : TAG_BY_TONE[tone];
      return {
        title: String(clause.title ?? ''),
        tag,
        tone,
        original: String(clause.original ?? ''),
        explanation: String(clause.explanation ?? ''),
        why: String(clause.why ?? ''),
        source: String(clause.source ?? 'مبدأ تعاقدي عام — يُنصح بالمراجعة'),
      };
    })
    .filter((clause) => clause.title || clause.original);

  const documentType = VALID_DOCUMENT_TYPES.includes(String(raw.documentType)) ? String(raw.documentType) : 'general_contract_principles';

  return {
    title: String(raw.title ?? 'مستند بدون عنوان'),
    documentType,
    pageCount: 0,
    summary: {
      monthlyValue: raw.summary && typeof raw.summary.monthlyValue === 'string' ? raw.summary.monthlyValue : null,
      duration: raw.summary && typeof raw.summary.duration === 'string' ? raw.summary.duration : null,
      parties: raw.summary && typeof raw.summary.parties === 'string' ? raw.summary.parties : 'غير محدد',
    },
    counts: {
      normal: Math.max(0, Number(raw.counts?.normal) || 0),
      review: Math.max(0, Number(raw.counts?.review) || 0),
      attention: Math.max(0, Number(raw.counts?.attention) || 0),
    },
    clauses: cleanClauses,
    documentText: String(raw.documentText ?? ''),
  };
}
