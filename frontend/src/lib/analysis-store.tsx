import { createContext, useContext, useState, type ReactNode } from 'react';

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

export interface AnalysisResult {
  title: string;
  documentType: string;
  pageCount: number;
  summary: {
    monthlyValue: string | null;
    duration: string | null;
    parties: string;
  };
  counts: {
    normal: number;
    review: number;
    attention: number;
  };
  clauses: AnalysisClause[];
  documentText: string;
}

interface AnalysisStore {
  result: AnalysisResult | null;
  fileName: string | null;
  setAnalysis: (result: AnalysisResult, fileName: string) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisStore | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const setAnalysis = (next: AnalysisResult, name: string) => {
    setResult(next);
    setFileName(name);
  };

  const clearAnalysis = () => {
    setResult(null);
    setFileName(null);
  };

  return (
    <AnalysisContext.Provider value={{ result, fileName, setAnalysis, clearAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisStore {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}