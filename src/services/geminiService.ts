import { Type, GeminiOptions } from "../lib/gemini";
import { PatientData, AnalysisResult } from "../types";

export const analyzeSepsisTherapy = async (data: PatientData, options: GeminiOptions = {}): Promise<AnalysisResult> => {
  const antibiogramContext = data.localAntibiogram 
    ? `LOCAL ANTIBIOGRAM DATA:
${data.localAntibiogram.map(e => `- ${e.organism} vs ${e.antibiotic}: ${e.susceptibility}% susceptible`).join('\n')}`
    : "No local antibiogram data provided. Use generic national guideline susceptibility assumptions.";

  const prompt = `
    You are a world-class ICU physician, infectious disease specialist, and antimicrobial stewardship lead.
    Your task is to provide a precision antimicrobial recommendation for a patient with sepsis in the ICU.

    PATIENT CONTEXT:
    - Vitals: Temp ${data.vitals.temp}, HR ${data.vitals.hr}, RR ${data.vitals.rr}, BP ${data.vitals.sbp}/${data.vitals.dbp}, GCS ${data.vitals.gcs}, WBC ${data.vitals.wbc}
    - Scores: qSOFA ${data.scores.qsofa}, SOFA ${data.scores.sofa}, NEWS2 ${data.scores.news2}
    - Setting: ${data.setting} (Infection Source: ${data.infectionSource})
    - Organ Dysfunctions: Renal (${data.renalFunction}), Hepatic (${data.hepaticFunction}), Neutropenia (${data.neutropeniaStatus})
    - Other Status: Pregnancy (${data.pregnancyStatus}), Transplant (${data.transplantStatus})
    - Risk Factors: MDR Risk (${data.mdrRisk}), Recent Hosp (${data.recentHospitalization}), Prior Antibiotics (${data.priorAntibiotics} - ${data.priorAntibioticsDetails})
    - Devices/Travel: Indwelling Devices (${data.indwellingDevices}), Travel (${data.travelHistory})

    ${antibiogramContext}

    REQUIRED ANALYSIS:
    1. SUMMARY: A concise executive summary of the clinical state (max 100 words).
    2. CONFIDENCE SCORE: (0-100%) based on completeness of data.
    3. RECOMMENDATIONS: List 1-3 appropriate empiric agents. For each, include:
       - antibiotic: name
       - dose: adjusted for renal/hepatic status
       - awareTag: Access, Watch, or Reserve (WHO classification)
       - evidenceLevel: e.g., "SSC 2021 Strong/Moderate"
       - citation: e.g., "Evans L, et al. Surviving Sepsis Campaign 2021"
       - reasoning: Why this drug for THIS patient?
       - alternatives: Other options
       - whenNotToUse: Contraindications or cautions
       - spectrumCovered: specific coverage
       - spectrumNotCovered: specific gaps
       - confidenceScore: 0-100%
       - coverage: { gram_positive: "Yes/No", gram_negative: "Yes/No", pseudomonas: "Yes/No", mrsa: "Yes/No", anaerobes: "Yes/No", esbl: "Yes/No" }
    4. CLINICAL REASONING: Detailed breakdown of the choice.
    5. SAFETY & STEWARDSHIP: Guidance on monitoring and timeline.

    GUIDELINES:
    - Follow SSC 2021/2026 and IDSA 2024.
    - If HA-Sepsis or MDR risk factors are present, prioritize antipseudomonal and/or anti-MRSA coverage.
    - Factor in the local antibiogram data if provided to adjust agent selection.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      confidenceScore: { type: Type.NUMBER },
      empiric_recommendation: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            antibiotic: { type: Type.STRING },
            dose: { type: Type.STRING },
            awareTag: { type: Type.STRING, enum: ["Access", "Watch", "Reserve"] },
            evidenceLevel: { type: Type.STRING },
            citation: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            whenNotToUse: { type: Type.STRING },
            spectrumCovered: { type: Type.STRING },
            spectrumNotCovered: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            coverage: {
              type: Type.OBJECT,
              properties: {
                gram_positive: { type: Type.STRING },
                gram_negative: { type: Type.STRING },
                pseudomonas: { type: Type.STRING },
                mrsa: { type: Type.STRING },
                anaerobes: { type: Type.STRING },
                esbl: { type: Type.STRING }
              }
            }
          },
          required: ["antibiotic", "dose", "awareTag", "evidenceLevel", "citation", "reasoning", "spectrumCovered", "spectrumNotCovered", "confidenceScore"]
        }
      },
      clinical_reasoning: { type: Type.STRING },
      safety_stewardship: { type: Type.STRING }
    },
    required: ["summary", "confidenceScore", "empiric_recommendation", "clinical_reasoning", "safety_stewardship"]
  };

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      prompt, 
      schema, 
      options: {
        model: "gemini-3.6-flash",
        maxRetries: 2,
        timeout: 120000,
        ...options
      }
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}`);
  }

  return await response.json();
};
