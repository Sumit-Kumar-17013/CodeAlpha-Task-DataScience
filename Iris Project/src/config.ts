/**
 * Configuration for Orchid Iris ML Application
 * The API_URL can be modified here or overridden dynamically in the UI.
 */
import { IrisFeatures, ModelMetricsData, PresetSample, SpeciesInfo } from './types';

// Default FastAPI server URL for local development
export const DEFAULT_API_URL = 'http://127.0.0.1:8000';

export const FEATURE_BOUNDS = {
  SepalLengthCm: { min: 4.0, max: 8.5, step: 0.1, unit: 'cm', default: 5.1, mean: 5.84, std: 0.83 },
  SepalWidthCm:  { min: 2.0, max: 4.5, step: 0.1, unit: 'cm', default: 3.5, mean: 3.05, std: 0.43 },
  PetalLengthCm: { min: 1.0, max: 7.0, step: 0.1, unit: 'cm', default: 1.4, mean: 3.76, std: 1.76 },
  PetalWidthCm:  { min: 0.1, max: 2.6, step: 0.1, unit: 'cm', default: 0.2, mean: 1.20, std: 0.76 },
};

export const SPECIES_CATALOG: Record<string, SpeciesInfo> = {
  'Iris-setosa': {
    id: 'Iris-setosa',
    name: 'Iris setosa',
    displayName: 'Setosa',
    scientificName: 'Iris setosa Pall. ex Link',
    color: '#38BDF8', // Cyan / Sky Blue
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    accentGradient: 'from-sky-400 to-indigo-500',
    description: 'Characterized by distinctly diminutive petals and broad, delicate sepals. It is linearly separable from the other two species with 100% confidence.',
    petalLengthTypical: '1.0 – 1.9 cm',
    petalWidthTypical: '0.1 – 0.6 cm',
    sepalLengthTypical: '4.3 – 5.8 cm',
    sepalWidthTypical: '2.3 – 4.4 cm',
    keyDifferentiator: 'Very short and narrow petals (< 2 cm), often found in arctic/subalpine marshes.'
  },
  'Iris-versicolor': {
    id: 'Iris-versicolor',
    name: 'Iris versicolor',
    displayName: 'Versicolor',
    scientificName: 'Iris versicolor L.',
    color: '#34D399', // Emerald / Mint
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    accentGradient: 'from-emerald-400 to-teal-500',
    description: 'The blue flag iris with medium-sized petals and slender proportions. Forms an intermediate morphological bridge between Setosa and Virginica.',
    petalLengthTypical: '3.0 – 5.1 cm',
    petalWidthTypical: '1.0 – 1.8 cm',
    sepalLengthTypical: '4.9 – 7.0 cm',
    sepalWidthTypical: '2.0 – 3.4 cm',
    keyDifferentiator: 'Moderate petal length (~4 cm) and width (~1.3 cm), intermediate pigmentation.'
  },
  'Iris-virginica': {
    id: 'Iris-virginica',
    name: 'Iris virginica',
    displayName: 'Virginica',
    scientificName: 'Iris virginica L.',
    color: '#A855F7', // Purple / Violet
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    accentGradient: 'from-purple-400 to-pink-500',
    description: 'The Virginia iris boasts the largest, most robust petals and commanding sepals, flourishing in coastal wetlands and damp meadows.',
    petalLengthTypical: '4.5 – 6.9 cm',
    petalWidthTypical: '1.4 – 2.5 cm',
    sepalLengthTypical: '4.9 – 7.9 cm',
    sepalWidthTypical: '2.2 – 3.8 cm',
    keyDifferentiator: 'Substantial petal length (> 4.8 cm) and wide petal width (> 1.6 cm).'
  }
};

export const PRESET_SAMPLES: PresetSample[] = [
  {
    name: 'Setosa Benchmark',
    species: 'Iris-setosa',
    tag: 'Classic Sample #1',
    features: {
      SepalLengthCm: 5.1,
      SepalWidthCm: 3.5,
      PetalLengthCm: 1.4,
      PetalWidthCm: 0.2
    },
    description: 'Standard benchmark sample directly from Ronald Fisher’s 1936 dataset.'
  },
  {
    name: 'Versicolor Typical',
    species: 'Iris-versicolor',
    tag: 'Typical Sample #60',
    features: {
      SepalLengthCm: 5.9,
      SepalWidthCm: 3.0,
      PetalLengthCm: 4.2,
      PetalWidthCm: 1.5
    },
    description: 'Balanced intermediate measurements representative of Iris-versicolor.'
  },
  {
    name: 'Virginica Robust',
    species: 'Iris-virginica',
    tag: 'Prominent Sample #120',
    features: {
      SepalLengthCm: 6.9,
      SepalWidthCm: 3.1,
      PetalLengthCm: 5.4,
      PetalWidthCm: 2.1
    },
    description: 'Elongated petals and wide profile indicative of robust Virginica.'
  },
  {
    name: 'Boundary Test Case',
    species: 'Iris-versicolor',
    tag: 'Borderline Case',
    features: {
      SepalLengthCm: 6.0,
      SepalWidthCm: 2.7,
      PetalLengthCm: 5.1,
      PetalWidthCm: 1.6
    },
    description: 'A borderline sample between Versicolor and Virginica to test SVM boundary decision.'
  }
];

export const NOTEBOOK_MODEL_METRICS: ModelMetricsData = {
  testAccuracy: 0.9667,
  cvMeanAccuracy: 0.9667,
  cvStd: 0.0312,
  algorithm: 'Support Vector Machine (SVC)',
  scaler: 'StandardScaler',
  kernel: 'Radial Basis Function (RBF)',
  trainSize: 120,
  testSize: 30,
  totalSamples: 150,
  classes: ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'],
  confusionMatrix: [
    [10, 0, 0], // Setosa: 10/10 correct
    [0, 9, 1],  // Versicolor: 9/10 correct, 1 misclassified as Virginica
    [0, 0, 10]  // Virginica: 10/10 correct
  ],
  featureImportance: [
    {
      feature: 'PetalWidthCm',
      label: 'Petal Width',
      importance: 0.297,
      description: 'Primary discriminatory metric with highest permutation score'
    },
    {
      feature: 'PetalLengthCm',
      label: 'Petal Length',
      importance: 0.240,
      description: 'Second strongest separating boundary between species'
    },
    {
      feature: 'SepalWidthCm',
      label: 'Sepal Width',
      importance: 0.063,
      description: 'Moderate influence, mainly differentiates Setosa vs others'
    },
    {
      feature: 'SepalLengthCm',
      label: 'Sepal Length',
      importance: 0.007,
      description: 'Lower individual weight due to cross-correlation with petal metrics'
    }
  ]
};
