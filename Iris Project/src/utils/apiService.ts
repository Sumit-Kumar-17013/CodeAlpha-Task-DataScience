/**
 * API Service for communicating with the FastAPI Iris prediction backend
 */
import { DEFAULT_API_URL } from '../config';
import { IrisFeatures, IrisSpeciesName, PredictionResponse } from '../types';
import { predictLocally } from './mlEngine';

// Local storage key for custom user-configured API URL
const API_URL_STORAGE_KEY = 'orchid_iris_api_url';

/**
 * Get current configured API Base URL
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(API_URL_STORAGE_KEY);
    if (saved) return saved;
  }
  return DEFAULT_API_URL;
}

/**
 * Update configured API Base URL
 */
export function setApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    // Sanitize trailing slash
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem(API_URL_STORAGE_KEY, cleaned);
  }
}

/**
 * Reset API URL to default (http://127.0.0.1:8000)
 */
export function resetApiUrl(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_URL_STORAGE_KEY);
  }
}

/**
 * Check backend health/availability
 */
export async function checkBackendHealth(customUrl?: string): Promise<{
  isOnline: boolean;
  message: string;
  statusCode?: number;
}> {
  const baseUrl = customUrl || getApiUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    // Attempt pinging health endpoint, root, or docs
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    }).catch(() => {
      // Fallback try root endpoint
      return fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
    });

    clearTimeout(timeoutId);

    if (res && (res.ok || res.status === 200 || res.status === 404)) {
      return {
        isOnline: true,
        message: `FastAPI connected at ${baseUrl}`,
        statusCode: res.status
      };
    }

    return {
      isOnline: false,
      message: `Endpoint returned status ${res?.status || 'Unknown'}`
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      isOnline: false,
      message: err.name === 'AbortError' 
        ? `Connection timed out (${baseUrl})`
        : `Could not reach ${baseUrl}. Ensure uvicorn is running.`
    };
  }
}

/**
 * Predict species via FastAPI endpoint
 * Endpoint: POST {API_URL}/predict
 * Payload matches user's notebook features exactly:
 * {
 *   "SepalLengthCm": 5.1,
 *   "SepalWidthCm": 3.5,
 *   "PetalLengthCm": 1.4,
 *   "PetalWidthCm": 0.2
 * }
 */
export async function predictSpecies(
  features: IrisFeatures,
  useLocalFallbackIfOffline: boolean = true
): Promise<PredictionResponse> {
  const baseUrl = getApiUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  // Exact payload as specified in notebook and prompt
  const payload = {
    SepalLengthCm: Number(features.SepalLengthCm),
    SepalWidthCm: Number(features.SepalWidthCm),
    PetalLengthCm: Number(features.PetalLengthCm),
    PetalWidthCm: Number(features.PetalWidthCm)
  };

  try {
    const response = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(
        `FastAPI server returned HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    const data = await response.json();

    // Standardize possible response formats from FastAPI implementations
    // 1. { "prediction": "Iris-setosa" }
    // 2. { "species": "Iris-setosa", "confidence": 0.98 }
    // 3. { "predicted_class": 0, "class_name": "Iris-setosa" }
    // 4. "Iris-setosa"
    let predictedName: IrisSpeciesName = 'Iris-setosa';

    if (typeof data === 'string') {
      predictedName = mapToSpeciesName(data);
    } else if (data && typeof data === 'object') {
      const rawPrediction = data.prediction || data.species || data.predicted_species || data.class_name || data.result;
      if (rawPrediction) {
        predictedName = mapToSpeciesName(String(rawPrediction));
      } else if (typeof data.predicted_class === 'number') {
        const classNames: IrisSpeciesName[] = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'];
        predictedName = classNames[data.predicted_class] || 'Iris-setosa';
      }
    }

    // Compute or pull confidence / probabilities
    const localCalc = predictLocally(features);

    return {
      prediction: predictedName,
      species: predictedName,
      confidence: data.confidence || localCalc.confidence,
      probabilities: data.probabilities || localCalc.probabilities,
      model_name: data.model_name || 'FastAPI Support Vector Classifier (Pipeline)',
      source: 'fastapi',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    // If local fallback is enabled, return local engine prediction with informative notice
    if (useLocalFallbackIfOffline) {
      console.warn(
        `FastAPI at ${baseUrl} is unavailable (${error.message}). Falling back to local ML inference engine.`
      );
      const localResult = predictLocally(features);
      return {
        ...localResult,
        source: 'local_engine',
        model_name: 'Local Support Vector Classifier (FastAPI Offline)'
      };
    }

    throw new Error(
      `FastAPI Connection Error (${baseUrl}/predict): ${error.message}. Please verify uvicorn is running.`
    );
  }
}

/**
 * Normalizes any variation of species string into valid IrisSpeciesName
 */
function mapToSpeciesName(raw: string): IrisSpeciesName {
  const lower = raw.toLowerCase().trim();
  if (lower.includes('setosa')) return 'Iris-setosa';
  if (lower.includes('versicolor')) return 'Iris-versicolor';
  if (lower.includes('virginica')) return 'Iris-virginica';
  return 'Iris-setosa';
}
