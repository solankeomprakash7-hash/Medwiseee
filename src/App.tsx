import * as React from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import AuthScreen from './components/AuthScreen';
import { Stage, PatientData, Scores, Vitals, AnalysisResult } from './types';
import ProgressTracker from './components/ProgressTracker';
import ClinicalInput from './components/stages/ClinicalInput';
import Stage5_Recommendation from './components/stages/Stage5_Recommendation';
import Stage6_Timeline from './components/stages/Stage6_Timeline';
import { LogOut, Stethoscope, User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const INITIAL_PATIENT_DATA: PatientData = {
  vitals: { temp: '', hr: '', rr: '', sbp: '', dbp: '', gcs: '', wbc: '' },
  scores: { qsofa: 0, sofa: 0, news2: 0, sepsisCriteriaMet: false },
  diagnosis: 'Sepsis',
  infectionSources: [],
  setting: 'Community',
  age: '',
  sex: 'Male',
  weight: '',
  icuDay: '0',
  renalFunction: '',
  hepaticFunction: 'Normal',
  pregnancyStatus: 'No',
  transplantStatus: 'No',
  neutropeniaStatus: 'No',
  sourceControl: 'Unknown',
  microbiologyStatus: 'No microbiology',
  mdrRisk: 'No',
  mdrHistory: '',
  recentHospitalization: 'No',
  priorAntibiotics: 'No',
  priorAntibioticsDetails: '',
  immunocompromised: 'No',
  indwellingDevices: 'No',
  travelHistory: 'No',
  comorbidities: '',
  allergies: '',
  timelineEvents: []
};

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentStage, setCurrentStage] = React.useState<Stage>(Stage.INPUT);
  const [completedStages, setCompletedStages] = React.useState<Stage[]>([]);
  const [patientData, setPatientData] = React.useState<PatientData>(INITIAL_PATIENT_DATA);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStageComplete = (stage: Stage) => {
    if (!completedStages.includes(stage)) {
      setCompletedStages([...completedStages, stage]);
    }
  };

  const nextStage = () => {
    handleStageComplete(currentStage);
    const stages = Object.values(Stage);
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1]);
    }
  };

  const prevStage = () => {
    const stages = Object.values(Stage);
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex > 0) {
      setCurrentStage(stages[currentIndex - 1]);
    }
  };

  const updatePatientData = (newData: Partial<PatientData>) => {
    setPatientData(prev => ({ ...prev, ...newData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-nejm-cream flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 text-nejm-blue animate-pulse mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-nejm-text/40">Initializing MedWise...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-nejm-cream">
      {/* Sidebar Progress Tracker */}
      <ProgressTracker 
        currentStage={currentStage} 
        completedStages={completedStages} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-nejm-border px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nejm-navy text-white flex items-center justify-center">
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-nejm-navy leading-none">MedWise</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-nejm-text/30 mt-1">Sepsis Precision Decision Support</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 text-right">
              <div>
                <p className="text-[10px] font-bold text-nejm-navy">{user.displayName || 'Clinician'}</p>
                <p className="text-[9px] text-nejm-text/40 uppercase tracking-tighter">Verified Provider</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-nejm-blue/10 flex items-center justify-center text-nejm-blue border border-nejm-blue/20">
                <UserIcon size={16} />
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="text-nejm-text/40 hover:text-nejm-red transition-colors p-2"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Stage Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStage === Stage.INPUT && (
                  <ClinicalInput 
                    data={patientData} 
                    onUpdate={updatePatientData} 
                    onNext={nextStage} 
                  />
                )}
                {currentStage === Stage.RECOMMENDATION && (
                  <Stage5_Recommendation 
                    data={patientData} 
                    onUpdate={(res) => updatePatientData({ analysisResult: res })} 
                    onNext={nextStage}
                    onBack={prevStage}
                  />
                )}
                {currentStage === Stage.TIMELINE && (
                  <Stage6_Timeline 
                    data={patientData} 
                    onUpdate={updatePatientData} 
                    onBack={prevStage}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Global Footer (Session Meta) */}
        <footer className="h-10 bg-nejm-navy text-white/40 px-8 flex justify-between items-center text-[9px] uppercase tracking-widest shrink-0">
          <div className="flex items-center gap-4">
            <span>Session ID: {auth.currentUser?.uid.slice(0, 8)}...</span>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <span>Status: {completedStages.length === 6 ? 'Clinical Pathway Complete' : 'Active Assessment'}</span>
          </div>
          <div className="italic opacity-60">MedWise — Confidential Clinical Data System</div>
        </footer>
      </main>
    </div>
  );
}
