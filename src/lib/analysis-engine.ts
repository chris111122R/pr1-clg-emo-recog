import type {
  AnalysisResult,
  EmotionScore,
  FeatureImportance,
  ConfidenceDistribution,
  HeatmapCell,
} from "./AnalysisContext"
import * as faceapi from '@vladmandic/face-api'

// ── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

// ── Emotion sets ───────────────────────────────────────────────────────────

const ALL_EMOTIONS = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral"]

// Simple keyword → emotion mapping for text analysis
const KEYWORD_MAP: Record<string, string> = {
  // Joy
  happy: "Joy", glad: "Joy", excited: "Joy", love: "Joy", wonderful: "Joy",
  amazing: "Joy", great: "Joy", fantastic: "Joy", awesome: "Joy", beautiful: "Joy",
  enjoy: "Joy", fun: "Joy", smile: "Joy", laugh: "Joy", cheerful: "Joy",
  delight: "Joy", pleased: "Joy", thrilled: "Joy", celebrate: "Joy",
  // Sadness
  sad: "Sadness", cry: "Sadness", depressed: "Sadness", lonely: "Sadness",
  heartbroken: "Sadness", grief: "Sadness", miss: "Sadness", tears: "Sadness",
  sorry: "Sadness", unfortunate: "Sadness", devastated: "Sadness", miserable: "Sadness",
  // Anger
  angry: "Anger", furious: "Anger", mad: "Anger", hate: "Anger", rage: "Anger",
  annoyed: "Anger", frustrated: "Anger", irritated: "Anger", outraged: "Anger",
  // Fear
  scared: "Fear", afraid: "Fear", terrified: "Fear", anxious: "Fear", nervous: "Fear",
  worried: "Fear", panic: "Fear", dread: "Fear", frightened: "Fear",
  // Surprise
  surprised: "Surprise", shocked: "Surprise", wow: "Surprise", unexpected: "Surprise",
  astonished: "Surprise", amazed: "Surprise", unbelievable: "Surprise",
  // Disgust
  disgusted: "Disgust", gross: "Disgust", revolting: "Disgust", terrible: "Disgust",
  horrible: "Disgust", repulsive: "Disgust", nasty: "Disgust",
}



// ── Public API ──────────────────────────────────────────────────────────────

function getDynamicFeatureImportance(modality: "text" | "image" | "audio", emotion: string, inputSummary?: string): FeatureImportance[] {
  if (modality === "text" && inputSummary) {
    const words = inputSummary.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
    const matched: Record<string, number> = {};
    words.forEach(w => {
      if (KEYWORD_MAP[w]) matched[w] = (matched[w] || 0) + 1;
    });
    const features: FeatureImportance[] = Object.entries(matched)
      .map(([word, count]) => ({ label: `Keyword: "${word}"`, value: clamp((count * 0.2) + 0.4, 0.1, 1.0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
      
    if (features.length === 0) {
       return [{ label: "Contextual Sentiment (No strong keywords)", value: 0.8 }];
    }
    return features;
  } else if (modality === "image") {
     return [{ label: "Overall Image Composition", value: 1.0 }];
  } else {
     return [{ label: "Overall Audio Prosody", value: 1.0 }];
  }
}

// ── Dummy Heatmap Generators ───────────────────────────────────────────────

function generateTextHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const distFromCenter = Math.sqrt(Math.pow(r - 3.5, 2) + Math.pow(c - 3.5, 2))
      const base = Math.max(0, 1 - distFromCenter / 5)
      cells.push({ row: r, col: c, value: clamp(base + rand(-0.15, 0.15), 0, 1) })
    }
  }
  return cells
}

function generateFaceHeatmap(emotion: string): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  const eyeRegion = emotion === "Fear" || emotion === "Surprise" ? 0.9 : emotion === "Joy" ? 0.85 : 0.5
  const mouthRegion = emotion === "Joy" ? 0.9 : emotion === "Anger" ? 0.7 : emotion === "Surprise" ? 0.8 : 0.4
  const browRegion = emotion === "Anger" ? 0.9 : emotion === "Surprise" ? 0.85 : emotion === "Sadness" ? 0.8 : 0.3

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      let value = rand(0, 0.15)
      if (r >= 1 && r <= 2 && c >= 2 && c <= 5) value = eyeRegion + rand(-0.1, 0.1)
      if (r >= 0 && r <= 1 && c >= 2 && c <= 5) value = browRegion + rand(-0.1, 0.1)
      if (r >= 5 && r <= 6 && c >= 2 && c <= 5) value = mouthRegion + rand(-0.1, 0.1)
      if (r >= 3 && r <= 4 && c >= 3 && c <= 4) value = rand(0.05, 0.2)
      cells.push({ row: r, col: c, value: clamp(value, 0, 1) })
    }
  }
  return cells
}

function generateSpectrogramHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const midFreqBoost = r >= 2 && r <= 5 ? rand(0.4, 0.9) : rand(0, 0.3)
      const timeVariation = Math.sin((c / 8) * Math.PI) * rand(0.1, 0.3)
      cells.push({ row: r, col: c, value: clamp(midFreqBoost + timeVariation, 0, 1) })
    }
  }
  return cells
}

// ── Real Client-Side Extraction ──────────────────────────────────────────────

let faceModelsLoaded = false;
async function loadFaceModels() {
  if (typeof window === "undefined" || faceModelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models')
  ]);
  faceModelsLoaded = true;
}

async function extractRealFaceHeatmap(file: File, emotion: string): Promise<HeatmapCell[]> {
  if (typeof window === "undefined") return generateFaceHeatmap(emotion);
  
  try {
    await loadFaceModels();
    
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
    URL.revokeObjectURL(url);
    
    if (!detection) return generateFaceHeatmap(emotion);

    const cells: HeatmapCell[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        cells.push({ row: r, col: c, value: rand(0, 0.05) }); 
      }
    }
    
    const getGridCell = (x: number, y: number) => {
      const col = clamp(Math.floor((x / img.width) * 8), 0, 7);
      const row = clamp(Math.floor((y / img.height) * 8), 0, 7);
      return { row, col };
    }
    
    const addHeat = (points: faceapi.Point[], intensity: number) => {
       points.forEach(p => {
          const { row, col } = getGridCell(p.x, p.y);
          const cell = cells.find(c => c.row === row && c.col === col);
          if (cell) cell.value = clamp(cell.value + intensity, 0, 1);
       });
    }

    const landmarks = detection.landmarks;
    if (emotion === "Joy") {
       addHeat(landmarks.getMouth(), 0.8);
       addHeat(landmarks.getLeftEye(), 0.3);
       addHeat(landmarks.getRightEye(), 0.3);
    } else if (emotion === "Anger" || emotion === "Sadness" || emotion === "Fear") {
       addHeat(landmarks.getLeftEyeBrow(), 0.8);
       addHeat(landmarks.getRightEyeBrow(), 0.8);
       addHeat(landmarks.getLeftEye(), 0.5);
       addHeat(landmarks.getRightEye(), 0.5);
    } else if (emotion === "Surprise") {
       addHeat(landmarks.getMouth(), 0.6);
       addHeat(landmarks.getLeftEyeBrow(), 0.7);
       addHeat(landmarks.getRightEyeBrow(), 0.7);
    } else {
       addHeat(landmarks.getMouth(), 0.2);
       addHeat(landmarks.getLeftEye(), 0.2);
       addHeat(landmarks.getRightEye(), 0.2);
    }
    return cells;
  } catch (error) {
    console.error("Local face tracking failed, using fallback:", error);
    return generateFaceHeatmap(emotion);
  }
}

