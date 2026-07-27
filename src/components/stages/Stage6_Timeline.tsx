import * as React from 'react';
import { PatientData } from '../../types';
import { DURATION_LOOKUP } from '../../constants';
import { Calendar, CheckCircle2, ChevronLeft, Clock, Download, FileText, FlaskConical, History, Scissors } from 'lucide-react';

interface Stage6Props {
  data: PatientData;
  onUpdate: (data: Partial<PatientData>) => void;
  onBack: () => void;
}

export default function Stage6_Timeline({ data, onUpdate, onBack }: Stage6Props) {
  const durationInfo = DURATION_LOOKUP[data.infectionSource as keyof typeof DURATION_LOOKUP] || { range: '7 days', citation: 'General Guidelines' };

  const timelineEvents = [
    { day: 0, label: 'Hour 0-1', desc: 'Blood cultures, lactate, and initiation of empiric therapy.', icon: <FlaskConical size={14} />, status: 'completed' },
    { day: 1, label: 'Day 1 (24h)', desc: 'Re-evaluate clinical response, check initial culture growth.', icon: <History size={14} />, status: 'active' },
    { day: 3, label: 'Day 3 (72h)', desc: 'Mandatory de-escalation check. Culture-directed therapy.', icon: <Scissors size={14} />, status: 'pending' },
    { day: 7, label: `Day ${durationInfo.range.split(' ')[0]}`, desc: `Target completion based on ${data.infectionSource}.`, icon: <Calendar size={14} />, status: 'pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-start">
        <div className="nejm-header">
          <h2 className="text-2xl font-serif font-bold">Stage 6: Stewardship Timeline</h2>
          <p className="text-sm text-nejm-text/70 mt-1">Projected clinical pathway and de-escalation milestones.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-nejm-border text-[10px] font-bold uppercase tracking-widest text-nejm-text/60 hover:bg-nejm-gray/5">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-nejm-navy text-white text-[10px] font-bold uppercase tracking-widest hover:bg-nejm-navy/90">
            <FileText size={14} /> Save Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Visualization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative pl-8 space-y-12 py-4">
            <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-nejm-border"></div>
            
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  event.status === 'completed' 
                    ? 'bg-nejm-blue border-nejm-blue text-white' 
                    : event.status === 'active'
                      ? 'bg-white border-nejm-blue text-nejm-blue shadow-lg shadow-nejm-blue/20 scale-110'
                      : 'bg-white border-nejm-border text-nejm-text/30'
                }`}>
                  {event.icon}
                </div>
                
                <div className={`p-6 border transition-all ${
                  event.status === 'active' 
                    ? 'bg-white border-nejm-blue shadow-md' 
                    : 'bg-white border-nejm-border opacity-70'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-nejm-navy">{event.label}</h4>
                    {event.status === 'completed' && <CheckCircle2 size={16} className="text-nejm-blue" />}
                  </div>
                  <p className="text-xs text-nejm-text/70 leading-relaxed font-serif italic">
                    {event.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stewardship Sidebar */}
        <div className="space-y-6">
          <section className="p-6 bg-nejm-blue text-white shadow-lg">
            <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
              <Clock size={14} /> Duration Target
            </h3>
            <div className="mb-4">
              <p className="text-3xl font-serif font-bold">{durationInfo.range}</p>
              <p className="text-[10px] opacity-70 mt-1">Infection: {data.infectionSource}</p>
            </div>
            <div className="pt-4 border-t border-white/20">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Citation</p>
              <p className="text-[10px] italic">{durationInfo.citation}</p>
            </div>
          </section>

          <div className="p-6 bg-white border border-nejm-border">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/40 mb-4">Recommended Actions</h4>
            <ul className="space-y-3">
              {[
                'Daily procalcitonin if pulmonary source',
                'Repeat lactate within 6h if initial >2',
                'Serial NEWS2 monitoring every 4h',
                'Infectious Disease consult if bacteremia'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-nejm-text/70">
                  <div className="w-1 h-1 bg-nejm-blue rounded-full mt-1.5 shrink-0"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back to Recommendation
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="nejm-btn flex items-center gap-2"
        >
          Start New Session
        </button>
      </div>
    </div>
  );
}
