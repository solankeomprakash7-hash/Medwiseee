import { User as FirebaseUser } from 'firebase/auth';

export enum Stage {
  TRIGGER = 'trigger',
  STRATIFICATION = 'stratification',
  RISK_LAYERING = 'risk_layering',
  ANTIBIOGRAM = 'antibiogram',
  RECOMMENDATION = 'recommendation',
  TIMELINE = 'timeline'
}

export interface Vitals {
  temp: string;
  hr: string;
  rr: string;
  sbp: string;
  dbp: string;
  gcs: string;
  wbc: string;
}

export interface Scores {
  qsofa: number;
  sofa: number;
  news2: number;
  sepsisCriteriaMet: boolean;
}

export interface AntibiogramEntry {
  organism: string;
  antibiotic: string;
  susceptibility: number; // 0-100
}

export interface PatientData {
  // Stage 1: Trigger
  vitals: Vitals;
  scores: Scores;
  
  // Stage 2: Stratification
  diagnosis: 'Sepsis' | 'Septic Shock';
  infectionSource: string;
  setting: 'Community' | 'Healthcare';
  
  // Stage 3: Risk Layering
  age: string;
  sex: 'Male' | 'Female' | 'Other';
  weight: string;
  icuDay: string;
  renalFunction: string; // CrCl or eGFR
  hepaticFunction: string;
  pregnancyStatus: 'No' | 'Yes' | 'N/A';
  transplantStatus: 'No' | 'Yes';
  neutropeniaStatus: 'No' | 'Yes';
  
  mdrRisk: 'No' | 'Yes';
  recentHospitalization: 'No' | 'Yes';
  priorAntibiotics: 'No' | 'Yes';
  priorAntibioticsDetails: string;
  immunocompromised: 'No' | 'Yes';
  indwellingDevices: 'No' | 'Yes';
  travelHistory: 'No' | 'Yes';
  comorbidities: string;
  
  // Stage 4: Antibiogram
  localAntibiogram?: AntibiogramEntry[];
  
  // Stage 5: Recommendation (Output)
  analysisResult?: AnalysisResult;
  
  // Stage 6: Timeline
  cultureDrawTimestamp?: string;
  cultureResultTimestamp?: string;
  deEscalationDecision?: string;
  timelineEvents: TimelineEvent[];
}

export interface TimelineEvent {
  day: number;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface AnalysisResult {
  summary: string;
  confidenceScore: number;
  empiric_recommendation: Recommendation[];
  clinical_reasoning: string;
  safety_stewardship: string;
}

export interface Recommendation {
  antibiotic: string;
  dose: string;
  awareTag: 'Access' | 'Watch' | 'Reserve';
  evidenceLevel: string;
  citation: string;
  reasoning: string;
  alternatives: string[];
  whenNotToUse: string;
  spectrumCovered: string;
  spectrumNotCovered: string;
  confidenceScore: number;
  coverage?: { [key: string]: string };
}

export interface PatientSession {
  id?: string;
  userId: string;
  createdAt: number;
  stage: Stage;
  data: PatientData;
}
