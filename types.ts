export interface JointState {
  shoulderX: number; // Flexion/Extension
  shoulderY: number; // Abduction/Adduction
  shoulderZ: number; // Internal/External Rotation
  elbow: number;     // Flexion
  wrist: number;     // Supination/Pronation
}

export interface MuscleState {
  name: string;
  status: 'contracted' | 'relaxed' | 'stretched';
  strain: number; // 0 to 1
}

export interface AnalysisResult {
  title: string;
  biomechanics: string;
  muscles: string;
  clinicalNotes: string;
}