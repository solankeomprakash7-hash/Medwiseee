import * as React from 'react';
import { PatientData, AnalysisResult, Recommendation } from '../../types';
import { analyzeSepsisTherapy } from '../../services/geminiService';
import { GeminiError } from '../../lib/gemini';
import { AlertCircle, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, ShieldCheck, ShieldX, Sparkles, TrendingUp, Download, Save, FileText, Zap, ChevronDown, ChevronUp, MapPin, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SpectrumFitCard from '../SpectrumFitCard';
import StewardshipOpportunitiesCard from '../StewardshipOpportunitiesCard';
import SmartChoiceSection from '../SmartChoiceSection';
import PKPDFitCard from '../PKPDFitCard';
import SitePenetrationCard from '../SitePenetrationCard';
import CoverageSpectrumCard from '../CoverageSpectrumCard';
import SideEffectsCard from '../SideEffectsCard';

interface Stage5Props {
  data: PatientData;
  onUpdate: (result: AnalysisResult) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Stage5_Recommendation({ data, onUpdate, onNext, onBack }: Stage5Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<{ message: string, type: string } | null>(null);
  const [result, setResult] = React.useState<AnalysisResult | null>(data.analysisResult || null);
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [isReasoningExpanded, setIsReasoningExpanded] = React.useState(false);
  const requestCountRef = React.useRef(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const performAnalysis = async () => {
    const requestId = ++requestCountRef.current;
    setLoading(true);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New analysis started');
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await analyzeSepsisTherapy(data, { 
        signal: controller.signal 
      });
      
      if (requestId === requestCountRef.current) {
        setResult(res);
        onUpdate(res);
      }
    } catch (err: any) {
      if (requestId !== requestCountRef.current) return;
      if (err instanceof Error && (err.name === 'AbortError' || (err as any).type === 'ABORTED')) return;
      
      console.error('Analysis failed:', err);
      
      if (err instanceof GeminiError) {
        let message = '';
        switch (err.type) {
          case 'RATE_LIMIT': message = 'Service busy. Please retry.'; break;
          case 'INVALID_KEY': message = 'API Key error.'; break;
          default: message = err.message || 'Analysis failed.';
        }
        setError({ message, type: err.type });
      } else {
        setError({ message: err.message || 'System error.', type: 'SYSTEM_ERROR' });
      }
    } finally {
      if (requestId === requestCountRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const savePatientRecord = async () => {
    if (!auth.currentUser || !result) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'patient_sessions'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: Date.now(),
        serverTimestamp: serverTimestamp(),
        currentStage: 'recommendation',
        completed: true,
        data: { ...data, analysisResult: result }
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const pdfOnlyElements = element.querySelectorAll('.pdf-only') as NodeListOf<HTMLElement>;
    pdfOnlyElements.forEach(el => el.style.display = 'flex');
    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
      pdf.save(`MedWise-Rec-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert('PDF export failed.');
    } finally {
      pdfOnlyElements.forEach(el => el.style.display = '');
    }
  };

  React.useEffect(() => {
    if (!result) performAnalysis();
    else setLoading(false);
    return () => abortControllerRef.current?.abort('Unmounted');
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <Loader2 className="w-12 h-12 text-nejm-blue animate-spin" />
        <div className="text-center">
          <p className="text-lg font-serif font-bold text-nejm-navy">Synthesizing Clinical Intelligence</p>
          <p className="text-sm text-nejm-text/50 italic">Performing internal duplication check & anti-repetition filter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 px-4">
        <AlertCircle className="w-12 h-12 text-nejm-red" />
        <div className="text-center max-w-md">
          <p className="text-xl font-serif font-bold text-nejm-navy mb-2">Analysis Failed</p>
          <p className="text-sm text-nejm-text/70 mb-6">{error.message}</p>
          <button onClick={performAnalysis} className="nejm-btn">Retry Analysis</button>
        </div>
      </div>
    );
  }

  const primaryRec = result?.empiric_recommendation[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
      {/* TOOLBAR */}
      <div className="flex justify-between items-center bg-white border border-nejm-border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-nejm-navy"></div>
          <div>
            <h2 className="text-sm font-serif font-bold text-nejm-navy">Patient Recommendation Output</h2>
            <p className="text-[10px] text-nejm-text/50 uppercase tracking-widest">Target Pathogen: {data.confirmedOrganism || 'Empiric Coverage Requested'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1.5 border border-nejm-border text-[9px] font-bold uppercase tracking-widest text-nejm-text hover:bg-nejm-gray transition-colors">
            <Download size={14} /> PDF
          </button>
          <button onClick={savePatientRecord} disabled={saving} className="flex items-center gap-2 px-3 py-1.5 bg-nejm-navy text-white text-[9px] font-bold uppercase tracking-widest hover:bg-nejm-navy/90 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {saveStatus === 'success' ? 'Saved' : 'Save Record'}
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8 bg-white p-1">
        <div className="hidden pdf-only flex justify-between items-center border-b border-nejm-navy/10 pb-4 mb-4">
           <h1 className="text-xl font-serif font-bold text-nejm-navy">MedWise CDSS Clinical Report</h1>
           <p className="text-[10px] text-nejm-text/50">{new Date().toLocaleString()}</p>
        </div>

        {/* 0. CLINICAL CONTEXT SUMMARY */}
        <section className="bg-nejm-gray/5 border border-nejm-border p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
              <p className="text-[8px] font-bold uppercase text-nejm-text/40 mb-1">Infection Source(s)</p>
              <p className="text-[10px] font-bold text-nejm-navy">{(data.infectionSources || []).join(', ') || 'Unknown'}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold uppercase text-nejm-text/40 mb-1">Severity</p>
              <p className="text-[10px] font-bold text-nejm-navy">{data.diagnosis}</p>
           </div>
           <div>
              <p className="text-[8px] font-bold uppercase text-nejm-text/40 mb-1">Renal Function</p>
              <p className="text-[10px] font-bold text-nejm-navy">{data.renalFunction} ({data.renalTrend})</p>
           </div>
           <div>
              <p className="text-[8px] font-bold uppercase text-nejm-text/40 mb-1">Patient Context</p>
              <p className="text-[10px] font-bold text-nejm-navy">{data.age}y {data.sex} • {data.weight}kg</p>
           </div>
        </section>

        {/* 1. RECOMMENDATIONS (PRIMARY DISCLOSURE) */}
        <section className="bg-white border-2 border-nejm-navy shadow-lg overflow-hidden ring-4 ring-nejm-navy/5">
           {(result?.empiric_recommendation || []).map((rec, idx) => (
             <div key={idx} className={`p-8 border-b border-nejm-border ${idx % 2 === 0 ? 'bg-nejm-gray/5' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-nejm-text/40 mb-3 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-nejm-navy" /> {idx === 0 ? '1. RECOMMENDED ANTIBIOTIC' : `CONCOMITANT AGENT ${idx + 1}`}
                    </h3>
                    <h2 className="text-5xl font-serif font-bold text-nejm-navy tracking-tight">
                      {rec.antibiotic}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white mb-3 shadow-sm ${
                      rec.main_action === 'Start' ? 'bg-green-600' :
                      rec.main_action === 'De-escalate' ? 'bg-nejm-blue' :
                      rec.main_action === 'Stop' ? 'bg-nejm-red' :
                      'bg-nejm-navy'
                    }`}>
                      ACTION: {rec.main_action || 'START'}
                    </div>
                    {idx === 0 && (
                      <>
                        <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">MedWise Confidence</p>
                        <div className="text-3xl font-serif font-bold text-nejm-navy">{result?.confidenceScore}%</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 tracking-wider">Dose</p>
                    <p className="text-base font-bold text-nejm-navy uppercase">{rec.dose}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 tracking-wider">Route & Frequency</p>
                    <p className="text-base font-bold text-nejm-navy uppercase">{rec.route} {rec.frequency}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 tracking-wider">Infusion Strategy</p>
                    <p className="text-xs font-serif font-bold text-nejm-navy leading-tight">{rec.infusion}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 tracking-wider">Duration / Review</p>
                    <p className="text-xs font-serif italic text-nejm-navy font-bold">{rec.duration}</p>
                  </div>
                </div>
             </div>
           ))}

           {/* 2. WHY THIS CHOICE */}
           {result && <SmartChoiceSection result={result} />}
        </section>

        {/* 3. SPECTRUM FIT */}
        {result && <SpectrumFitCard result={result} />}

        {/* 4. HOW TO ADMINISTER / PK-PD */}
        {result && <PKPDFitCard result={result} />}

        {/* 5. TISSUE / SITE PENETRATION */}
        {result && <SitePenetrationCard result={result} sources={data.infectionSources} />}

        {/* 6. SIDE EFFECTS & INTERACTIONS TO WATCH */}
        {result && <SideEffectsCard result={result} />}

        {/* 7. STEWARDSHIP OPPORTUNITIES */}
        {result && <StewardshipOpportunitiesCard result={result} />}

        {/* 8. DETAILED CLINICAL REASONING */}
        <section className="bg-white border border-nejm-border shadow-sm">
          <button 
            onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            className="w-full p-6 flex justify-between items-center hover:bg-nejm-gray/5 transition-colors"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-nejm-navy flex items-center gap-2">
              <FileText size={14} className="text-nejm-blue" /> 8. Detailed Clinical Reasoning
            </h3>
            {isReasoningExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {isReasoningExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 pt-0 border-t border-nejm-border bg-nejm-gray/5">
                  <div className="mt-8 text-sm leading-relaxed text-nejm-text/80 whitespace-pre-wrap font-serif space-y-6">
                    {result?.clinical_reasoning}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 9. EVIDENCE */}
        <section className="bg-white border border-nejm-border p-8 shadow-sm">
           <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-nejm-navy flex items-center gap-2 mb-6">
              <BookOpen size={14} className="text-nejm-blue" /> 9. Evidence Base & Citations
           </h3>
           <div className="space-y-4">
              {(result?.empiric_recommendation || []).map((rec, idx) => (
                <div key={idx} className="p-4 bg-nejm-gray/5 border border-nejm-border">
                  <p className="text-[10px] font-bold uppercase text-nejm-text/40 mb-2">Supporting Evidence: {rec.antibiotic}</p>
                  <p className="text-sm font-serif italic text-nejm-navy leading-relaxed">{rec.evidenceLevel}: {rec.citation}</p>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white border border-nejm-border">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Local Context</p>
                    <p className="text-[10px] text-nejm-text/60 italic">{data.localAntibiogram ? 'Recommendation informed by local antibiogram.' : 'Local susceptibility data unavailable.'}</p>
                 </div>
                 <div className="p-4 bg-white border border-nejm-border">
                    <p className="text-[9px] font-bold uppercase text-nejm-text/40 mb-1">Pharmacological Support</p>
                    <p className="text-[10px] text-nejm-text/60 italic">Based on standard PK/PD models for identified focus.</p>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-2 border border-nejm-border text-xs font-bold uppercase tracking-widest hover:bg-nejm-gray transition-colors">
            New Session
          </button>
          <button onClick={onNext} className="nejm-btn flex items-center gap-2">
            View Stewardship Timeline <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
