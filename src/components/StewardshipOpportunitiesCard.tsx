import * as React from 'react';
import { AnalysisResult, StewardshipOpportunity } from '../types';
import { Zap, AlertTriangle, Info, CheckCircle2, ChevronRight, ArrowUpRight, ArrowDownRight, RefreshCcw, Search, Scissors, StopCircle, Clock } from 'lucide-react';

interface StewardshipOpportunitiesCardProps {
  result: AnalysisResult;
}

export default function StewardshipOpportunitiesCard({ result }: StewardshipOpportunitiesCardProps) {
  const opportunities = result.stewardship_opportunities || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'STOP': return <StopCircle size={16} />;
      case 'DE-ESCALATE': return <ArrowDownRight size={16} />;
      case 'NARROW': return <Scissors size={16} />;
      case 'CHANGE': return <RefreshCcw size={16} />;
      case 'IV -> ORAL': return <RefreshCcw size={16} />;
      case 'OPTIMIZE DOSE': return <Zap size={16} />;
      case 'REVIEW DURATION': return <Clock size={16} />;
      case 'CULTURE-DIRECTED THERAPY': return <Search size={16} />;
      case 'AVOID UNNECESSARY BROAD SPECTRUM': return <Scissors size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Low': return 'text-nejm-blue bg-blue-50 border-blue-200';
      default: return 'text-nejm-text bg-nejm-gray border-nejm-border';
    }
  };

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-nejm-border bg-nejm-gray/5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy flex items-center gap-2">
          <Zap size={14} className="text-nejm-blue" /> 7. Stewardship Opportunities
        </h3>
      </div>
      
      <div className="divide-y divide-nejm-border">
        {opportunities.length > 0 ? (
          opportunities.slice(0, 4).map((opportunity, idx) => (
            <div key={idx} className="p-6 flex gap-4 hover:bg-nejm-gray/5 transition-colors">
              <div className={`mt-1 p-2 h-fit border ${getPriorityColor(opportunity.priority)}`}>
                {getIcon(opportunity.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-nejm-navy">
                    {opportunity.type}
                  </span>
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border rounded-full ${getPriorityColor(opportunity.priority)}`}>
                    {opportunity.priority} Priority
                  </span>
                </div>
                
                <h4 className="text-sm font-serif font-bold text-nejm-navy mb-1">
                  {opportunity.description}
                </h4>
                
                <p className="text-[11px] text-nejm-text/60 leading-relaxed italic">
                  {opportunity.rationale}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white">
            <CheckCircle2 size={32} className="mx-auto mb-4 text-green-500 opacity-20" />
            <p className="text-sm font-serif italic text-nejm-text/40">✓ No additional stewardship opportunity identified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
