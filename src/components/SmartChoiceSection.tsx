import * as React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface SmartChoiceSectionProps {
  result: AnalysisResult;
}

export default function SmartChoiceSection({ result }: SmartChoiceSectionProps) {
  if (!result.smartest_choice_reasons || result.smartest_choice_reasons.length === 0) return null;

  return (
    <div className="bg-nejm-navy text-white p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Sparkles size={120} />
      </div>
      
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-6 flex items-center gap-2">
        <ShieldCheck size={14} /> 2. WHY THIS CHOICE
      </h3>
      
      <div className="space-y-4">
        {result.smartest_choice_reasons.slice(0, 3).map((reason, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="mt-1 p-0.5 bg-white/20 rounded-full">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <p className="text-sm font-serif italic leading-relaxed opacity-95">
              {reason}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Precision spectrum activity and site penetration validated</span>
      </div>
    </div>
  );
}
