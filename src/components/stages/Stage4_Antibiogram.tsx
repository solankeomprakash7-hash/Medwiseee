import * as React from 'react';
import { AntibiogramEntry, PatientData } from '../../types';
import { INITIAL_ANTIBIOGRAM } from '../../constants';
import { ChevronLeft, Database, Info, Plus, Save, Trash2 } from 'lucide-react';

interface Stage4Props {
  data: Partial<PatientData>;
  onUpdate: (data: Partial<PatientData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Stage4_Antibiogram({ data, onUpdate, onNext, onBack }: Stage4Props) {
  const [entries, setEntries] = React.useState<AntibiogramEntry[]>(data.localAntibiogram || INITIAL_ANTIBIOGRAM);

  const handleUpdateEntry = (index: number, field: keyof AntibiogramEntry, value: any) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, { organism: '', antibiotic: '', susceptibility: 0 }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const saveAndNext = () => {
    onUpdate({ localAntibiogram: entries });
    onNext();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="nejm-header">
        <h2 className="text-2xl font-serif font-bold">Stage 4: Local Antibiogram Integration</h2>
        <p className="text-sm text-nejm-text/70 mt-1">Cross-checking empiric choices against local susceptibility patterns.</p>
      </div>

      <div className="bg-white border border-nejm-border overflow-hidden">
        <div className="bg-nejm-gray/10 px-6 py-4 border-b border-nejm-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-nejm-blue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/60">Institutional Susceptibility Data</span>
          </div>
          <button onClick={addEntry} className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-nejm-blue hover:underline">
            <Plus size={14} /> Add Organism
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-nejm-border">
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-nejm-text/40">Organism</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-nejm-text/40">Antibiotic</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-nejm-text/40">Susceptibility (%)</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-nejm-text/40 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nejm-border/50">
            {entries.map((entry, index) => (
              <tr key={index} className="hover:bg-nejm-gray/5 transition-colors">
                <td className="px-6 py-3">
                  <input 
                    type="text" 
                    value={entry.organism} 
                    onChange={(e) => handleUpdateEntry(index, 'organism', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs font-medium text-nejm-text italic"
                    placeholder="e.g. P. aeruginosa"
                  />
                </td>
                <td className="px-6 py-3">
                  <input 
                    type="text" 
                    value={entry.antibiotic} 
                    onChange={(e) => handleUpdateEntry(index, 'antibiotic', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-xs text-nejm-text"
                    placeholder="e.g. Meropenem"
                  />
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={entry.susceptibility} 
                      onChange={(e) => handleUpdateEntry(index, 'susceptibility', parseInt(e.target.value))}
                      className="flex-1 accent-nejm-blue"
                    />
                    <span className={`text-xs font-mono font-bold w-10 text-right ${entry.susceptibility < 80 ? 'text-nejm-red' : 'text-nejm-blue'}`}>
                      {entry.susceptibility}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => removeEntry(index)} className="text-nejm-text/30 hover:text-nejm-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {entries.length === 0 && (
          <div className="p-12 text-center">
            <Database size={32} className="mx-auto text-nejm-border mb-4" />
            <p className="text-xs text-nejm-text/40 italic">No local antibiogram data provided.</p>
            <button onClick={addEntry} className="mt-4 text-[10px] font-bold uppercase text-nejm-blue">Add First Entry</button>
          </div>
        )}
      </div>

      <div className="bg-nejm-blue/5 p-6 border border-nejm-blue/20 flex gap-4 items-start">
        <Info className="text-nejm-blue shrink-0" size={20} />
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue mb-1">Impact of Local Data</h4>
          <p className="text-[11px] text-nejm-text/70 leading-relaxed italic">
            This data will be used by the clinical intelligence engine to refine coverage percentages and prioritize agents that meet the institutional threshold (typically &gt;90% susceptibility for empiric therapy in sepsis).
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back to Risk Factors
        </button>
        <button 
          onClick={saveAndNext}
          className="nejm-btn flex items-center gap-2"
        >
          Generate Recommendation <Save size={16} />
        </button>
      </div>
    </div>
  );
}
