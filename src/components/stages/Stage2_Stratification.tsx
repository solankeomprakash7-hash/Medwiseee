import * as React from 'react';
import { PatientData } from '../../types';
import { INFECTION_SOURCES } from '../../constants';
import { CheckCircle2, ChevronLeft, MapPin, ShieldAlert } from 'lucide-react';

interface Stage2Props {
  data: Partial<PatientData>;
  onUpdate: (data: Partial<PatientData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Stage2_Stratification({ data, onUpdate, onNext, onBack }: Stage2Props) {
  const handleChange = (name: string, value: string) => {
    onUpdate({ [name]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="nejm-header">
        <h2 className="text-2xl font-serif font-bold">Stage 2: Clinical Stratification</h2>
        <p className="text-sm text-nejm-text/70 mt-1">Classifying the severity and origin of the septic insult.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* Clinical Phenotype */}
          <section>
            <h3 className="nejm-section-title">
              <ShieldAlert size={18} className="text-nejm-blue" />
              Clinical Phenotype
            </h3>
            <div className="flex gap-4">
              {['Sepsis', 'Septic Shock'].map(type => (
                <button
                  key={type}
                  onClick={() => handleChange('diagnosis', type)}
                  className={`flex-1 p-4 border transition-all ${
                    data.diagnosis === type 
                      ? 'bg-nejm-blue border-nejm-blue text-white shadow-md' 
                      : 'bg-white border-nejm-border text-nejm-text hover:border-nejm-blue/50'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest">{type}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Suspected Source */}
          <section>
            <h3 className="nejm-section-title">Suspected Source of Infection</h3>
            <select 
              value={data.infectionSource} 
              onChange={(e) => handleChange('infectionSource', e.target.value)}
              className="nejm-input"
            >
              <option value="">Select Primary Source</option>
              {INFECTION_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </section>

          {/* Setting */}
          <section>
            <h3 className="nejm-section-title">
              <MapPin size={18} className="text-nejm-blue" />
              Acquisition Setting
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Community', label: 'Community-Acquired', desc: 'Sepsis onset < 48h of admission' },
                { id: 'Healthcare', label: 'Healthcare-Associated', desc: 'Onset > 48h or recent hospital exposure' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleChange('setting', item.id)}
                  className={`p-4 border text-left transition-all ${
                    data.setting === item.id 
                      ? 'bg-nejm-blue border-nejm-blue text-white shadow-md' 
                      : 'bg-white border-nejm-border text-nejm-text hover:border-nejm-blue/50'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={`text-[9px] ${data.setting === item.id ? 'text-white/70' : 'text-nejm-text/50'} italic`}>{item.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="bg-nejm-gray/10 p-6 border border-nejm-border/30">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue mb-4">Stratification Insight</h4>
          <p className="text-xs text-nejm-text/70 leading-relaxed font-serif italic mb-4">
            "Distinguishing between Community and Healthcare-associated acquisition is critical for determining the likely resistance profile and the need for anti-pseudomonal coverage."
          </p>
          <div className="p-4 bg-white border border-nejm-border/20 rounded-sm">
            <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-2">Guideline Reference</p>
            <p className="text-[10px] text-nejm-blue font-bold">SSC 2021 / IDSA Pneumonia 2019</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back to Vitals
        </button>
        <button 
          onClick={onNext}
          disabled={!data.diagnosis || !data.infectionSource || !data.setting}
          className="nejm-btn flex items-center gap-2"
        >
          Proceed to Risk Layering <CheckCircle2 size={16} />
        </button>
      </div>
    </div>
  );
}
