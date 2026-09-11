import { User as FirebaseUser } from 'firebase/auth';

export enum Stage {
  INPUT = 'input',
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
  // Input Stage
  vitals: Vitals;
  scores: Scores;
  
  diagnosis: 'Sepsis' | 'Septic Shock';
  infectionSources: string[];
  setting: 'Community' | 'Healthcare';
  
  age: string;
  sex: 'Male' | 'Female' | 'Other';
  weight: string;
  height?: string; // New
  icuDay: string;
  renalFunction: string; // CrCl or eGFR
  renalTrend?: 'Stable' | 'Improving' | 'Worsening'; // New
  hepaticFunction: string;
  pregnancyStatus: 'No' | 'Yes' | 'N/A';
  transplantStatus: 'No' | 'Yes';
  neutropeniaStatus: 'No' | 'Yes';
  
  sourceControl: 'Adequate' | 'In progress' | 'Not achieved' | 'Not applicable' | 'Unknown'; // New
  
  mdrRisk: 'No' | 'Yes';
  mdrHistory: string; 
  recentHospitalization: 'No' | 'Yes';
  priorAntibiotics: 'No' | 'Yes';
  priorAntibioticsDetails: string;
  immunocompromised: 'No' | 'Yes';
  indwellingDevices: 'No' | 'Yes';
  travelHistory: 'No' | 'Yes';
  comorbidities: string;
  allergies?: string; 
  
  currentAntibiotics?: string; // New
  microbiologyStatus: 'No microbiology' | 'Gram stain available' | 'Organism identified' | 'Susceptibility available'; // New
  confirmedOrganism?: string; // New
  
  localAntibiogram?: AntibiogramEntry[];
  
  // Output Stage
  analysisResult?: AnalysisResult;
  
  // Timeline Stage
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
  
  // Smart Choice Reasoning
  smartest_choice_reasons: string[]; // 3-5 specific reasons
  
  // PK/PD Assessment
  pk_pd_fit: {
    target: string;
    expected_exposure: string;
    optimization_strategy: string;
    tdm_required: boolean;
    rationale: string;
    renal_adjustment?: string;
    hepatic_adjustment?: string;
  };
  
  // Side Effects & Interactions
  side_effects_interactions?: {
    adverse_effects: string[];
    interactions: string[];
    monitoring: string[];
  };

  // Site Penetration
  site_penetration: {
    assessment: string;
    limitations: string;
    site_specific_context: string;
  };

  // New features
  spectrum_fit?: {
    score: number;
    status: 'Inadequate' | 'Appropriate' | 'Broader than required';
    interpretation: string;
    required_coverage: string[];
    provided_coverage: string[];
    excess_coverage: string[];
  };
  stewardship_opportunities?: StewardshipOpportunity[];
  
  // Follow-up actions
  next_steps?: string[];
}

export interface StewardshipOpportunity {
  type: 'STOP' | 'DE-ESCALATE' | 'ESCALATE' | 'IV -> ORAL' | 'OPTIMIZE DOSE' | 'REVIEW DURATION' | 'CULTURE-DIRECTED THERAPY' | 'EXCESSIVE SPECTRUM' | 'DUPLICATE COVERAGE' | 'ALLERGY / SAFETY CONCERN' | 'SOURCE CONTROL' | 'ANTIMICROBIAL REVIEW DUE';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  rationale: string;
}

export interface Recommendation {
  antibiotic: string;
  dose: string;
  route?: string;
  frequency?: string;
  infusion?: string;
  duration?: string;
  main_action?: 'Start' | 'Continue' | 'Change' | 'De-escalate' | 'Stop' | 'IV -> Oral';
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
