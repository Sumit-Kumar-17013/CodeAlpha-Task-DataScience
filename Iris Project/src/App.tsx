import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PredictionStudio } from './components/PredictionStudio';
import { PredictionResult } from './components/PredictionResult';
import { SpeciesShowcase } from './components/SpeciesShowcase';
import { ModelAnalytics } from './components/ModelAnalytics';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ApiDocsModal } from './components/ApiDocsModal';
import { Footer } from './components/Footer';
import { IrisFeatures, PredictionResponse } from './types';
import { FEATURE_BOUNDS, PRESET_SAMPLES } from './config';
import { predictSpecies, checkBackendHealth, getApiUrl } from './utils/apiService';
import { predictLocally } from './utils/mlEngine';

export default function App() {
  // Input dimensions state (default matches Setosa benchmark)
  const [features, setFeatures] = useState<IrisFeatures>({
    SepalLengthCm: FEATURE_BOUNDS.SepalLengthCm.default,
    SepalWidthCm: FEATURE_BOUNDS.SepalWidthCm.default,
    PetalLengthCm: FEATURE_BOUNDS.PetalLengthCm.default,
    PetalWidthCm: FEATURE_BOUNDS.PetalWidthCm.default
  });

  // Prediction and network state
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrlState] = useState<string>(getApiUrl());
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Initial setup: check backend health and run initial prediction preview
  useEffect(() => {
    // 1. Initial prediction so the specimen and cosmic portal are immediately active
    const initialResult = predictLocally(features);
    setPrediction(initialResult);

    // 2. Probe FastAPI backend at 127.0.0.1:8000
    checkBackendHealth().then((res) => {
      setBackendOnline(res.isOnline);
    });
  }, []);

  // Update a single feature dimension
  const handleUpdateFeature = (key: keyof IrisFeatures, value: number) => {
    setFeatures((prev) => ({ ...prev, [key]: value }));
  };

  // Perform prediction (via FastAPI or fallback)
  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send real HTTP POST to FastAPI backend with exact JSON payload
      const result = await predictSpecies(features, true);
      setPrediction(result);

      // If source was fastapi, confirm backend is online
      if (result.source === 'fastapi') {
        setBackendOnline(true);
      }
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
      // Fallback locally
      const localResult = predictLocally(features);
      setPrediction(localResult);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll helpers
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Apply a preset and automatically trigger prediction
  const handleApplyPreset = (customFeatures?: IrisFeatures) => {
    const target = customFeatures || PRESET_SAMPLES[1].features; // Versicolor typical as quick toggle
    setFeatures(target);
    const result = predictLocally(target);
    setPrediction(result);
    scrollToSection('prediction-studio');
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-white">
      
      {/* Top Navbar matching Orchid reference */}
      <Navbar
        onOpenDocs={() => setIsDocsOpen(true)}
        onScrollToPredict={() => scrollToSection('prediction-studio')}
        onScrollToSpecies={() => scrollToSection('species-showcase')}
        onScrollToAnalytics={() => scrollToSection('model-analytics')}
        isBackendOnline={backendOnline}
        apiUrl={apiUrl}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero Section with Cosmic Observatory Portal & Typography */}
        <HeroSection
          features={features}
          onUpdateFeature={handleUpdateFeature}
          onStartPrediction={() => scrollToSection('prediction-studio')}
          onApplyPreset={() => handleApplyPreset()}
          activeSpecies={prediction?.prediction}
        />

        {/* Interactive Prediction Console Studio */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <PredictionStudio
            features={features}
            onChange={setFeatures}
            onPredict={handlePredict}
            isLoading={isLoading}
            prediction={prediction}
            error={error}
            apiUrl={apiUrl}
            onOpenDocs={() => setIsDocsOpen(true)}
            backendOnline={backendOnline}
          />

          {/* Classification Result Display */}
          {prediction && (
            <PredictionResult
              prediction={prediction}
              features={features}
              onRetest={() => scrollToSection('prediction-studio')}
            />
          )}
        </section>

        {/* Species Showcase (Setosa, Versicolor, Virginica) */}
        <SpeciesShowcase
          onLoadPreset={(presetFeat) => handleApplyPreset(presetFeat)}
        />

        {/* Model Analytics & Notebook Telemetry (Confusion Matrix, Feature Importance) */}
        <ModelAnalytics />

        {/* Exploratory Data Analysis & Statistics */}
        <DatasetExplorer />

      </main>

      {/* Footer */}
      <Footer
        onOpenDocs={() => setIsDocsOpen(true)}
        onScrollToPredict={() => scrollToSection('prediction-studio')}
      />

      {/* FastAPI Docs & Configuration Modal */}
      <ApiDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onUrlUpdated={(newUrl) => {
          setApiUrlState(newUrl);
          checkBackendHealth(newUrl).then((res) => setBackendOnline(res.isOnline));
        }}
      />

    </div>
  );
}
