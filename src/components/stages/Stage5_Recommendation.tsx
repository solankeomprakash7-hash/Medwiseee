import * as React from 'react';
import { PatientData, AnalysisResult, Recommendation } from '../../types';
import { analyzeSepsisTherapy } from '../../services/geminiService';
import { GeminiError } from '../../lib/gemini';
import { AlertCircle, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, ShieldCheck, ShieldX, Sparkles, TrendingUp, Download, Save, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
  const requestCountRef = React.useRef(0);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);

  const performAnalysis = async () => {
    const requestId = ++requestCountRef.current;
    setLoading(true);
    setError(null);
    
    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New analysis started');
    }
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await analyzeSepsisTherapy(data, { 
        signal: controller.signal 
      });
      
      // Only update if this is still the active request
      if (requestId === requestCountRef.current) {
        setResult(res);
        onUpdate(res);
      }
    } catch (err: any) {
      // Only handle error if this is still the active request
      if (requestId !== requestCountRef.current) return;

      if (err instanceof Error && (err.name === 'AbortError' || (err as any).type === 'ABORTED')) {
        console.log('Analysis aborted:', err.message);
        return;
      }
      
      console.error('Analysis failed:', err);
      
      if (err instanceof GeminiError) {
        let message = '';
        switch (err.type) {
          case 'RATE_LIMIT':
            message = 'The AI service is currently busy. Please wait a moment and try again.';
            break;
          case 'INVALID_KEY':
            message = 'Authentication error with the AI service. Please verify configuration.';
            break;
          case 'NETWORK_ERROR':
            message = 'Network connection failure. Please check your internet and try again.';
            break;
          case 'MODEL_ERROR':
            message = 'The AI provided an incompatible response format. Retrying may help.';
            break;
          case 'ABORTED':
            return; // Already handled above but for safety
          default:
            message = err.message || 'An unexpected error occurred during clinical analysis.';
        }
        setError({ message, type: err.type });
      } else {
        setError({ 
          message: err.message || 'Analysis failed due to an unexpected system error. Please retry.', 
          type: 'UNKNOWN' 
        });
      }
    } finally {
      // Only clear loading state if this was the last request
      if (requestId === requestCountRef.current) {
        setLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const savePatientRecord = async () => {
    if (!auth.currentUser || !result) return;
    
    setSaving(true);
    setSaveStatus('idle');
    try {
      await addDoc(collection(db, 'patient_sessions'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: Date.now(),
        serverTimestamp: serverTimestamp(),
        currentStage: 'recommendation',
        completed: true,
        data: {
          ...data,
          analysisResult: result
        }
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving record:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    // Create a temporary style adjustment for PDF capture
    const element = reportRef.current;
    const pdfOnlyElements = element.querySelectorAll('.pdf-only') as NodeListOf<HTMLElement>;
    
    // Show PDF only elements
    pdfOnlyElements.forEach(el => {
      el.style.display = 'flex';
    });
    
    try {
      // Use html-to-image to generate a high-quality PNG
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          margin: '0',
          padding: '20px'
        }
      });
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [img.width / 2, img.height / 2]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
      pdf.save(`MedWise-Recommendation-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      // Restore hidden state
      pdfOnlyElements.forEach(el => {
        el.style.display = '';
      });
    }
  };

  React.useEffect(() => {
    if (!result) {
      performAnalysis();
    } else {
      setLoading(false);
    }

    return () => {
      // Cleanup: abort any ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <Loader2 className="w-12 h-12 text-nejm-blue animate-spin" />
        <div className="text-center">
          <p className="text-lg font-serif font-bold text-nejm-navy">Synthesizing Clinical Intelligence</p>
          <p className="text-sm text-nejm-text/50 italic">Cross-referencing SSC 2026, IDSA guidelines, and local antibiograms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 px-4">
        <div className="p-3 bg-nejm-red/10 rounded-full">
          <AlertCircle className="w-10 h-10 text-nejm-red" />
        </div>
        <div className="text-center max-w-md">
          <p className="text-xl font-serif font-bold text-nejm-navy mb-2">Analysis Failed</p>
          <div className="p-4 bg-nejm-gray/5 border border-nejm-border mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-nejm-text/40 mb-1">Error Type: {error.type}</p>
            <p className="text-sm text-nejm-text/70">{error.message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onBack} className="px-6 py-2 border border-nejm-border text-xs font-bold uppercase tracking-widest hover:bg-nejm-gray/10 transition-colors">
              Return to Data Entry
            </button>
            <button onClick={performAnalysis} className="nejm-btn">
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="nejm-header">
          <h2 className="text-2xl font-serif font-bold">Stage 5: Empiric Recommendations</h2>
          <p className="text-sm text-nejm-text/70 mt-1">AI-augmented stewardship guidance based on host risk and local ecology.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-nejm-blue/10 border border-nejm-blue/20">
            <TrendingUp size={14} className="text-nejm-blue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue">Confidence: {result?.confidenceScore}%</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 px-3 py-2 border border-nejm-border bg-white text-[10px] font-bold uppercase tracking-widest text-nejm-text hover:bg-nejm-gray transition-colors"
              title="Export as PDF"
            >
              <Download size={14} /> PDF
            </button>
            <button 
              onClick={savePatientRecord}
              disabled={saving || saveStatus === 'success'}
              className={`flex items-center gap-2 px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                saveStatus === 'success' 
                ? 'bg-green-600 border-green-600 text-white' 
                : 'border-nejm-border bg-white text-nejm-text hover:bg-nejm-gray'
              }`}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {saveStatus === 'success' ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div ref={reportRef} className="space-y-8 bg-white p-2">
        <div className="hidden pdf-only flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h1 className="text-xl font-serif font-bold text-nejm-navy">MedWise AI Recommendation</h1>
            <p className="text-[10px] uppercase tracking-widest text-nejm-text/50">Generated on {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-nejm-blue uppercase">Confidential Patient Report</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Executive Summary */}
          <div className="lg:col-span-4 space-y-6">
            <section className="p-6 bg-white border border-nejm-border shadow-sm">
              <h3 className="nejm-section-title mb-4">Executive Summary</h3>
              <p className="text-sm leading-relaxed text-nejm-text/80 font-serif italic">
                "{result?.summary}"
              </p>
            </section>

            <section className="p-6 bg-nejm-navy text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-4">Clinical Reasoning</h3>
              <p className="text-xs leading-relaxed opacity-90">
                {result?.clinical_reasoning}
              </p>
            </section>
            
            <div className="p-4 bg-nejm-gray/10 border border-nejm-border/30">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2 flex items-center gap-2">
                <Sparkles size={12} /> Stewardship Note
              </h4>
              <p className="text-[10px] text-nejm-text/60 italic leading-relaxed">
                {result?.safety_stewardship}
              </p>
            </div>

            <div className="p-4 border border-nejm-border bg-nejm-gray/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-3">Patient Profile Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-nejm-text/40">Diagnosis:</span>
                  <span className="font-bold text-nejm-text/70">{data.diagnosis}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-nejm-text/40">Source:</span>
                  <span className="font-bold text-nejm-text/70">{data.infectionSource}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-nejm-text/40">Risk Factors:</span>
                  <span className="font-bold text-nejm-text/70">{data.mdrRisk === 'Yes' ? 'MDR Risk' : 'Standard Risk'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recommendation Cards */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="nejm-section-title">Priority Empiric Regimens</h3>
            {result?.empiric_recommendation.map((rec, idx) => (
              <RecommendationCard key={idx} rec={rec} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-nejm-border">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase text-nejm-text/60 hover:text-nejm-blue transition-colors">
          <ChevronLeft size={16} /> Back to Antibiogram
        </button>
        <button 
          onClick={onNext}
          className="nejm-btn flex items-center gap-2"
        >
          Proceed to Timeline <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = React.useState(false);

  const awareColors = {
    'Access': 'bg-green-100 text-green-800 border-green-200',
    'Watch': 'bg-amber-100 text-amber-800 border-amber-200',
    'Reserve': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="bg-white border border-nejm-border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 border-b border-nejm-border flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-xl font-serif font-bold text-nejm-navy">{rec.antibiotic}</h4>
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded-full ${awareColors[rec.awareTag]}`}>
              {rec.awareTag}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-mono font-bold text-nejm-blue">{rec.dose}</p>
            <div className="h-4 w-[1px] bg-nejm-border"></div>
            <p className="text-[10px] text-nejm-text/50 italic flex items-center gap-1">
              <BookOpen size={12} /> {rec.evidenceLevel}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase text-nejm-text/40 mb-1">Target Match</div>
          <div className="text-lg font-bold font-mono text-nejm-blue">{rec.confidenceScore}%</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-nejm-gray/5">
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-green-600" /> Spectrum Covered
          </h5>
          <p className="text-[11px] text-nejm-text/80 leading-relaxed mb-4">{rec.spectrumCovered}</p>
          
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-3 flex items-center gap-2">
            <ShieldX size={14} className="text-red-600" /> Major Gaps
          </h5>
          <p className="text-[11px] text-nejm-text/80 leading-relaxed">{rec.spectrumNotCovered}</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white p-4 border border-nejm-border/50">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue mb-2">Host Reasoning</h5>
            <p className="text-[11px] text-nejm-text/70 leading-relaxed italic">{rec.reasoning}</p>
          </div>
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2 border border-nejm-border text-[9px] font-bold uppercase tracking-widest text-nejm-text/50 hover:bg-white transition-colors"
          >
            {expanded ? 'Hide Advanced Details' : 'Show Advanced Details'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-6 border-t border-nejm-border space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2">When NOT to use</h5>
                  <p className="text-[11px] text-nejm-red/80 font-medium">{rec.whenNotToUse}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-nejm-text/50 mb-2">Alternative Agents</h5>
                  <div className="flex flex-wrap gap-2">
                    {rec.alternatives.map((alt, i) => (
                      <span key={i} className="px-2 py-1 bg-nejm-gray/10 text-[10px] text-nejm-text/70">{alt}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-nejm-border/30">
                <p className="text-[9px] text-nejm-text/30 italic">Citation: {rec.citation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