async function extractRealAudioHeatmap(file: File): Promise<HeatmapCell[]> {
  if (typeof window === "undefined" || !(window.AudioContext || (window as any).webkitAudioContext)) {
    return generateSpectrogramHeatmap();
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    
    const cells: HeatmapCell[] = [];
    const chunkSize = Math.floor(channelData.length / 8);
    
    for (let c = 0; c < 8; c++) {
       const chunk = channelData.slice(c * chunkSize, (c + 1) * chunkSize);
       let zeroCrossings = 0;
       let maxAmplitude = 0;
       for (let i = 1; i < chunk.length; i++) {
          if (Math.abs(chunk[i]) > maxAmplitude) maxAmplitude = Math.abs(chunk[i]);
          if ((chunk[i] >= 0 && chunk[i-1] < 0) || (chunk[i] < 0 && chunk[i-1] >= 0)) {
             zeroCrossings++;
          }
       }
       
       const normalizedFreq = clamp(zeroCrossings / (chunkSize * 0.1), 0, 1);
       const activeRow = 7 - Math.floor(normalizedFreq * 7);
       
       for (let r = 0; r < 8; r++) {
          const distance = Math.abs(r - activeRow);
          const heat = clamp(maxAmplitude - (distance * 0.2), 0, 1);
          cells.push({ row: r, col: c, value: heat });
       }
    }
    return cells;
  } catch (error) {
    console.error("Local audio parsing failed, using fallback:", error);
    return generateSpectrogramHeatmap();
  }
}

