import { GoogleGenAI } from '@google/genai';

const SERVICES_API_KEY = process.env.SERVICES_API_KEY || process.env.GEMINI_API_KEY || '';

export interface ServicesAskInput {
  serviceId?: string;
  message: string;
  history: { role: 'user' | 'model'; text: string }[];
  context?: string;
}

const SERVICES_SYSTEM_INSTRUCTION = `أنت مساعد ذكي لمنصة "دليل" المتخصصة في الخدمات الحكومية والقانونية في مصر.
مهمتك هي الإجابة على أسئلة المستخدمين بخصوص الخدمات الحكومية (مثل استخراج الرقم القومي، شهادات الميلاد، الشهر العقاري، الجوازات، المرور وغيرها).
قدم إجابات واضحة، دقيقة، ومباشرة. إذا لم تكن متأكداً من معلومة، وجه المستخدم للجهات الرسمية أو اطلب منه التحقق من الموقع الرسمي (مثل بوابة مصر الرقمية).
تحدث بلهجة مصرية مهنية ومبسطة، وكن متعاوناً.`;

export async function askServicesChat(input: ServicesAskInput): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: SERVICES_API_KEY });

  const contents: any[] = input.history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  // Add the current message
  let promptText = input.message;
  if (input.serviceId) {
    promptText = `[الخدمة المستفسر عنها: \${input.serviceId}]\nسؤال المستخدم: \${input.message}`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: promptText }],
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    contents,
    config: {
      systemInstruction: SERVICES_SYSTEM_INSTRUCTION,
      maxOutputTokens: 2048,
    },
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty answer.');
  }
  return response.text.trim();
}
