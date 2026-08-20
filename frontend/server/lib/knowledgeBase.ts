type KnowledgeBase = Record<string, unknown>;

import kbData from '../data/legal-knowledge-base.json' with { type: 'json' };

const kb: KnowledgeBase = kbData as unknown as KnowledgeBase;

export function getKnowledgeBase(): KnowledgeBase {
  return kb;
}

const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  {
    category: 'rental_apartments',
    keywords: ['إيجار', 'مستأجر', 'مؤجر', 'إيجارية', 'شقة', 'وحدة سكنية', 'أجرة', 'عقد إيجار'],
  },
  {
    category: 'installment_and_appliance_contracts',
    keywords: ['تقسيط', 'قسط', 'أقساط', 'تمويل', 'دفعة', 'التمويل الاستهلاكي', 'بضاعة'],
  },
  {
    category: 'car_contracts',
    keywords: ['سيارة', 'مركبة', 'نقل ملكية', 'رخصة السيارة', 'المرور', 'تأمين السيارة', 'بيع سيارة'],
  },
  {
    category: 'employment_contracts',
    keywords: ['عمل', 'موظف', 'صاحب العمل', 'أجور', 'راتب', 'إجازة', 'فصل تعسفي', 'مدة تجربة'],
  },
  {
    category: 'telecom_and_subscription_contracts',
    keywords: ['اشتراك', 'خط محمول', 'إنترنت', 'اتصالات', 'باقة', 'شريحة', 'تجديد الاشتراك'],
  },
];

const ALWAYS_INCLUDE = ['general_contract_principles', 'constitution_articles'];

export function detectDocumentType(text: string): string {
  const normalized = text || '';
  let best: string | null = null;
  let bestScore = 0;
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    const score = keywords.reduce((acc, kw) => (normalized.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best ?? 'general_contract_principles';
}

export function buildGroundingContext(documentType: string): string {
  const data = getKnowledgeBase();
  const sections: unknown[] = [];

  const pushSection = (key: string): void => {
    const value = data[key];
    if (value) {
      sections.push(JSON.parse(JSON.stringify(value)));
    }
  };

  const knownCategories = new Set(CATEGORY_KEYWORDS.map((item) => item.category));
  if (knownCategories.has(documentType)) {
    pushSection(documentType);
  }

  for (const key of ALWAYS_INCLUDE) {
    if (key !== documentType) {
      pushSection(key);
    }
  }

  if (documentType === 'installment_and_appliance_contracts' || documentType === 'telecom_and_subscription_contracts') {
    pushSection('adhesion_contracts_principle');
  }

  if (data.risk_level_definitions) {
    sections.push(data.risk_level_definitions);
  }

  return JSON.stringify(sections, null, 2);
}
