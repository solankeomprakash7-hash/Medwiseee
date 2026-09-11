import * as React from 'react';
import { AnalysisResult } from '../types';
import { ListChecks, ArrowRightCircle } from 'lucide-react';

interface NextStepsCardProps {
  result: AnalysisResult;
}

export default function NextStepsCard({ result }: NextStepsCardProps) {
  if (!result.next_steps || result.next_steps.length === 0) return null;

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <ListChecks size={14} className="text-nejm-blue" /> What to Do Next
        </h3>
      </div>
      
      <div className="p-6 space-y-4">
        {result.next_steps.map((step, idx) => (
          <div key={idx} className="flex gap-4 items-start">
            <div className="mt-1 text-nejm-blue/40">
              <ArrowRightCircle size={14} />
            </div>
            <p className="text-sm font-serif text-nejm-navy leading-relaxed">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
