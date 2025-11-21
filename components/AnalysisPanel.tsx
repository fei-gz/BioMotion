import React from 'react';
import { AnalysisResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface AnalysisPanelProps {
  result: AnalysisResult | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm max-h-[60vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-medical-900 mb-1">{result.title}</h2>
      <div className="w-10 h-1 bg-medical-500 rounded mb-4"></div>

      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-medical-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            Biomechanics
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed">
            <ReactMarkdown>{result.biomechanics}</ReactMarkdown>
          </div>
        </div>

        <div className="bg-medical-50 p-3 rounded-lg border border-medical-100">
          <h3 className="text-sm font-bold text-medical-700 uppercase tracking-wider mb-1 flex items-center gap-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.64-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.64z"/><path d="M22 22v-4"/><path d="M5 10C3.34 10 2 8.66 2 7s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/><path d="M5 22v-6"/><path d="M5 16c2.67 0 8-1.34 8-4V7c0-2.66-5.33-4-8-4S0 4.34 0 7v5c0 2.66 5.33 4 8 4z"/></svg>
            Muscle Status
          </h3>
          <div className="text-sm text-medical-900 leading-relaxed">
            <ReactMarkdown>{result.muscles}</ReactMarkdown>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
            Clinical Notes
          </h3>
          <div className="text-sm text-slate-600 leading-relaxed">
            <ReactMarkdown>{result.clinicalNotes}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;