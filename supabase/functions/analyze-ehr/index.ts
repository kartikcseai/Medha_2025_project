// Deno deployable Supabase Edge Function
// Expects JSON body: { fileUrl?: string | null, patient: { childName, gender, age, weight, drugName } }
// Uses GEMINI_API_KEY secret. Returns: { doseResult, notes }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface PatientInput {
  childName?: string;
  gender?: string;
  age?: number | string;
  weight?: number | string;
  drugName?: string;
}

interface AnalyzeRequest {
  fileUrl?: string | null;
  labUrl?: string | null;
  patient: PatientInput;
  symptoms?: string;
  additionalInfo?: string;
  analysisType?: 'disease_prediction' | 'dosage_analysis';
}

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = "gemini-1.5-flash-latest";

async function fetchFileAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  } catch (error) {
    console.error("Error fetching file:", error);
    throw error;
  }
}

async function callGemini(prompt: string, fileData?: { mimeType: string; data: string }): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const parts: any[] = [{ text: prompt }];
  
  // Add file data if provided
  if (fileData) {
    parts.push({
      inline_data: {
        mime_type: fileData.mimeType,
        data: fileData.data
      }
    });
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text as string;
}

function buildDiseasePredictionPrompt(patient: PatientInput, symptoms: string, additionalInfo?: string) {
  const age = typeof patient.age === "string" ? parseFloat(patient.age) : patient.age;
  const weight = typeof patient.weight === "string" ? parseFloat(patient.weight) : patient.weight;
  const gender = patient.gender ?? "unspecified";
  const name = patient.childName ?? "the child";
  const allergies = patient.allergies || "None reported";

  return `You are a pediatric clinical assistant analyzing patient symptoms for disease prediction and home remedy recommendations.

PATIENT INFORMATION:
- Name: ${name}
- Gender: ${gender}
- Age: ${age ?? "unknown"} years
- Weight: ${weight ?? "unknown"} kg
- Allergies: ${allergies}

SYMPTOMS REPORTED:
${symptoms}

ADDITIONAL INFORMATION:
${additionalInfo || "None provided"}

ANALYSIS TASKS:
1. Analyze the symptoms and predict the most likely condition/disease
2. Provide confidence level (0-100%) for the prediction
3. Suggest appropriate home remedies for symptom relief
4. List important precautions to take
5. Specify when to seek immediate medical attention
6. Assess severity level (low, moderate, high, critical)

Return JSON with the following exact structure:
{
  "diseasePrediction": "<most likely condition based on symptoms>",
  "confidence": <number between 0-100>,
  "symptoms": ["<list of reported symptoms>"],
  "homeRemedies": ["<list of safe home remedies>"],
  "precautions": ["<list of important precautions>"],
  "whenToSeeDoctor": ["<list of warning signs requiring medical attention>"],
  "severity": "<low|moderate|high|critical>"
}

IMPORTANT:
- Focus on pediatric considerations for age ${age} years
- Prioritize safety and conservative recommendations
- Always recommend professional medical consultation for serious symptoms
- Consider weight-based dosing for any remedies
- Highlight any red flags or emergency situations`;

}

