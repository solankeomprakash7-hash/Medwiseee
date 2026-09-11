import * as React from 'react';
import { AnalysisResult } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SpectrumFitCardProps {
  result: AnalysisResult;
}

export default function SpectrumFitCard({ result }: SpectrumFitCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  
  if (!result.spectrum_fit) return null;

  const { score, status, interpretation, required_coverage, provided_coverage, excess_coverage } = result.spectrum_fit;

  const getStatusColor = () => {
    switch (status) {
      case 'Appropriate': return 'text-green-600 bg-green-50 border-green-200';
      case 'Broader than required': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Inadequate': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-nejm-text bg-nejm-gray border-nejm-border';
    }
  };

  const getStatusDotColor = () => {
    switch (status) {
      case 'Appropriate': return 'bg-green-500';
      case 'Broader than required': return 'bg-amber-500';
      case 'Inadequate': return 'bg-red-500';
      default: return 'bg-nejm-text';
    }
  };

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <Activity size={14} className="text-nejm-navy" /> 3. Spectrum Fit
        </h3>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-nejm-navy">MedWise Spectrum Assessment</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter border ${getStatusColor()}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-nejm-text/40">Fit Score</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-nejm-navy">{score}</span>
                <span className="text-xs text-nejm-text/40">/ 100</span>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${getStatusDotColor()}`}></div>
          </div>
        </div>

        <div className="bg-nejm-gray/5 p-4 border border-nejm-border/30 mb-4">
          <p className="text-sm font-serif italic text-nejm-text/80 leading-relaxed">
            "{interpretation}"
          </p>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-nejm-blue hover:text-nejm-navy transition-colors"
        >
          {expanded ? 'Hide Details' : 'Expand Spectrum Components'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-600" /> Coverage Required
                  </h4>
                  <ul className="space-y-1.5">
                    {required_coverage.map((item, i) => (
                      <li key={i} className="text-[11px] text-nejm-text/70 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500"></div> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-nejm-blue" /> Coverage Provided
                  </h4>
                  <ul className="space-y-1.5">
                    {provided_coverage.map((item, i) => (
                      <li key={i} className="text-[11px] text-nejm-text/70 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-nejm-blue"></div> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-nejm-text/50 flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-500" /> Excess Coverage
                  </h4>
                  <ul className="space-y-1.5">
                    {excess_coverage.map((item, i) => (
                      <li key={i} className="text-[11px] text-nejm-text/70 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
