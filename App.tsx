import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { JointState, AnalysisResult } from './types';
import Arm3D from './components/Arm3D';
import ControlPanel from './components/ControlPanel';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzePose } from './services/geminiService';

const App: React.FC = () => {
  // Initial joint state
  const [joints, setJoints] = useState<JointState>({
    shoulderX: 0,
    shoulderY: 0,
    shoulderZ: 0,
    elbow: 45,
    wrist: 0,
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleJointChange = (key: keyof JointState, value: number) => {
    setJoints(prev => ({ ...prev, [key]: value }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzePose(joints);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-50">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Arm3D joints={joints} />
          </Suspense>
        </Canvas>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-medical-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">BioMotion</h1>
            <p className="text-sm text-slate-500 font-medium">Musculoskeletal Simulator</p>
          </div>
        </div>
      </div>

      {/* Interactive Overlay UI */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col md:flex-row justify-between p-6 pt-24">
        
        {/* Left Side: Controls */}
        <div className="pointer-events-auto flex flex-col gap-4">
          <ControlPanel 
            joints={joints} 
            onChange={handleJointChange} 
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Right Side: Analysis (Only show if exists) */}
        <div className="pointer-events-auto flex flex-col gap-4 items-end mt-4 md:mt-0">
          {analysis && <AnalysisPanel result={analysis} />}
        </div>
      </div>

      {/* Loading Indicator for Scene */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-10 text-slate-400 text-xs">
        v1.0.0 • Powered by React Three Fiber & Gemini AI
      </div>
    </div>
  );
};

export default App;