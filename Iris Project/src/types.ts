/**
 * Type definitions for Iris Flower Classification
 */

export interface IrisFeatures {
  SepalLengthCm: number;
  SepalWidthCm: number;
  PetalLengthCm: number;
  PetalWidthCm: number;
}

export type IrisSpeciesName = 'Iris-setosa' | 'Iris-versicolor' | 'Iris-virginica';

export interface PredictionResponse {
  prediction: IrisSpeciesName;
  species: IrisSpeciesName;
  confidence?: number;
  probabilities?: {
    'Iris-setosa': number;
    'Iris-versicolor': number;
    'Iris-virginica': number;
  };
  model_name?: string;
  source?: 'fastapi' | 'local_engine';
  timestamp?: string;
}

export interface SpeciesInfo {
  id: IrisSpeciesName;
  name: string;
  displayName: string;
  scientificName: string;
  color: string;
  badgeBg: string;
  glowColor: string;
  accentGradient: string;
  description: string;
  petalLengthTypical: string;
  petalWidthTypical: string;
  sepalLengthTypical: string;
  sepalWidthTypical: string;
  keyDifferentiator: string;
}

export interface PresetSample {
  name: string;
  species: IrisSpeciesName;
  tag: string;
  features: IrisFeatures;
  description: string;
}

export interface ModelMetricsData {
  testAccuracy: number;
  cvMeanAccuracy: number;
  cvStd: number;
  algorithm: string;
  scaler: string;
  kernel: string;
  trainSize: number;
  testSize: number;
  totalSamples: number;
  confusionMatrix: number[][];
  classes: string[];
  featureImportance: {
    feature: string;
    label: string;
    importance: number;
    description: string;
  }[];
}
