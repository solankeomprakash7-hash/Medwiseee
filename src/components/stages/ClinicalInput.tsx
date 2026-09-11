import * as React from 'react';
import { PatientData, Vitals, Scores } from '../../types';
import { INFECTION_SOURCES } from '../../constants';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Search, 
  ShieldAlert, 
  Stethoscope, 
  Thermometer, 
  User, 
  Zap, 
  Activity, 
  FlaskConical, 
  History, 
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClinicalInputProps {
  data: PatientData;
  onUpdate: (data: Partial<PatientData>) => void;
  onNext: () => void;
}

export default function ClinicalInput({ data, onUpdate, onNext }: ClinicalInputProps) {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    basics: true,
    clinical: true,
    comorbidities: false,
    medications: false,
    investigations: false,
    optional: false
  });

  const [showValidationWarning, setShowValidationWarning] = React.useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (name: string, value: any) => {
    onUpdate({ [name]: value });
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextVitals = { ...data.vitals, [name]: value };
    const nextScores = calculateScores(nextVitals);
    onUpdate({ vitals: nextVitals, scores: nextScores });
  };

  const calculateScores = (v: Vitals): Scores => {
    let qsofa = 0;
    if (parseFloat(v.rr) >= 22) qsofa++;
    if (parseFloat(v.sbp) <= 100) qsofa++;
    if (parseFloat(v.gcs) < 15) qsofa++;

    let news2 = 0;
    const rr = parseFloat(v.rr);
    if (rr >= 25 || rr <= 8) news2 += 3;
    else if (rr >= 21 || rr <= 11) news2 += 2;
    
    const sbp = parseFloat(v.sbp);
    if (sbp <= 90) news2 += 3;
    else if (sbp <= 100) news2 += 2;
    else if (sbp <= 110) news2 += 1;

    const sepsisCriteriaMet = qsofa >= 2 || (v.sbp !== '' && parseFloat(v.sbp) < 100);

    return {
      qsofa,
      sofa: qsofa * 2,
      news2,
      sepsisCriteriaMet
    };
  };

  const mandatoryFields = [
    { key: 'infectionSources', label: 'Infection Source(s)' },
    { key: 'diagnosis', label: 'Diagnosis Severity' },
    { key: 'weight', label: 'Patient Weight' },
    { key: 'renalFunction', label: 'Renal Function' },
    { key: 'sourceControl', label: 'Source Control Assessment' }
  ];

  const missingFields = mandatoryFields.filter(f => {
    const val = data[f.key as keyof PatientData];
    if (Array.isArray(val)) return val.length === 0;
    return !val;
  });

  const handleAnalyze = () => {
    if (missingFields.length > 0) {
      setShowValidationWarning(true);
    } else {
      onNext();
    }
  };

  const toggleInfectionSource = (source: string) => {
    const current = data.infectionSources || [];
    if (current.includes(source)) {
      handleChange('infectionSources', current.filter(s => s !== source));
    } else {
      handleChange('infectionSources', [...current, source]);
    }
  };

  const SectionHeader = ({ id, title, icon: Icon, isCritical = false }: { id: string, title: string, icon: any, isCritical?: boolean }) => (
    <button 
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 bg-white border border-nejm-border hover:bg-nejm-gray/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 ${isCritical ? 'bg-nejm-red/10 text-nejm-red' : 'bg-nejm-blue/10 text-nejm-blue'}`}>
          <Icon size={18} />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-bold uppercase tracking-widest text-nejm-navy">{title}</h3>
          {isCritical && <span className="text-[9px] font-bold text-nejm-red uppercase">Critical Section</span>}
        </div>
      </div>
      {expandedSections[id] ? <ChevronUp size={20} className="text-nejm-text/30" /> : <ChevronDown size={20} className="text-nejm-text/30" />}
    </button>
  );

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-700">
      <div className="nejm-header">
        <h2 className="text-3xl font-serif font-bold text-nejm-navy">Clinical Assessment</h2>
        <p className="text-sm text-nejm-text/70 mt-2">Enter patient details below. Critical fields are marked with an asterisk (*).</p>
      </div>

      {/* 1. CASE BASICS */}
      <div className="space-y-4">
        <SectionHeader id="basics" title="Patient & Case Basics" icon={User} isCritical />
        <AnimatePresence initial={false}>
          {expandedSections.basics && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white border-x border-b border-nejm-border grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <label className="nejm-label">Suspected Source(s) of Infection * <span className="text-[9px] font-normal opacity-50 ml-2">(Select all that apply)</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {INFECTION_SOURCES.map(source => (
                      <button
                        key={source}
                        onClick={() => toggleInfectionSource(source)}
                        className={`p-2 border text-[9px] font-bold uppercase tracking-tight transition-all text-center h-full flex items-center justify-center ${
                          data.infectionSources?.includes(source)
                            ? 'bg-nejm-blue border-nejm-blue text-white shadow-sm'
                            : 'bg-white border-nejm-border text-nejm-text hover:border-nejm-blue/30'
                        }`}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="nejm-label">Severity *</label>
                  <div className="flex gap-2">
                    {['Sepsis', 'Septic Shock'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleChange('diagnosis', type)}
                        className={`flex-1 p-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          data.diagnosis === type 
                            ? 'bg-nejm-navy border-nejm-navy text-white shadow-sm' 
                            : 'bg-white border-nejm-border text-nejm-text hover:border-nejm-navy/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="nejm-label">Age</label>
                  <input type="number" value={data.age} onChange={(e) => handleChange('age', e.target.value)} className="nejm-input" placeholder="e.g. 65" />
                </div>
                <div>
                  <label className="nejm-label">Weight (kg) *</label>
                  <input type="number" value={data.weight} onChange={(e) => handleChange('weight', e.target.value)} className="nejm-input" placeholder="e.g. 75" />
                </div>
                <div>
                  <label className="nejm-label">Height (cm)</label>
                  <input type="number" value={data.height || ''} onChange={(e) => handleChange('height', e.target.value)} className="nejm-input" placeholder="e.g. 180" />
                </div>
                <div>
                  <label className="nejm-label">Setting</label>
                  <select value={data.setting} onChange={(e) => handleChange('setting', e.target.value)} className="nejm-input">
                    <option value="Community">Community-Acquired</option>
                    <option value="Healthcare">Healthcare-Associated</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="nejm-label">Source Control Assessment *</label>
                  <select value={data.sourceControl} onChange={(e) => handleChange('sourceControl', e.target.value)} className="nejm-input">
                    <option value="Unknown">Select Status</option>
                    <option value="Adequate">Adequate (e.g. Abscess drained, Line removed)</option>
                    <option value="In progress">In progress / Planned</option>
                    <option value="Not achieved">Not achieved (Persistent focus)</option>
                    <option value="Not applicable">Not applicable</option>
                  </select>
                </div>
                <div>
                  <label className="nejm-label">Microbiology Status</label>
                  <select value={data.microbiologyStatus} onChange={(e) => handleChange('microbiologyStatus', e.target.value)} className="nejm-input">
                    <option value="No microbiology">No microbiology yet</option>
                    <option value="Gram stain available">Gram stain available</option>
                    <option value="Organism identified">Organism identified</option>
                    <option value="Susceptibility available">Susceptibility available</option>
                  </select>
                </div>
                {data.microbiologyStatus !== 'No microbiology' && (
                  <div className="md:col-span-3 animate-in fade-in slide-in-from-top-2">
                    <label className="nejm-label">Confirmed/Suspected Organism & Susceptibility</label>
                    <input 
                      type="text" 
                      value={data.confirmedOrganism || ''} 
                      onChange={(e) => handleChange('confirmedOrganism', e.target.value)} 
                      className="nejm-input" 
                      placeholder="e.g. E. coli (S: Ceftriaxone, R: Ampicillin) or 'Gram negative rods'" 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. KEY CLINICAL INFORMATION */}
      <div className="space-y-4">
        <SectionHeader id="clinical" title="Key Clinical Information" icon={Activity} isCritical />
        <AnimatePresence initial={false}>
          {expandedSections.clinical && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white border-x border-b border-nejm-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Renal/Hepatic - CRITICAL */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue flex items-center gap-2">
                      <FlaskConical size={14} /> Organ Function
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="nejm-label">Renal Function (eGFR/CrCl) *</label>
                        <input type="text" value={data.renalFunction} onChange={(e) => handleChange('renalFunction', e.target.value)} className="nejm-input" placeholder="e.g. 45 ml/min" />
                      </div>
                      <div>
                        <label className="nejm-label">Renal Trend</label>
                        <select value={data.renalTrend || 'Stable'} onChange={(e) => handleChange('renalTrend', e.target.value)} className="nejm-input">
                          <option value="Stable">Stable</option>
                          <option value="Improving">Improving</option>
                          <option value="Worsening">Worsening / AKI</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="nejm-label">Hepatic Function</label>
                        <select value={data.hepaticFunction} onChange={(e) => handleChange('hepaticFunction', e.target.value)} className="nejm-input">
                          <option value="Normal">Normal</option>
                          <option value="Mild Impairment">Mild Impairment</option>
                          <option value="Moderate (Child-Pugh B)">Moderate (Child-Pugh B)</option>
                          <option value="Severe (Child-Pugh C)">Severe (Child-Pugh C)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vitals - Progressive Disclosure */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue flex items-center gap-2">
                        <Thermometer size={14} /> Physiological Data
                      </h4>
                      <button 
                        onClick={() => toggleSection('investigations')}
                        className="text-[9px] font-bold uppercase text-nejm-blue/60 hover:text-nejm-blue"
                      >
                        {expandedSections.investigations ? 'Hide Details' : 'Enter Vitals'}
                      </button>
                    </div>
                    {expandedSections.investigations ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="nejm-label">Temp</label>
                          <input type="number" name="temp" value={data.vitals.temp} onChange={handleVitalsChange} className="nejm-input py-1 text-sm" placeholder="38.5" />
                        </div>
                        <div>
                          <label className="nejm-label">HR</label>
                          <input type="number" name="hr" value={data.vitals.hr} onChange={handleVitalsChange} className="nejm-input py-1 text-sm" placeholder="110" />
                        </div>
                        <div>
                          <label className="nejm-label">RR</label>
                          <input type="number" name="rr" value={data.vitals.rr} onChange={handleVitalsChange} className="nejm-input py-1 text-sm" placeholder="24" />
                        </div>
                        <div>
                          <label className="nejm-label">SBP</label>
                          <input type="number" name="sbp" value={data.vitals.sbp} onChange={handleVitalsChange} className="nejm-input py-1 text-sm" placeholder="95" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-nejm-gray/5 border border-dashed border-nejm-border text-center">
                        <p className="text-[10px] text-nejm-text/40">Vitals are optional but improve precision.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-nejm-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="nejm-label flex items-center gap-2 text-nejm-red">
                      <AlertTriangle size={14} /> Medication Allergies
                    </label>
                    <input 
                      type="text" 
                      value={data.allergies} 
                      onChange={(e) => handleChange('allergies', e.target.value)} 
                      className="nejm-input border-nejm-red/20 focus:border-nejm-red/50" 
                      placeholder="e.g. Penicillin (Anaphylaxis)" 
                    />
                  </div>
                  <div>
                    <label className="nejm-label flex items-center gap-2 text-nejm-navy">
                      <History size={14} /> Current Antibiotics
                    </label>
                    <input 
                      type="text" 
                      value={data.currentAntibiotics || ''} 
                      onChange={(e) => handleChange('currentAntibiotics', e.target.value)} 
                      className="nejm-input" 
                      placeholder="e.g. Ceftriaxone 2g daily (Day 2)" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. COMORBIDITIES & RISK FACTORS */}
      <div className="space-y-4">
        <SectionHeader id="comorbidities" title="Relevant Comorbidities & Risk Factors" icon={ShieldAlert} />
        <AnimatePresence initial={false}>
          {expandedSections.comorbidities && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white border-x border-b border-nejm-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'mdrRisk', label: 'History of MDR Pathogen', desc: 'Prior MRSA, VRE, or ESBL' },
                    { id: 'recentHospitalization', label: 'Recent Hospitalization', desc: 'Within last 90 days' },
                    { id: 'priorAntibiotics', label: 'Prior Antibiotic Use', desc: 'Broad-spectrum in last 90 days' },
                    { id: 'immunocompromised', label: 'Immunocompromised', desc: 'Chemo, steroids, transplant' },
                    { id: 'indwellingDevices', label: 'Indwelling Devices', desc: 'CVC, Foley, EVD' },
                    { id: 'neutropeniaStatus', label: 'Neutropenia', desc: 'ANC < 500 cells/mm³' }
                  ].map(factor => (
                    <button
                      key={factor.id}
                      onClick={() => handleChange(factor.id, data[factor.id as keyof PatientData] === 'Yes' ? 'No' : 'Yes')}
                      className={`flex justify-between items-center p-3 border transition-all text-left ${
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
                      <div className={`w-8 h-5 rounded-full relative transition-colors ${data[factor.id as keyof PatientData] === 'Yes' ? 'bg-nejm-red' : 'bg-nejm-border'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${data[factor.id as keyof PatientData] === 'Yes' ? 'left-3.5' : 'left-0.5'}`}></div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Conditional Questions */}
                {data.sex !== 'Male' && (
                  <div className="pt-4 border-t border-nejm-border/50 animate-in fade-in slide-in-from-top-2">
                    <label className="nejm-label">Pregnancy Status</label>
                    <div className="flex gap-4">
                      {['No', 'Yes', 'N/A'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleChange('pregnancyStatus', status)}
                          className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            data.pregnancyStatus === status 
                              ? 'bg-nejm-blue border-nejm-blue text-white' 
                              : 'bg-white border-nejm-border text-nejm-text hover:border-nejm-blue/30'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <label className="nejm-label">Other Relevant Comorbidities</label>
                  <textarea 
                    value={data.comorbidities} 
                    onChange={(e) => handleChange('comorbidities', e.target.value)}
                    className="nejm-input min-h-[80px]"
                    placeholder="e.g. DM Type 2, HFpEF, COPD..."
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. OPTIONAL DETAILS */}
      <div className="space-y-4">
        <SectionHeader id="optional" title="Additional Clinical Details (Optional)" icon={ClipboardList} />
        <AnimatePresence initial={false}>
          {expandedSections.optional && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white border-x border-b border-nejm-border space-y-4">
                <div>
                  <label className="nejm-label">Prior Antibiotic Details</label>
                  <input type="text" value={data.priorAntibioticsDetails} onChange={(e) => handleChange('priorAntibioticsDetails', e.target.value)} className="nejm-input" placeholder="e.g. Augmentin 5 days ago" />
                </div>
                <div>
                  <label className="nejm-label">History of MDR Pathogens (Details)</label>
                  <input type="text" value={data.mdrHistory} onChange={(e) => handleChange('mdrHistory', e.target.value)} className="nejm-input" placeholder="e.g. ESBL E.coli in urine (2023)" />
                </div>
                <div>
                  <label className="nejm-label">Recent Travel History</label>
                  <button
                    onClick={() => handleChange('travelHistory', data.travelHistory === 'Yes' ? 'No' : 'Yes')}
                    className={`flex justify-between items-center w-full p-3 border transition-all text-left ${
                      data.travelHistory === 'Yes' ? 'bg-nejm-red/5 border-nejm-red/30' : 'bg-white border-nejm-border'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">International Travel in last 6 months</span>
                    <div className={`w-8 h-5 rounded-full relative transition-colors ${data.travelHistory === 'Yes' ? 'bg-nejm-red' : 'bg-nejm-border'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${data.travelHistory === 'Yes' ? 'left-3.5' : 'left-0.5'}`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="max-w-5xl w-full px-8 pointer-events-auto">
          <div className="bg-white border border-nejm-border shadow-2xl p-4 flex items-center justify-between gap-6 backdrop-blur-md bg-white/90">
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${missingFields.length === 0 ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-nejm-navy">
                  {missingFields.length === 0 ? 'Clinical Data Complete' : `${missingFields.length} Mandatory fields remaining`}
                </p>
              </div>
              <p className="text-[9px] text-nejm-text/40 mt-0.5">
                {missingFields.length === 0 ? 'Ready for high-precision analysis.' : 'Basic analysis available with current data.'}
              </p>
            </div>

            <div className="flex gap-3 ml-auto">
              <button 
                onClick={handleAnalyze}
                className="nejm-btn bg-nejm-navy text-white px-8 py-3 flex items-center gap-2 shadow-lg shadow-nejm-navy/20 active:scale-95 transition-transform"
              >
                ANALYZE WITH MEDWISE <Search size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      <AnimatePresence>
        {showValidationWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-nejm-navy/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-nejm-border shadow-2xl max-w-md w-full p-8"
            >
              <div className="flex items-center gap-4 text-nejm-red mb-6">
                <AlertCircle size={32} />
                <h3 className="text-xl font-serif font-bold">Missing Clinical Data</h3>
              </div>
              
              <p className="text-sm text-nejm-text/70 mb-6 leading-relaxed">
                The following mandatory variables are missing. Proceeding may reduce the precision of the clinical recommendation:
              </p>
              
              <ul className="space-y-2 mb-8">
                {missingFields.map(f => (
                  <li key={f.key} className="flex items-center gap-2 text-xs font-bold text-nejm-navy">
                    <ChevronRight size={14} className="text-nejm-red" /> {f.label}
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowValidationWarning(false)}
                  className="w-full py-3 border border-nejm-navy text-nejm-navy text-xs font-bold uppercase tracking-widest hover:bg-nejm-gray/5 transition-colors"
                >
                  Return & Add Missing Data
                </button>
                <button 
                  onClick={() => { setShowValidationWarning(false); onNext(); }}
                  className="w-full py-3 bg-nejm-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-nejm-navy/90 transition-colors"
                >
                  Analyze with Available Data
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
