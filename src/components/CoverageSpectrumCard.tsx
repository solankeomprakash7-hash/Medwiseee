import * as React from 'react';
import { AnalysisResult } from '../types';
import { ShieldCheck, ShieldX, Binary } from 'lucide-react';

interface CoverageSpectrumCardProps {
  result: AnalysisResult;
}

export default function CoverageSpectrumCard({ result }: CoverageSpectrumCardProps) {
  const primaryRec = result.empiric_recommendation[0];
  if (!primaryRec) return null;

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <Binary size={14} className="text-nejm-blue" /> Coverage Spectrum: {primaryRec.antibiotic}
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-700 flex items-center gap-2">
            <ShieldCheck size={14} /> Antimicrobial Activity
          </h4>
          <div className="bg-green-50/50 border border-green-100 p-4 rounded-sm">
            <p className="text-sm font-serif text-nejm-navy leading-relaxed italic">
              {primaryRec.spectrumCovered}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-red-700 flex items-center gap-2">
            <ShieldX size={14} /> Major Spectrum Gaps
          </h4>
          <div className="bg-red-50/50 border border-red-100 p-4 rounded-sm">
            <p className="text-sm font-serif text-nejm-navy leading-relaxed italic">
              {primaryRec.spectrumNotCovered}
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-nejm-gray/5 border-t border-nejm-border flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-nejm-blue"></div>
        <p className="text-[9px] text-nejm-text/50 uppercase tracking-widest font-bold">
          Validated against suspected pathogen profile and local epidemiology
        </p>
      </div>
    </div>
  );
}
