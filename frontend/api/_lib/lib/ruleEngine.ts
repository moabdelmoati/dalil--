import { getKnowledgeBase, detectDocumentType } from './knowledgeBase';
import type { AnalysisClause, AnalysisResult, ClauseTone } from '../types';

interface KBClause {
  id?: string;
  category?: string;
  clause_pattern?: string;
  risk_level?: string;
  risk_color?: string;
  explanation?: string;
  why_flagged?: string | null;
  legal_reference?: string;
  source?: string;
}

interface KBCategory {
  description?: string;
  clauses?: KBClause[];
}

export function extractContractSummary(text: string): {
  monthlyValue: string | null;
  duration: string | null;
  parties: string;
} {
  const norm = text || '';

  // 1. Monthly Value Regex
  let monthlyValue: string | null = null;
  const moneyMatch = norm.match(
    /(?:قيمة|أجرة|مبلغ|أجر|راتب|إيجار|قسط|دفعة|بواقع)\s*(?:شهري|شهرية|قدره|مقداره)?\s*:?\s*([\d,٠-٩]+(?:\.\d+)?)\s*(جنيه|ج\.م|EGP|ريال|دولار)?/i
  ) || norm.match(/([\d,٠-٩]+)\s*(?:جنيه|ج\.م)\s*(?:شهرياً|شهريا|كل شهر)/i);

  if (moneyMatch) {
    const val = moneyMatch[1];
    const curr = moneyMatch[2] || 'جنيه';
    monthlyValue = `${val} ${curr} / شهر`;
  }

  // 2. Duration Regex
  let duration: string | null = null;
  const durationMatch = norm.match(
    /(?:مدة\s*(?:العقد|الإيجار|الاتفاق|العمل)?|لمدة)\s*:?\s*(\d+|سنة|سنتين|عام|عامين|ثلاث|أربع|خمس|ست|سبع|ثمان|تسع|عشر)\s*(سنوات|أعوام|أشهر|شهور|شهر|يوم|أيام|سنة|عام)?/i
  ) || norm.match(/(سنة واحدة|سنتان|سنتين|ثلاث سنوات|خمس سنوات|مدة غير محددة|عقد محدد المدة)/i);

  if (durationMatch) {
    duration = durationMatch[0].trim();
  }

  // 3. Parties Detection
  let parties = 'الطرف الأول والطرف الثاني';
  if (norm.includes('مؤجر') && norm.includes('مستأجر')) {
    parties = 'مؤجر ومستأجر';
  } else if (norm.includes('بائع') && norm.includes('مشتري')) {
    parties = 'بائع ومشتري';
  } else if (norm.includes('صاحب العمل') || norm.includes('العامل') || norm.includes('الموظف')) {
    parties = 'صاحب العمل والموظف';
  } else if (norm.includes('الممول') || norm.includes('العميل')) {
    parties = 'جهة التمويل والعميل';
  } else if (norm.includes('الشركة') && norm.includes('المشترك')) {
    parties = 'شركة الاتصالات والمشترك';
  }

  return { monthlyValue, duration, parties };
}

