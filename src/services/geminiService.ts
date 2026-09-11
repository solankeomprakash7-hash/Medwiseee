import { Type, GeminiOptions, GeminiError } from "../lib/gemini";
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
    - Setting: ${data.setting} (Infection Source(s): ${(data.infectionSources || []).join(', ')}, Source Control: ${data.sourceControl})
    - Organ Dysfunctions: Renal (${data.renalFunction}, Trend: ${data.renalTrend || 'Stable'}), Hepatic (${data.hepaticFunction}), Neutropenia (${data.neutropeniaStatus})
    - Other Status: Pregnancy (${data.pregnancyStatus}), Transplant (${data.transplantStatus}), Immunocompromised (${data.immunocompromised})
    - Host Factors: Weight ${data.weight}kg, Height ${data.height || 'N/A'}cm
    - Microbiology: Status (${data.microbiologyStatus}), Confirmed (${data.confirmedOrganism || 'None'})
    - Risk Factors: MDR Risk (${data.mdrRisk}), MDR History (${data.mdrHistory}), Recent Hosp (${data.recentHospitalization}), Prior Antibiotics (${data.priorAntibiotics} - ${data.priorAntibioticsDetails})
    - Current Rx: ${data.currentAntibiotics || 'None'}
    - Devices/Travel: Indwelling Devices (${data.indwellingDevices}), Travel (${data.travelHistory})
    - Allergies: ${data.allergies}
    - Comorbidities: ${data.comorbidities}

    ${antibiogramContext}

    IMPORTANT: This patient has multiple suspected or confirmed infection sources. Your recommendation MUST provide empiric coverage for the expected pathogens of ALL listed sources simultaneously. If the sources require different site penetration (e.g., CNS vs Urine), the recommended agent must successfully reach ALL relevant sites or a combination regimen must be used.

    REQUIRED ANALYSIS:
    1. RECOMMENDATION: List the SINGLE SMARTEST CHOICE first. For each, include:
       - antibiotic: name
       - dose: specific amount (e.g., 1g)
       - route: e.g., IV, PO
       - frequency: e.g., q8h
       - infusion: e.g., "Extended infusion over 3 hours"
       - duration: e.g., "Reassess at 48–72 hours"
       - main_action: Choose from START, CONTINUE, CHANGE, DE-ESCALATE, STOP, IV -> ORAL, OPTIMIZE DOSE.
       - awareTag: Access, Watch, or Reserve
       - evidenceLevel: e.g., "SSC 2021 Strong"
       - citation: Source reference
       - reasoning: WHY this drug (Keep brief, 1 sentence)
       - alternatives: Other options
       - whenNotToUse: Contraindications
       - spectrumCovered: concise activity
       - spectrumNotCovered: major gaps
       - confidenceScore: 0-100%
       - coverage: { gram_positive: "Yes/No", gram_negative: "Yes/No", pseudomonas: "Yes/No", mrsa: "Yes/No", anaerobes: "Yes/No", esbl: "Yes/No" }

    2. WHY THIS CHOICE: 3-4 concise, patient-specific reasons why THIS antibiotic is the smartest choice (Infection source, severity, resistance risk, microbiology, host factors). Do NOT provide generic pharmacology.

    3. SPECTRUM FIT: Assess how well the RECOMMENDED regimen matches the REQUIRED coverage.
       - score: 0-100.
       - status: "Appropriate", "Inadequate", or "Broader than required".
       - interpretation: Summary.
       - required_coverage: List only clinically relevant spectrum components (e.g. Gram-negative, ESBL).
       - provided_coverage: What is covered.
       - excess_coverage: Unnecessary coverage (e.g. "None identified" or "Potential excess MRSA coverage").

    4. HOW TO ADMINISTER / PK-PD:
       - target: Relevant index (e.g. %fT > MIC, AUC/MIC).
       - optimization_strategy: Prolonged infusion, loading doses, etc.
       - renal_adjustment: Specific adjustment based on current function.
       - hepatic_adjustment: If relevant.
       - tdm_required: Boolean.
       - rationale: Why this strategy fits this patient's physiology.
       - expected_exposure: Assessment of probability of target attainment.

    5. TISSUE / SITE PENETRATION:
       - assessment: Excellent/Good/Moderate/Limited/Poor/Uncertain.
       - site_specific_context: 1-3 sentences explaining why it matters for THIS infection.
       - limitations: Any exposure considerations (abscess, poor perfusion).

    6. SIDE EFFECTS & INTERACTIONS TO WATCH:
       - adverse_effects: 2-3 important risks for THIS patient and dose.
       - interactions: Important drug-drug interactions with current meds.
       - monitoring: What to monitor (e.g. renal function, neurological status).

    7. STEWARDSHIP OPPORTUNITIES: 1-3 actionable opportunities (Do NOT repeat the primary recommendation).
       - type: STOP, DE-ESCALATE, NARROW, CHANGE, IV -> ORAL, OPTIMIZE DOSE, REVIEW DURATION, CULTURE-DIRECTED THERAPY, SOURCE CONTROL, AVOID UNNECESSARY BROAD SPECTRUM.
       - priority: High, Medium, Low.
       - description: Actionable instruction.
       - rationale: Clinical reason.

    8. DETAILED CLINICAL REASONING: Detailed breakdown of the choice explaining the full decision pathway from source to safety. Do NOT simply repeat sections 1-7.

    9. EVIDENCE: Concise references (Guidelines, Antibiogram, PK/PD literature).

    ANTI-REPETITION ENGINE RULES:
    - Each clinical point appears ONLY ONCE.
    - Recommendation = "What?"
    - Why this choice = "Why?"
    - Spectrum Fit = "Is it matched?"
    - Admin/PK-PD = "How?"
    - Penetration = "Will it reach?"
    - Safety = "What to watch?"
    - Stewardship = "How to improve?"
    - Reasoning = "How did MedWise decide?"
    - Evidence = "What supports it?"

    GUIDELINES:
    - Follow SSC 2021/2026 and IDSA 2024.
    - If HA-Sepsis or MDR risk factors are present, prioritize antipseudomonal and/or anti-MRSA coverage.
    - Factor in the local antibiogram data if provided to adjust agent selection.
    - The Spectrum Fit score should be based on the RECOMMENDED empiric therapy compared to the patient's clinical and microbiological needs.
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
            route: { type: Type.STRING },
            frequency: { type: Type.STRING },
            infusion: { type: Type.STRING },
            duration: { type: Type.STRING },
            main_action: { type: Type.STRING, enum: ["START", "CONTINUE", "CHANGE", "DE-ESCALATE", "STOP", "IV -> ORAL", "OPTIMIZE DOSE"] },
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
          required: ["antibiotic", "dose", "route", "frequency", "infusion", "duration", "main_action", "awareTag", "evidenceLevel", "citation", "reasoning", "spectrumCovered", "spectrumNotCovered", "confidenceScore"]
        }
      },
      smartest_choice_reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
      pk_pd_fit: {
        type: Type.OBJECT,
        properties: {
          target: { type: Type.STRING },
          expected_exposure: { type: Type.STRING },
          optimization_strategy: { type: Type.STRING },
          renal_adjustment: { type: Type.STRING },
          hepatic_adjustment: { type: Type.STRING },
          tdm_required: { type: Type.BOOLEAN },
          rationale: { type: Type.STRING }
        },
        required: ["target", "expected_exposure", "optimization_strategy", "tdm_required", "rationale"]
      },
      side_effects_interactions: {
        type: Type.OBJECT,
        properties: {
          adverse_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
          interactions: { type: Type.ARRAY, items: { type: Type.STRING } },
          monitoring: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["adverse_effects", "interactions", "monitoring"]
      },
      site_penetration: {
        type: Type.OBJECT,
        properties: {
          assessment: { type: Type.STRING },
          limitations: { type: Type.STRING },
          site_specific_context: { type: Type.STRING }
        },
        required: ["assessment", "limitations", "site_specific_context"]
      },
      clinical_reasoning: { type: Type.STRING },
      spectrum_fit: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Inadequate", "Appropriate", "Broader than required"] },
          interpretation: { type: Type.STRING },
          required_coverage: { type: Type.ARRAY, items: { type: Type.STRING } },
          provided_coverage: { type: Type.ARRAY, items: { type: Type.STRING } },
          excess_coverage: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "status", "interpretation", "required_coverage", "provided_coverage", "excess_coverage"]
      },
      stewardship_opportunities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            description: { type: Type.STRING },
            rationale: { type: Type.STRING }
          },
          required: ["type", "priority", "description", "rationale"]
        }
      },
      next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
      safety_stewardship: { type: Type.STRING }
    },
    required: ["summary", "confidenceScore", "empiric_recommendation", "clinical_reasoning", "safety_stewardship", "spectrum_fit", "stewardship_opportunities", "smartest_choice_reasons", "pk_pd_fit", "site_penetration", "next_steps", "side_effects_interactions"]
  };

  try {
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
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Not a JSON response
        const text = await response.text().catch(() => 'No response body');
        throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
      }

      if (errorData.type) {
        const err = new GeminiError(errorData.type, errorData.error || `Server returned ${response.status}`);
        if (errorData.details) {
          (err as any).details = errorData.details;
        }
        throw err;
      }
      throw new Error(errorData.error || `Server returned ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new GeminiError('ABORTED', options.signal?.reason || 'Request was cancelled.');
    }
    throw err;
  }
};
