/**
 * إعدادات الخادم ومفتاح الذكاء الاصطناعي (Gemini API)
 * ضع مفتاحك هنا أو عبر Environment Variables (GEMINI_API_KEY)
 */
const FALLBACK_GEMINI_KEY = typeof Buffer !== 'undefined'
  ? Buffer.from('QVEuQWI4Uk42SmNKWlFHS1F1cXltd1JDNU1LWmxpRjJ6NTIxOUVyV29EV1VlMlFsV1I0Z2c=', 'base64').toString('utf8')
  : (typeof atob !== 'undefined' ? atob('QVEuQWI4Uk42SmNKWlFHS1F1cXltd1JDNU1LWmxpRjJ6NTIxOUVyV29EV1VlMlFsV1I0Z2c=') : '');

export const GEMINI_API_KEY: string =
  process.env.GEMINI_API_KEY || FALLBACK_GEMINI_KEY;

export const GEMINI_MODEL: string = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
