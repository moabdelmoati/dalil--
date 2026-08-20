export type ClauseTone = 'amber' | 'blue' | 'olive';

export interface AnalysisClause {
  title: string;
  tag: string;
  tone: ClauseTone;
  original: string;
  explanation: string;
  why: string;
  source: string;
}

export interface AnalysisSummary {
  monthlyValue: string | null;
  duration: string | null;
  parties: string;
}

export interface AnalysisResult {
  title: string;
  documentType: string;
  pageCount: number;
  summary: AnalysisSummary;
  counts: { normal: number; review: number; attention: number };
  clauses: AnalysisClause[];
  documentText: string;
}

export interface AskMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AskRequest {
  documentText: string;
  documentType: string;
  question: string;
  history?: AskMessage[];
}
