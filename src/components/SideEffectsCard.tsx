import * as React from 'react';
import { AnalysisResult } from '../types';
import { AlertCircle, Pill, Activity } from 'lucide-react';

interface SideEffectsCardProps {
  result: AnalysisResult;
}

export default function SideEffectsCard({ result }: SideEffectsCardProps) {
  const safety = result.side_effects_interactions;
  if (!safety) return null;

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <AlertCircle size={14} className="text-nejm-red" /> 6. Side Effects & Interactions to Watch
        </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
            <AlertCircle size={12} /> Important Adverse Effects
          </h4>
          <ul className="space-y-2">
            {safety.adverse_effects.map((effect, i) => (
              <li key={i} className="text-[11px] text-nejm-text/80 leading-relaxed flex gap-2">
                <span className="text-nejm-red">⚠️</span> {effect}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
            <Pill size={12} /> Important Interactions
          </h4>
          <ul className="space-y-2">
            {safety.interactions.map((interaction, i) => (
              <li key={i} className="text-[11px] text-nejm-text/80 leading-relaxed flex gap-2">
                <span className="text-nejm-blue">💊</span> {interaction}
              </li>
            ))}
            {safety.interactions.length === 0 && (
              <li className="text-[11px] text-nejm-text/40 italic">No major interactions identified.</li>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
            <Activity size={12} /> Monitor
          </h4>
          <ul className="space-y-2">
            {safety.monitoring.map((m, i) => (
              <li key={i} className="text-[11px] text-nejm-text/80 leading-relaxed flex gap-2">
                <span className="text-nejm-navy">🩺</span> {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-nejm-gray/5 border-t border-nejm-border">
        <p className="text-[9px] text-nejm-text/30 italic">
          Safety assessment based on current renal function, weight, and concomitant medications.
        </p>
      </div>
    </div>
  );
}
