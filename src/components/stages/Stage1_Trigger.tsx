import * as React from 'react';
import { Vitals, Scores } from '../../types';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Stage1Props {
  vitals: Vitals;
  onUpdate: (vitals: Vitals, scores: Scores) => void;
  onNext: () => void;
}

export default function Stage1_Trigger({ vitals, onUpdate, onNext }: Stage1Props) {
  const calculateScores = (v: Vitals): Scores => {
    // Simplified qSOFA
    let qsofa = 0;
    if (parseFloat(v.rr) >= 22) qsofa++;
    if (parseFloat(v.sbp) <= 100) qsofa++;
    if (parseFloat(v.gcs) < 15) qsofa++;

    // Simplified NEWS2 (just a few components for demo)
    let news2 = 0;
    const rr = parseFloat(v.rr);
    if (rr >= 25 || rr <= 8) news2 += 3;
    else if (rr >= 21 || rr <= 11) news2 += 2;
    
    const sbp = parseFloat(v.sbp);
    if (sbp <= 90) news2 += 3;
    else if (sbp <= 100) news2 += 2;
    else if (sbp <= 110) news2 += 1;

    // Sepsis Criteria Met? (Simplified: qSOFA >= 2)
    const sepsisCriteriaMet = qsofa >= 2;

    return {
      qsofa,
      sofa: qsofa * 2, // Mock SOFA for now
      news2,
      sepsisCriteriaMet
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextVitals = { ...vitals, [name]: value };
    const nextScores = calculateScores(nextVitals);
    onUpdate(nextVitals, nextScores);
  };

  const scores = calculateScores(vitals);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="nejm-header">
        <h2 className="text-2xl font-serif font-bold">Stage 1: Trigger & Recognition</h2>
        <p className="text-sm text-nejm-text/70 mt-1">Screening for sepsis and physiological deterioration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vitals Input */}
        <div className="space-y-6">
          <h3 className="nejm-section-title">Physical Parameters</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="nejm-label">Temperature (°C)</label>
              <input type="number" name="temp" value={vitals.temp} onChange={handleChange} className="nejm-input" step="0.1" placeholder="38.5" />
            </div>
            <div>
              <label className="nejm-label">Heart Rate (bpm)</label>
              <input type="number" name="hr" value={vitals.hr} onChange={handleChange} className="nejm-input" placeholder="110" />
            </div>
            <div>
              <label className="nejm-label">Resp Rate (bpm)</label>
              <input type="number" name="rr" value={vitals.rr} onChange={handleChange} className="nejm-input" placeholder="24" />
            </div>
            <div>
              <label className="nejm-label">GCS</label>
              <input type="number" name="gcs" value={vitals.gcs} onChange={handleChange} className="nejm-input" min="3" max="15" placeholder="14" />
            </div>
            <div>
              <label className="nejm-label">Systolic BP (mmHg)</label>
              <input type="number" name="sbp" value={vitals.sbp} onChange={handleChange} className="nejm-input" placeholder="95" />
            </div>
            <div>
              <label className="nejm-label">WBC (x10⁹/L)</label>
              <input type="number" name="wbc" value={vitals.wbc} onChange={handleChange} className="nejm-input" step="0.1" placeholder="18.2" />
            </div>
          </div>
        </div>

        {/* Scoring Panel */}
        <div className="space-y-6">
          <h3 className="nejm-section-title">Automated Risk Scoring</h3>
          <div className="space-y-4">
            {[
              { label: 'qSOFA', value: scores.qsofa, threshold: 2, desc: 'Quick Sequential Organ Failure Assessment' },
              { label: 'NEWS2', value: scores.news2, threshold: 5, desc: 'National Early Warning Score' },
              { label: 'SOFA', value: scores.sofa, threshold: 2, desc: 'Sequential Organ Failure Assessment' }
            ].map(score => (
              <div key={score.label} className={`p-4 border ${score.value >= score.threshold ? 'bg-red-50 border-nejm-red/20' : 'bg-white border-nejm-border'} transition-colors`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-nejm-text/60">{score.label}</span>
                  <span className={`text-xl font-bold font-mono ${score.value >= score.threshold ? 'text-nejm-red' : 'text-nejm-blue'}`}>{score.value}</span>
                </div>
                <p className="text-[10px] text-nejm-text/40">{score.desc}</p>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {scores.sepsisCriteriaMet && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-nejm-red text-white flex items-center gap-3 shadow-lg shadow-nejm-red/20"
              >
                <AlertCircle size={24} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Sepsis Recognition High</p>
                  <p className="text-[10px] opacity-80 italic">qSOFA ≥ 2. Initiate sepsis protocols and stratification immediately.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-nejm-border">
        <button 
          onClick={onNext}
          disabled={!scores.sepsisCriteriaMet && vitals.sbp === ''}
          className={`nejm-btn flex items-center gap-2 ${!scores.sepsisCriteriaMet ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {scores.sepsisCriteriaMet ? (
            <>Proceed to Stratification <CheckCircle2 size={16} /></>
          ) : (
            <>Physiological Data Required</>
          )}
        </button>
      </div>
    </div>
  );
}
