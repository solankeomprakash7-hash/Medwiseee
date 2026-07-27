import * as React from 'react';
import { PatientData } from '../../types';
import { ChevronLeft, Info, Search, ShieldAlert, Thermometer, User, Zap } from 'lucide-react';

interface Stage3Props {
  data: Partial<PatientData>;
  onUpdate: (data: Partial<PatientData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Stage3_RiskLayering({ data, onUpdate, onNext, onBack }: Stage3Props) {
  const handleChange = (name: string, value: any) => {
    onUpdate({ [name]: value });
  };

  const toggleMDRFactor = (factor: keyof PatientData) => {
    const newValue = data[factor] === 'Yes' ? 'No' : 'Yes';
    onUpdate({ [factor]: newValue });
  };

  // Auto-calculate MDR risk based on rules
  const hasHighRiskFactors = 
    data.recentHospitalization === 'Yes' || 
    data.priorAntibiotics === 'Yes' || 
    data.immunocompromised === 'Yes';

  React.useEffect(() => {
    if (hasHighRiskFactors && data.mdrRisk !== 'Yes') {
      onUpdate({ mdrRisk: 'Yes' });
    }
  }, [hasHighRiskFactors]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="nejm-header">
        <h2 className="text-2xl font-serif font-bold">Stage 3: Risk Layering & Host Factors</h2>
        <p className="text-sm text-nejm-text/70 mt-1">Adjusting for patient-specific pharmacokinetics and resistance risks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Demographics & Basics */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-nejm-border p-6">
            <h3 className="nejm-section-title mb-6">
              <User size={18} className="text-nejm-blue" />
              Patient Characteristics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="nejm-label">Age</label>
                <input type="number" value={data.age} onChange={(e) => handleChange('age', e.target.value)} className="nejm-input" placeholder="65" />
              </div>
              <div>
                <label className="nejm-label">Sex</label>
                <select value={data.sex} onChange={(e) => handleChange('sex', e.target.value)} className="nejm-input">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="nejm-label">Weight (kg)</label>
                <input type="number" value={data.weight} onChange={(e) => handleChange('weight', e.target.value)} className="nejm-input" placeholder="75" />
              </div>
              <div>
                <label className="nejm-label">Renal Function (CrCl)</label>
                <input type="text" value={data.renalFunction} onChange={(e) => handleChange('renalFunction', e.target.value)} className="nejm-input" placeholder="45 ml/min" />
              </div>
              <div>
                <label className="nejm-label">Hepatic Function</label>
                <select value={data.hepaticFunction} onChange={(e) => handleChange('hepaticFunction', e.target.value)} className="nejm-input">
                  <option value="Normal">Normal</option>
                  <option value="Mild Impairment">Mild Impairment</option>
                  <option value="Moderate (Child-Pugh B)">Moderate (Child-Pugh B)</option>
                  <option value="Severe (Child-Pugh C)">Severe (Child-Pugh C)</option>
                </select>
              </div>
              <div>
                <label className="nejm-label">Pregnancy Status</label>
                <select value={data.pregnancyStatus} onChange={(e) => handleChange('pregnancyStatus', e.target.value)} className="nejm-input">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="N/A">N/A</option>
                </select>
              </div>
            </div>
          </section>

          {/* MDR Risk Factors */}
          <section className="bg-white border border-nejm-border p-6">
            <h3 className="nejm-section-title mb-6">
              <ShieldAlert size={18} className="text-nejm-red" />
              MDR Pathogen Risk Factors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'recentHospitalization', label: 'Recent Hospitalization', desc: 'Within last 90 days' },
                { id: 'priorAntibiotics', label: 'Prior Antibiotic Use', desc: 'Broad-spectrum in last 90 days' },
                { id: 'immunocompromised', label: 'Immunocompromised', desc: 'Chemo, steroids, transplant, HIV' },
                { id: 'indwellingDevices', label: 'Indwelling Devices', desc: 'CVC, Foley, EVD, etc.' },
                { id: 'travelHistory', label: 'Recent Travel', desc: 'To high-endemic resistance areas' },
                { id: 'neutropeniaStatus', label: 'Neutropenia', desc: 'ANC < 500 cells/mm³' }
              ].map(factor => (
                <button
                  key={factor.id}
                  onClick={() => toggleMDRFactor(factor.id as keyof PatientData)}
                  className={`flex justify-between items-center p-4 border transition-all text-left ${
                    data[factor.id as keyof PatientData] === 'Yes' 
                      ? 'bg-nejm-red/5 border-nejm-red/30' 
                      : 'bg-white border-nejm-border hover:bg-nejm-gray/5'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${data[factor.id as keyof PatientData] === 'Yes' ? 'text-nejm-red' : 'text-nejm-text'}`}>
                      {factor.label}
                    </p>
                    <p className="text-[9px] text-nejm-text/40">{factor.desc}</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${data[factor.id as keyof PatientData] === 'Yes' ? 'bg-nejm-red' : 'bg-nejm-border'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data[factor.id as keyof PatientData] === 'Yes' ? 'left-5' : 'left-1'}`}></div>
                  </div>
                </button>
              ))}
            </div>
            {data.priorAntibiotics === 'Yes' && (
              <div className="mt-4">
                <label className="nejm-label">Prior Antibiotic Details</label>
                <input 
                  type="text" 
                  value={data.priorAntibioticsDetails} 
                  onChange={(e) => handleChange('priorAntibioticsDetails', e.target.value)} 
                  className="nejm-input" 
                  placeholder="e.g. Piperacillin-Tazobactam for 7 days" 
                />
              </div>
            )}
          </section>
        </div>

        {/* Dynamic Risk Summary */}
        <div className="space-y-6">
          <div className={`p-6 border-l-4 shadow-sm ${hasHighRiskFactors ? 'bg-red-50 border-nejm-red' : 'bg-nejm-blue/5 border-nejm-blue'}`}>
            <div className="flex items-start gap-3 mb-4">
              {hasHighRiskFactors ? <ShieldAlert className="text-nejm-red shrink-0" /> : <Zap className="text-nejm-blue shrink-0" />}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50">Calculated MDR Risk</p>
                <h4 className={`text-xl font-bold font-serif ${hasHighRiskFactors ? 'text-nejm-red' : 'text-nejm-blue'}`}>
                  {hasHighRiskFactors ? 'HIGH RISK' : 'BASELINE RISK'}
                </h4>
              </div>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-[10px] text-nejm-text/60">
                <Info size={12} /> Pseudomonas Coverage: {hasHighRiskFactors ? 'MANDATORY' : 'Consider per source'}
              </li>
              <li className="flex items-center gap-2 text-[10px] text-nejm-text/60">
                <Info size={12} /> MRSA Coverage: {hasHighRiskFactors ? 'STRONGLY CONSIDER' : 'Source-dependent'}
              </li>
              <li className="flex items-center gap-2 text-[10px] text-nejm-text/60">
                <Info size={12} /> Pharmacokinetics: {data.weight ? 'Weight-adjusted dosing enabled' : 'Weight pending'}
              </li>
            </ul>

            <div className="p-4 bg-white/60 border border-nejm-border/30 rounded">
              <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-2">Host Factor Warning</p>
              <p className="text-[10px] leading-relaxed text-nejm-text/70">
                Organ dysfunction (Renal/Hepatic) requires precision dosing to avoid toxicity while maintaining AUC/MIC targets.
              </p>
            </div>
          </div>
          
          <div className="bg-nejm-navy text-white p-6 shadow-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">Clinical Evidence</h4>
            <p className="text-xs font-serif leading-relaxed italic opacity-90">
              "Recent hospitalization and prior antibiotic use are the strongest predictors of infection with drug-resistant pathogens in the ICU."
            </p>
            <p className="text-[9px] mt-4 opacity-50">— IDSA/SSC Guidelines 2024</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back to Stratification
        </button>
        <button 
          onClick={onNext}
          className="nejm-btn flex items-center gap-2"
        >
          Confirm Risk Layering <Search size={16} />
        </button>
      </div>
    </div>
  );
}
