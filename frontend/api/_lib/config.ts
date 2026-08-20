/**
 * إعدادات الخادم ومفتاح الذكاء الاصطناعي (Gemini API)
 * ضع مفتاحك هنا أو عبر Environment Variables (GEMINI_API_KEY)
 */
export const GEMINI_API_KEY: string =
  process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

export const GEMINI_MODEL: string = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