function buildPrompt(patient: PatientInput, hasEhrFile?: boolean, hasLabFile?: boolean) {
  const age = typeof patient.age === "string" ? parseFloat(patient.age) : patient.age;
  const weight = typeof patient.weight === "string" ? parseFloat(patient.weight) : patient.weight;
  const gender = patient.gender ?? "unspecified";
  const drug = patient.drugName ?? "unspecified";
  const name = patient.childName ?? "the child";
  const allergies = patient.allergies || "None reported";
  const drugReactions = patient.drugReactions || "None reported";
  const otherMeds = patient.takingOtherMeds === 'yes' ? (patient.otherMeds || "Unspecified") : "None";
  const disease = patient.diseaseName || "Not specified";
  const diseaseDuration = patient.diseaseDurationMonths || "Unknown";

  return `You are a pediatric clinical assistant analyzing patient data and medical documents.

PATIENT INFORMATION:
- Name: ${name}
- Gender: ${gender}
- Age: ${age ?? "unknown"} years
- Weight: ${weight ?? "unknown"} kg
- Medication requested: ${drug}
- Allergies: ${allergies}
- Drug reactions: ${drugReactions}
- Other medications: ${otherMeds}
- Disease: ${disease}
- Disease duration: ${diseaseDuration} months

DOCUMENTS PROVIDED:
${hasEhrFile ? "- EHR/Medical Report (PDF): Analyze this document for relevant clinical findings, lab values, diagnoses, and treatment history" : "- No EHR report provided"}
${hasLabFile ? "- Lab Report (Image/PDF): Analyze this document for lab values, vital signs, and diagnostic findings" : "- No lab report provided"}

ANALYSIS TASKS:
1. If EHR/medical documents are provided, extract key clinical findings, diagnoses, lab values, and treatment history
2. If lab reports are provided, extract relevant lab values, vital signs, and diagnostic findings
3. Cross-reference findings with the requested medication for potential interactions or contraindications
4. Calculate appropriate pediatric dosing based on WHO/AAP guidelines
5. Identify any red flags or contraindications
6. Provide comprehensive clinical recommendations

Return JSON with the following exact structure:
{
  "doseResult": {
    "doseRange": "<min–max mg/day or mg/kg/day with clear units>",
    "recommendation": "<specific per-dose instructions e.g., 5 ml every 8 hours>",
    "frequency": "<times per day>",
    "duration": "<days>"
  },
  "precautions": "<bullet points about contraindications, drug interactions, monitoring requirements>",
  "keepInMind": "<important clinical reminders, red flags to watch for, follow-up requirements>",
  "notes": "<clinical rationale, document findings summary, WHO/AAP guideline references>"
}

IMPORTANT: 
- Use conservative dosing for pediatric patients
- Consider weight-based dosing when appropriate
- Highlight any contraindications or drug interactions
- If documents reveal concerning findings, emphasize them in precautions
- Always recommend clinical verification before prescribing`;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = (await req.json()) as AnalyzeRequest;
    const patient = body?.patient ?? {};
    const fileUrl = body?.fileUrl ?? null;
    const labUrl = body?.labUrl ?? null;
    const symptoms = body?.symptoms ?? "";
    const additionalInfo = body?.additionalInfo ?? "";
    const analysisType = body?.analysisType ?? "dosage_analysis";

    // Determine file types and prepare for analysis
    const hasEhrFile = !!fileUrl;
    const hasLabFile = !!labUrl;
    
    let fileData: { mimeType: string; data: string } | undefined;
    
    // Fetch and prepare file for Gemini analysis
    if (hasEhrFile || hasLabFile) {
      try {
        // Prioritize EHR file if both are provided
        const urlToAnalyze = fileUrl || labUrl!;
        const fileBase64 = await fetchFileAsBase64(urlToAnalyze);
        
        // Determine MIME type based on URL or file extension
        let mimeType = "application/pdf"; // default
        if (urlToAnalyze.includes('.jpg') || urlToAnalyze.includes('.jpeg')) {
          mimeType = "image/jpeg";
        } else if (urlToAnalyze.includes('.png')) {
          mimeType = "image/png";
        } else if (urlToAnalyze.includes('.gif')) {
          mimeType = "image/gif";
        } else if (urlToAnalyze.includes('.webp')) {
          mimeType = "image/webp";
        }
        
        fileData = {
          mimeType,
          data: fileBase64
        };
      } catch (fileError) {
        console.error("Error processing file:", fileError);
        // Continue without file analysis if file processing fails
      }
    }

    let prompt: string;
    if (analysisType === "disease_prediction") {
      prompt = buildDiseasePredictionPrompt(patient, symptoms, additionalInfo);
    } else {
      prompt = buildPrompt(patient, hasEhrFile, hasLabFile);
    }
    let geminiText = "";
    
    try {
      geminiText = await callGemini(prompt, fileData);
    } catch (err) {
      // Fallback: provide a minimal safe response if model fails
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({
          doseResult: null,
          precautions: null,
          keepInMind: null,
          notes: `Model error: ${msg}. Please try again or check GEMINI_API_KEY.`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // Try to parse the model JSON; if it returns plain text, forward as notes
    let parsed: unknown;
    try {
      parsed = JSON.parse(geminiText);
      return new Response(JSON.stringify(parsed), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch {
      return new Response(
        JSON.stringify({ doseResult: null, precautions: null, keepInMind: null, notes: geminiText }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 400 });
  }
});


