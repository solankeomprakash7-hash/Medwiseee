export const AWARE_CLASSIFICATION: Record<string, 'Access' | 'Watch' | 'Reserve'> = {
  'Amoxicillin': 'Access',
  'Amoxicillin-Clavulanate': 'Access',
  'Ampicillin': 'Access',
  'Benzylpenicillin': 'Access',
  'Cefazolin': 'Access',
  'Ceftriaxone': 'Watch',
  'Cefotaxime': 'Watch',
  'Ciprofloxacin': 'Watch',
  'Levofloxacin': 'Watch',
  'Meropenem': 'Watch',
  'Imipenem-Cilastatin': 'Watch',
  'Piperacillin-Tazobactam': 'Watch',
  'Vancomycin': 'Watch',
  'Linezolid': 'Watch',
  'Ceftazidime-Avibactam': 'Reserve',
  'Ceftolozane-Tazobactam': 'Reserve',
  'Colistin': 'Reserve',
  'Polymyxin B': 'Reserve',
  'Tigecycline': 'Reserve',
  'Daptomycin': 'Reserve'
};

export const INFECTION_SOURCES = [
  'Lung (Pneumonia)',
  'Urinary Tract (UTI)',
  'Intra-abdominal',
  'CNS (Meningitis/Abscess)',
  'Skin/Soft Tissue',
  'Bloodstream (Bacteremia)',
  'Catheter-Related',
  'Bone/Joint',
  'Unknown Source'
];

export const INITIAL_ANTIBIOGRAM = [
  { organism: 'E. coli', antibiotic: 'Ceftriaxone', susceptibility: 85 },
  { organism: 'E. coli', antibiotic: 'Piperacillin-Tazobactam', susceptibility: 92 },
  { organism: 'Klebsiella spp.', antibiotic: 'Meropenem', susceptibility: 98 },
  { organism: 'Pseudomonas aeruginosa', antibiotic: 'Piperacillin-Tazobactam', susceptibility: 82 },
  { organism: 'Pseudomonas aeruginosa', antibiotic: 'Ceftazidime', susceptibility: 88 },
  { organism: 'S. aureus', antibiotic: 'Vancomycin', susceptibility: 100 },
  { organism: 'S. aureus', antibiotic: 'Cefazolin', susceptibility: 95 }
];

export const DURATION_LOOKUP = {
  'Lung (Pneumonia)': { range: '7 days', citation: 'IDSA 2016 / ATS' },
  'Urinary Tract (UTI)': { range: '7 days', citation: 'IDSA 2019' },
  'Intra-abdominal': { range: '4-7 days', citation: 'STOP-IT Trial' },
  'CNS (Meningitis/Abscess)': { range: '14-21 days', citation: 'IDSA 2004' },
  'Skin/Soft Tissue': { range: '7-10 days', citation: 'IDSA 2014' },
  'Bloodstream (Bacteremia)': { range: '7-14 days', citation: 'IDSA 2021' },
  'Unknown Source': { range: '7 days', citation: 'Expert Opinion' }
};
