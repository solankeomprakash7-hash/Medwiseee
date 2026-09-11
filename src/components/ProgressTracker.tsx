import * as React from 'react';
import { Stage } from '../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ProgressTrackerProps {
  currentStage: Stage;
  completedStages: Stage[];
}

const STAGES = [
  { id: Stage.INPUT, label: 'Clinical Input', icon: '1' },
  { id: Stage.RECOMMENDATION, label: 'Analysis & Decision', icon: '2' },
  { id: Stage.TIMELINE, label: 'Stewardship Timeline', icon: '3' },
];

export default function ProgressTracker({ currentStage, completedStages }: ProgressTrackerProps) {
  return (
    <div className="w-full lg:w-64 flex-shrink-0 bg-white border-r border-nejm-border p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h3 className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-nejm-text/40 mb-2">Workflow Progress</h3>
        <div className="h-[1px] w-full bg-nejm-border"></div>
      </div>
      
      <nav className="space-y-6">
        {STAGES.map((stage, index) => {
          const isActive = currentStage === stage.id;
          const isCompleted = completedStages.includes(stage.id);
          
          return (
            <div key={stage.id} className="relative flex items-start group">
              {index !== STAGES.length - 1 && (
                <div className={`absolute left-4 top-8 -bottom-4 w-[1px] ${isCompleted ? 'bg-nejm-blue' : 'bg-nejm-border'}`}></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-nejm-blue border-nejm-blue text-white shadow-lg shadow-nejm-blue/20' 
                    : isCompleted
                      ? 'bg-white border-nejm-blue text-nejm-blue'
                      : 'bg-white border-nejm-border text-nejm-text/30'
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold font-mono">{stage.icon}</span>}
                </div>
                
                <div className="pt-1">
                  <p className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    isActive ? 'text-nejm-blue' : isCompleted ? 'text-nejm-text' : 'text-nejm-text/30'
                  }`}>
                    {stage.label}
                  </p>
                  {isActive && (
                    <div className="flex items-center gap-1.5 mt-1 text-[9px] text-nejm-blue/60 font-medium">
                      <Clock size={10} className="animate-pulse" /> Active Stage
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      
      <div className="mt-12 p-4 bg-nejm-gray/10 border border-nejm-border/30">
        <p className="text-[9px] uppercase font-bold text-nejm-text/50 mb-2">Security Note</p>
        <p className="text-[10px] leading-relaxed text-nejm-text/60 italic">
          MedWise does not store PHI. All inputs are session-based and anonymized.
        </p>
      </div>
    </div>
  );
}
