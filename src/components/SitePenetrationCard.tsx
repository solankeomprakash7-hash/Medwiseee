import * as React from 'react';
import { AnalysisResult } from '../types';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SitePenetrationCardProps {
  result: AnalysisResult;
  sources?: string[];
}

export default function SitePenetrationCard({ result, sources }: SitePenetrationCardProps) {
  if (!result.site_penetration) return null;

  const { assessment, limitations, site_specific_context } = result.site_penetration;

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <MapPin size={14} className="text-nejm-red" /> 5. Tissue / Site Penetration
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Infection Site(s)</p>
            <p className="text-sm font-serif font-bold text-nejm-navy mb-4">{(sources || []).join(', ') || 'Global Assessment'}</p>
            
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Penetration Assessment</p>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${assessment.toLowerCase().includes('excellent') || assessment.toLowerCase().includes('good') ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <h4 className="text-sm font-serif font-bold text-nejm-navy">{assessment}</h4>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Clinical Relevance</p>
            <p className="text-xs text-nejm-text/70 leading-relaxed italic">{site_specific_context}</p>
          </div>
        </div>

        {limitations && limitations.toLowerCase() !== 'none' && (
          <div className="bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800">⚠️ Penetration Limitation</p>
              <p className="text-xs text-amber-700 leading-relaxed">{limitations}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
