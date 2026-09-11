import * as React from 'react';
import { AnalysisResult } from '../types';
import { Activity, Zap, AlertCircle, Info } from 'lucide-react';

interface PKPDFitCardProps {
  result: AnalysisResult;
}

export default function PKPDFitCard({ result }: PKPDFitCardProps) {
  if (!result.pk_pd_fit) return null;

  const { target, expected_exposure, optimization_strategy, tdm_required, rationale, renal_adjustment, hepatic_adjustment } = result.pk_pd_fit;
  const primaryRec = result.empiric_recommendation[0];

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <Activity size={14} className="text-nejm-blue" /> 4. How to Administer / PK-PD
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <div>
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Practical Dosing</p>
            <div className="space-y-4">
              {(result.empiric_recommendation || []).map((rec, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[8px] font-bold text-nejm-blue uppercase tracking-tighter">{rec.antibiotic}</p>
                  <p className="text-sm font-serif font-bold text-nejm-navy">{rec.dose} {rec.route}</p>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-nejm-text/60">{rec.frequency}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Relevant PK/PD Target</p>
            <p className="text-sm font-serif font-bold text-nejm-navy">{target}</p>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">TDM Requirement</p>
            <div className={`inline-flex items-center gap-2 px-2 py-0.5 border text-[10px] font-bold uppercase tracking-tighter ${tdm_required ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-nejm-text/40 bg-nejm-gray/10 border-nejm-border'}`}>
              {tdm_required ? 'Required' : 'Not routinely required'}
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-6">
          <div className="bg-nejm-blue/5 p-4 border-l-2 border-nejm-blue">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue mb-2 flex items-center gap-2">
              <Zap size={12} /> Optimization Strategy
            </h4>
            <div className="space-y-3">
              {(result.empiric_recommendation || []).map((rec, idx) => (
                <div key={idx}>
                  <p className="text-[8px] font-bold text-nejm-blue uppercase mb-1">{rec.antibiotic}</p>
                  <p className="text-sm font-serif font-bold text-nejm-navy mb-1">{rec.infusion}</p>
                </div>
              ))}
              <p className="text-xs text-nejm-text/70 leading-relaxed italic border-t border-nejm-blue/10 pt-2">{optimization_strategy}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2">Renal Adjustment</h4>
              <p className="text-[11px] text-nejm-text/80">{renal_adjustment || 'Adjust according to renal function.'}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2">Hepatic Adjustment</h4>
              <p className="text-[11px] text-nejm-text/80">{hepatic_adjustment || 'Not routinely required.'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2 flex items-center gap-2">
              <Info size={12} /> Probablity of Target Attainment
            </h4>
            <p className="text-xs text-nejm-text/70 leading-relaxed italic">
              {expected_exposure}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
