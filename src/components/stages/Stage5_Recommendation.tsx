import * as React from 'react';
import { PatientData, AnalysisResult, Recommendation } from '../../types';
import { analyzeSepsisTherapy } from '../../services/geminiService';
import { GeminiError } from '../../lib/gemini';
import { AlertCircle, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, ShieldCheck, ShieldX, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const performAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const res = await analyzeSepsisTherapy(data, { 
        signal: abortControllerRef.current.signal 
      });
      setResult(res);
      onUpdate(res);
    } catch (err) {
      console.error(err);
      if (err instanceof GeminiError) {
        let message = '';
        switch (err.type) {
          case 'RATE_LIMIT':
            message = 'The service is temporarily overloaded. Please try again in a few moments.';
            break;
          case 'INVALID_KEY':
            message = 'API Configuration Error: The Gemini API key is missing or invalid.';
            break;
          case 'NETWORK_ERROR':
            message = 'Network connection failure. Please check your internet and try again.';
            break;
          case 'MODEL_ERROR':
            message = 'The AI provided an incompatible response format. Retrying may help.';
            break;
          case 'ABORTED':
            message = 'Analysis was cancelled.';
            break;
          default:
            message = err.message || 'An unexpected error occurred during clinical analysis.';
        }
        setError({ message, type: err.type });
      } else {
        setError({ 
          message: 'Analysis failed due to an unexpected system error. Please retry.', 
          type: 'UNKNOWN' 
        });
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
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
        abortControllerRef.current.abort();
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
          <p className="text-xl font-serif font-bold text-nejm-navy mb-2">Analysis Interrupted</p>
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
      <div className="flex justify-between items-start">
        <div className="nejm-header">
          <h2 className="text-2xl font-serif font-bold">Stage 5: Empiric Recommendations</h2>
          <p className="text-sm text-nejm-text/70 mt-1">AI-augmented stewardship guidance based on host risk and local ecology.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-nejm-blue/10 border border-nejm-blue/20">
          <TrendingUp size={14} className="text-nejm-blue" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-nejm-blue">Confidence: {result?.confidenceScore}%</span>
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
        </div>

        {/* Right: Recommendation Cards */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="nejm-section-title">Priority Empiric Regimens</h3>
          {result?.empiric_recommendation.map((rec, idx) => (
            <RecommendationCard key={idx} rec={rec} />
          ))}
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