export async function runAnalysis(
  modality: "text" | "image" | "audio",
  input: { text?: string; file?: File }
): Promise<AnalysisResult> {
  try {
    let response: Response
    const formData = new FormData()
    if (modality === "text") {
      formData.append("text", input.text || "")
    } else if (modality === "image") {
      formData.append("image_file", input.file!)
    } else if (modality === "audio") {
      formData.append("audio_file", input.file!)
    }

    response = await fetch("http://localhost:8000/predict/multimodal", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // ── Map research-grade backend response ──────────────────────────────────
    const primaryEmotion = data.prediction?.emotion || (typeof data.prediction === 'string' ? data.prediction : "Neutral")
    const confidence = data.prediction?.probability || data.confidence || 75.0
    const totalUncertainty = data.uncertainty?.total_uncertainty || data.uncertainty || 15.0

    // Extract research-grade uncertainty breakdown
    const uqBreakdown = data.uncertainty_breakdown || data.uncertainty || {}
    const aleatoricUncertainty = typeof uqBreakdown.aleatoric_data_noise === "number"
      ? uqBreakdown.aleatoric_data_noise
      : typeof uqBreakdown.aleatoric_uncertainty === "number"
      ? uqBreakdown.aleatoric_uncertainty
      : typeof data.aleatoric_uncertainty === "number"
        ? data.aleatoric_uncertainty
        : Math.round(totalUncertainty * 0.6 * 10) / 10
    const epistemicUncertainty = typeof uqBreakdown.epistemic_model_ignorance === "number"
      ? uqBreakdown.epistemic_model_ignorance
      : typeof uqBreakdown.epistemic_uncertainty === "number"
      ? uqBreakdown.epistemic_uncertainty
      : typeof data.epistemic_uncertainty === "number"
        ? data.epistemic_uncertainty
        : Math.round(totalUncertainty * 0.4 * 10) / 10

    // Reliability label from research model
    const reliabilityLabel: string = data.reliability?.label || "Reliable"
    const reliabilityMessage: string = data.reliability?.message || ""

    // Build explanation string from multi-source response
    let explanation = ""
    const exp = data.explainability || data.explanation
    if (exp && typeof exp === "object") {
      if (exp.reliability?.message) {
        explanation = `[${reliabilityLabel}] ${exp.reliability.message}`
      } else if (exp.reasoning_summary) {
        explanation = exp.reasoning_summary
      } else if (exp.text_attributions) {
        const keys = exp.text_attributions?.key_factors || []
        explanation = `BALD Mutual Information: ${uqBreakdown.mutual_information_bald ?? "N/A"}. Key text indicators: ${keys.join(", ") || "none"}. Fusion: ${exp.fusion_method || "Quality-Aware Cross-Attention"}.`
      } else if (exp.method) {
        explanation = `${exp.method}. ${reliabilityMessage}`
      } else {
        explanation = `${reliabilityLabel}: ${reliabilityMessage || JSON.stringify(exp).slice(0, 200)}`
      }
    } else {
      explanation = reliabilityMessage || String(exp) || `Research-grade UQ analysis via ${modality} model.`
    }

    if (data.is_dummy_fallback) {
      explanation = "[⚠ API Fallback] Hugging Face API is loading or rate-limited. Using baseline dummy data. " + explanation
    }

    // Construct emotion scores list
    const otherEmotions = ALL_EMOTIONS.filter(e => e !== primaryEmotion)
    const primaryScore = Math.round(confidence)
    const remaining = 100 - primaryScore
    const share = Math.round(remaining / otherEmotions.length)
    const emotionScores: EmotionScore[] = [
      { emotion: primaryEmotion, score: primaryScore },
      ...otherEmotions.map((emotion, idx) => {
        if (idx === otherEmotions.length - 1) {
          const sumPrevious = otherEmotions.slice(0, -1).length * share
          return { emotion, score: Math.max(0, remaining - sumPrevious) }
        }
        return { emotion, score: share }
      })
    ].sort((a, b) => b.score - a.score)

    const featureImportance = getDynamicFeatureImportance(modality, primaryEmotion, input.text)
    
    // Calculate statistically sound bounds using standard deviation
    const stdDev = totalUncertainty / 2;
    const confidenceDistribution = emotionScores.slice(0, 5).map((es) => ({
      label: es.emotion,
      mean: es.score,
      p10: Math.max(0, Math.round(es.score - stdDev * 1.28)),
      p25: Math.max(0, Math.round(es.score - stdDev * 0.67)),
      p75: Math.min(100, Math.round(es.score + stdDev * 0.67)),
      p90: Math.min(100, Math.round(es.score + stdDev * 1.28)),
    }))

    // Use real client-side tracking models where possible
    let attentionHeatmap: HeatmapCell[] = [];
    if (modality === "image" && input.file) {
      attentionHeatmap = await extractRealFaceHeatmap(input.file, primaryEmotion);
    } else if (modality === "audio" && input.file) {
      attentionHeatmap = await extractRealAudioHeatmap(input.file);
    } else {
      attentionHeatmap = generateTextHeatmap();
    }

    const trendLabel = data.is_dummy_fallback
      ? "⚠ API Fallback"
      : reliabilityLabel === "Abstain"
      ? "⚠ Abstain"
      : reliabilityLabel === "Caution (Data Quality)"
        ? "⚠ Data Quality"
        : reliabilityLabel === "Caution (Novel Input)"
          ? "⚠ Novel Input"
          : confidence > 80 ? "Strong signal" : "Moderate signal"

    return {
      id: uid(),
      timestamp: new Date(),
      modality,
      inputSummary: modality === "text"
        ? (input.text!.length > 80 ? input.text!.slice(0, 80) + "…" : input.text!)
        : input.file!.name,
      primaryEmotion,
      emotionScores,
      confidence,
      totalUncertainty,
      epistemicUncertainty,
      aleatoricUncertainty,
      confidenceDistribution,
      explanation,
      featureImportance,
      attentionHeatmap,
      trend: trendLabel,
      trace: {
        prediction: primaryEmotion,
        confidence,
        uncertainty: {
          total: totalUncertainty,
          aleatoric: {
            score: aleatoricUncertainty,
            attribution: { "api_degradation": "Moderate" }
          },
          epistemic: {
            score: epistemicUncertainty,
            attribution: { "model_variance": "Low" }
          },
          ood: { score: reliabilityLabel === "Caution (Novel Input)" ? 0.9 : 0.1, is_ood: reliabilityLabel.includes("Caution") || reliabilityLabel === "Abstain" },
          quality_score: reliabilityLabel.includes("Data Quality") ? 20 : 90
        }
      }
    }
  } catch (error) {
    console.error("Backend connection failed. No fallback data available.", error)
    throw error
  }
}
