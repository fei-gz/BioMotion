import { GoogleGenAI, Type } from "@google/genai";
import { JointState, AnalysisResult } from '../types';

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePose = async (joints: JointState): Promise<AnalysisResult> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a senior orthopedic surgeon and biomechanics expert.
    Analyze the following human arm joint configuration:
    
    - Shoulder Flexion/Extension: ${joints.shoulderX} degrees
    - Shoulder Abduction: ${joints.shoulderY} degrees
    - Elbow Flexion: ${joints.elbow} degrees (0 is straight, 140 is fully bent)
    - Wrist Rotation: ${joints.wrist} degrees
    
    Provide a structured medical analysis suitable for a student or patient education.
    Focus on the Biceps Brachii and Triceps Brachii physiology based on these angles.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            biomechanics: { type: Type.STRING, description: "Description of the skeletal movement and range of motion." },
            muscles: { type: Type.STRING, description: "Detailed state of Biceps and Triceps (eccentric vs concentric contraction)." },
            clinicalNotes: { type: Type.STRING, description: "Potential risks, exercises, or clinical relevance of this pose." }
          },
          required: ["title", "biomechanics", "muscles", "clinicalNotes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      title: "Analysis Unavailable",
      biomechanics: "Unable to connect to the biomechanics engine.",
      muscles: "Data unavailable.",
      clinicalNotes: "Please check your API connection."
    };
  }
};