export function analyzeDocumentLocal(input: {
  text: string;
  fileName: string;
  pageCount: number;
}): AnalysisResult {
  const text = input.text || '';
  const docType = detectDocumentType(`${input.fileName} ${text}`);
  const kb = getKnowledgeBase();

  const summary = extractContractSummary(text);

  const matchedClauses: AnalysisClause[] = [];
  let normalCount = 0;
  let reviewCount = 0;
  let attentionCount = 0;

  // Split text into clauses/sentences
  const segments = text
    .split(/(?:\r?\n)+|(?<=[.؛!\?])\s+|(?=البند\s+\w+)|(?=المادة\s+\w+)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const categoriesToCheck = [
    docType,
    'general_contract_principles',
    'adhesion_contracts_principle',
    'constitution_articles',
  ];

  const kbClausesList: KBClause[] = [];
  for (const cat of categoriesToCheck) {
    const catData = kb[cat] as KBCategory | undefined;
    if (catData && Array.isArray(catData.clauses)) {
      kbClausesList.push(...catData.clauses);
    }
  }

  const seenPatterns = new Set<string>();

  for (const kbClause of kbClausesList) {
    const pattern = kbClause.clause_pattern || '';
    if (!pattern || seenPatterns.has(pattern)) continue;

    // Extract keywords from the pattern
    const keywords = pattern
      .split(/\s+/)
      .map((w) => w.replace(/[^\u0621-\u064A]/g, ''))
      .filter((w) => w.length > 3);

    if (keywords.length === 0) continue;

    // Find best matching segment in the document text
    let matchedSegment: string | null = null;
    let maxMatch = 0;

    for (const segment of segments) {
      const matchCount = keywords.filter((kw) => segment.includes(kw)).length;
      if (matchCount > maxMatch && matchCount >= Math.min(2, keywords.length)) {
        maxMatch = matchCount;
        matchedSegment = segment;
      }
    }

    if (matchedSegment) {
      seenPatterns.add(pattern);

      const risk = (kbClause.risk_level || 'review').toLowerCase();
      let tone: ClauseTone = 'blue';
      let tag = 'راجع التفاصيل';

      if (risk === 'attention' || risk === 'red' || risk === 'high') {
        tone = 'amber';
        tag = 'تستحق الانتباه';
        attentionCount++;
      } else if (risk === 'normal' || risk === 'green' || risk === 'low') {
        normalCount++;
        // Don't add normal clauses to the flagged clauses array per Dalil spec
        continue;
      } else {
        tone = 'blue';
        tag = 'راجع التفاصيل';
        reviewCount++;
      }

      matchedClauses.push({
        title: kbClause.category || 'بند يستحق المراجعة',
        tag,
        tone,
        original: matchedSegment.length > 300 ? `${matchedSegment.slice(0, 300)}...` : matchedSegment,
        explanation: kbClause.explanation || 'يُنصح بقراءة هذا البند بعناية قبل التوقيع.',
        why: kbClause.why_flagged || 'يتضمن هذا البند شروطاً قد تؤثر على حقوقك والتزاماتك التعاقدية.',
        source: kbClause.legal_reference || kbClause.source || 'مبدأ تعاقدي عام — يُنصح بالمراجعة',
      });
    }
  }

  // Fallback: If no clauses matched from pattern check, inspect segments for standard critical keywords
  if (matchedClauses.length === 0 && segments.length > 0) {
    for (const seg of segments.slice(0, 6)) {
      if (seg.includes('غرامة') || seg.includes('تعويض') || seg.includes('فسخ') || seg.includes('إنهاء')) {
        attentionCount++;
        matchedClauses.push({
          title: 'شروط الإنهاء والجزاءات',
          tag: 'تستحق الانتباه',
          tone: 'amber',
          original: seg.slice(0, 250),
          explanation: 'يتضمن هذا النص شروطاً تتعلق بالإنهاء أو الجزاءات المالية.',
          why: 'يجب التأكد من وضوح شروط الفسخ والالتزامات المترتبة عليها.',
          source: 'المادة 147 من القانون المدني المصري (العقد شريعة المتعاقدين)',
        });
      } else if (seg.includes('التزام') || seg.includes('تجديد') || seg.includes('مدة')) {
        reviewCount++;
        matchedClauses.push({
          title: 'الالتزامات والمدة',
          tag: 'راجع التفاصيل',
          tone: 'blue',
          original: seg.slice(0, 250),
          explanation: 'يحدد هذا البند المدة أو الالتزامات المفروضة على الأطراف.',
          why: 'تأكد من مطابقة المدة والشروط لما تم الاتفاق عليه شفهياً.',
          source: 'المادة 148 من القانون المدني المصري (تنفيذ العقد بحسن نية)',
        });
      } else {
        normalCount++;
      }
    }
  }

  const documentTypeTitles: Record<string, string> = {
    rental_apartments: 'عقد إيجار وحدة سكنية',
    car_contracts: 'عقد بيع / شراء سيارة',
    employment_contracts: 'عقد عمل وتوظيف',
    installment_and_appliance_contracts: 'عقد تمويل وتقسيط',
    telecom_and_subscription_contracts: 'عقد اشتراك وخدمات اتصالات',
    general_contract_principles: 'عقد اتفاق وتعهد',
  };

  const title = documentTypeTitles[docType] || 'مستند قانوني';

  return {
    title,
    documentType: docType,
    pageCount: input.pageCount || 1,
    summary,
    counts: {
      normal: Math.max(normalCount, 1),
      review: reviewCount,
      attention: attentionCount,
    },
    clauses: matchedClauses,
    documentText: text,
  };
}

export function askDocumentLocal(input: {
  documentText: string;
  documentType: string;
  question: string;
}): string {
  const q = (input.question || '').trim().toLowerCase();
  const text = input.documentText || '';
  const kb = getKnowledgeBase();

  const qKeywords = q
    .split(/\s+/)
    .map((w) => w.replace(/[^\u0621-\u064A]/g, ''))
    .filter((w) => w.length > 2);

  // Search in document text
  const sentences = text.split(/(?:\r?\n)+|(?<=[.؛!\?])\s+/).filter((s) => s.trim().length > 10);
  let bestSentence = '';
  let maxScore = 0;

  for (const sentence of sentences) {
    const score = qKeywords.reduce((acc, kw) => (sentence.includes(kw) ? acc + 1 : acc), 0);
    if (score > maxScore) {
      maxScore = score;
      bestSentence = sentence.trim();
    }
  }

  // Search in knowledge base
  const catData = kb[input.documentType] as KBCategory | undefined;
  let relevantLegalRef = '';
  let relevantExplanation = '';

  if (catData && Array.isArray(catData.clauses)) {
    for (const cl of catData.clauses) {
      const p = `${cl.category || ''} ${cl.clause_pattern || ''} ${cl.explanation || ''}`;
      const match = qKeywords.filter((kw) => p.includes(kw)).length;
      if (match >= 1) {
        relevantLegalRef = cl.legal_reference || cl.source || '';
        relevantExplanation = cl.explanation || '';
        break;
      }
    }
  }

  if (bestSentence) {
    let ans = `بناءً على نص المستند المرفق:\n"${bestSentence}"\n\n`;
    if (relevantExplanation) {
      ans += `الشرح والتوضيح: ${relevantExplanation}\n\n`;
    }
    if (relevantLegalRef) {
      ans += `السند القانوني المرجعي: ${relevantLegalRef}\n\n`;
    }
    ans += 'نصيحة دليل: يُنصح دائمًا بمراجعة محامٍ مختص في حال وجود أي نزاع أو بند غير واضح.';
    return ans;
  }

  if (relevantExplanation && relevantLegalRef) {
    return `بشأن استفسارك، توضح القواعد القانونية المنطبقة التالي:\n${relevantExplanation}\n\nالمادة القانونية: ${relevantLegalRef}\n\nنصيحة دليل: تأكد من مراجعة البند المقابل في نسختك من العقد قبل التوقيع.`;
  }

  return `بناءً على قراءة المستند، لم يتم العثور على نص صريح ومباشر يجيب عن "${input.question}". يُنصح بالتواصل مع الطرف الآخر لتوضيح هذه النقطة كتابة في العقد أو استشارة محامٍ مختص.`;
}
