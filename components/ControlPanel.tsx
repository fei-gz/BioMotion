import React from 'react';
import { JointState } from '../types';

interface ControlPanelProps {
  joints: JointState;
  onChange: (key: keyof JointState, value: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (val: number) => void;
}> = ({ label, value, min, max, unit = "°", onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
      <span>{label}</span>
      <span className="text-medical-600">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-medical-500"
    />
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ joints, onChange, onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-medical-500"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 8v8"/><path d="M5 10v6"/><path d="M19 10v6"/><path d="M5 16h14"/><path d="M12 16v3"/><path d="M8 22h8"/></svg>
        Joint Controls
      </h2>
      
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shoulder Complex</h3>
        <Slider label="Flexion / Extension" value={joints.shoulderX} min={-60} max={180} onChange={(v) => onChange('shoulderX', v)} />
        <Slider label="Abduction / Adduction" value={joints.shoulderY} min={0} max={180} onChange={(v) => onChange('shoulderY', v)} />
        
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Elbow Complex</h3>
        <Slider label="Elbow Flexion" value={joints.elbow} min={0} max={145} onChange={(v) => onChange('elbow', v)} />
        
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Wrist</h3>
        <Slider label="Supination / Pronation" value={joints.wrist} min={-90} max={90} onChange={(v) => onChange('wrist', v)} />
      </div>

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all 
          ${isAnalyzing 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-medical-500 to-medical-600 hover:shadow-medical-500/30 hover:scale-[1.02] active:scale-95'
          }`}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Biomechanics...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            Analyze Current Pose
          </span>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;