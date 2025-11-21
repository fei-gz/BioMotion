import React, { useRef, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';

interface MuscleProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  controlPoint?: THREE.Vector3; // The "Guide" point to bend around
  color: string;
  maxRadius: number;
  restingLength: number;
  tendonStart?: number; // Percentage of length that is tendon at start (0-1)
  tendonEnd?: number;   // Percentage of length that is tendon at end (0-1)
  bulgeIntensity?: number; // Multiplier for the bulging effect (def: 1.0). High = lots of deformation. Low = static shape.
  name?: string;
}

// Generate a procedural texture for muscle fibers
const createMuscleTexture = () => {
  if (typeof document === 'undefined') return null;
  
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base color (Tissue)
  ctx.fillStyle = '#909090'; 
  ctx.fillRect(0, 0, width, height);

  // Create striations
  const numLines = 60;
  ctx.globalAlpha = 0.15;
  
  for (let i = 0; i < numLines; i++) {
    const x = Math.random() * width;
    const widthLine = Math.random() * 10 + 2;
    
    // Vertical striations (along the muscle length)
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
    ctx.fillRect(x, 0, widthLine, height);
  }

  // Add noise/organic look
  for(let i=0; i<2000; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = Math.random() > 0.5 ? '#b0b0b0' : '#707070';
      ctx.fillRect(x, y, 2, 10);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1); 
  
  return texture;
};

const Muscle: React.FC<MuscleProps> = ({ 
  start, 
  end, 
  controlPoint, 
  color, 
  maxRadius, 
  restingLength,
  tendonStart = 0.1,
  tendonEnd = 0.15,
  bulgeIntensity = 1.0,
  name 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create texture once
  const fiberTexture = useMemo(() => createMuscleTexture(), []);

  // 1. Calculate the Curve path
  const curve = useMemo(() => {
    if (controlPoint) {
      return new THREE.QuadraticBezierCurve3(start, controlPoint, end);
    }
    return new THREE.LineCurve3(start, end);
  }, [start, end, controlPoint]);

  // 2. Calculate Physiology (Stretch/Compress)
  const currentLength = useMemo(() => curve.getLength(), [curve]);
  
  const bulgeFactor = useMemo(() => {
    const ratio = restingLength / Math.max(currentLength, 0.1);
    
    // Increase power sensitivity for more dramatic response
    const power = 2.5 * bulgeIntensity;
    
    // If bulgeIntensity is 0 (Triceps), power is 0, factor is 1.
    // This prevents dynamic swelling.
    let factor = Math.pow(ratio, power); 
    
    // Clamp visuals
    // Min 0.25: Allows getting very thin when stretched
    // Max 6.0: Cap deformation
    return Math.max(0.25, Math.min(factor, 6.0)); 
  }, [currentLength, restingLength, bulgeIntensity]);


  // 3. Create Geometry (Tube)
  const geometry = useMemo(() => {
    // 64 segments along length for smooth bending
    // 16 radial segments for slightly rounder look
    return new THREE.TubeGeometry(curve, 64, maxRadius, 16, false);
  }, [curve, maxRadius]);


  // 4. Apply Anatomical Tapering & Coloring
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const count = pos.count;
    const uvs = geo.attributes.uv;
    
    // Initialize Vertex Colors if needed
    if (!geo.attributes.color) {
      const colors = new Float32Array(count * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    const colorAttr = geo.attributes.color;

    const tendonColor = new THREE.Color('#fdfbf7'); // White tendon
    const bellyColor = new THREE.Color(color);      // Red muscle

    const tempPos = new THREE.Vector3();
    const tempPointOnCurve = new THREE.Vector3();
    const tempRadial = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      const u = uvs.getX(i); // 0.0 (Start) to 1.0 (End) along tube
      
      // --- SHAPE LOGIC ---
      let relativeRadius = 0.0;
      let colorMix = 0.0; // 0 = White (Tendon), 1 = Red (Muscle)

      // Define zones based on props
      const tStart = tendonStart;
      const tEnd = 1.0 - tendonEnd;

      if (u < tStart) {
        // Proximal Tendon - THINNER: 0.25 base + slight taper
        relativeRadius = 0.25 + (0.15 * (u / tStart)); 
        colorMix = 0.0;
      } else if (u > tEnd) {
        // Distal Tendon - THINNER: 0.25 base + slight taper
        relativeRadius = 0.25 + (0.15 * ((1 - u) / tendonEnd));
        colorMix = 0.0;
      } else {
        // Muscle Belly
        // Normalize u to 0-1 within the belly zone
        const bellyU = (u - tStart) / (tEnd - tStart);
        // Sine wave for round belly shape (0 -> 1 -> 0)
        const shapeProfile = Math.sin(bellyU * Math.PI);
        
        // Base thickness (0.4) + variable bulge.
        // 0.8 multiplier allows significant growth if bulgeFactor is high
        relativeRadius = 0.4 + (shapeProfile * 0.8 * bulgeFactor);
        
        // Soft color transition
        const transitionZone = 0.05; // Sharper transition for tendons
        if (u < tStart + transitionZone) {
            colorMix = (u - tStart) / transitionZone;
        } else if (u > tEnd - transitionZone) {
            colorMix = (tEnd - u) / transitionZone;
        } else {
            colorMix = 1.0;
        }
      }

      // Final Radius calculation
      const finalRadius = maxRadius * relativeRadius;

      // --- VERTEX DISPLACEMENT ---
      // 1. Get center point on curve at this u
      curve.getPointAt(u, tempPointOnCurve);
      
      // 2. Get current vertex position
      tempPos.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      
      // 3. Calculate vector from curve center to vertex (radial vector)
      tempRadial.subVectors(tempPos, tempPointOnCurve).normalize();
      
      // 4. Apply new radius
      tempPos.copy(tempPointOnCurve).addScaledVector(tempRadial, finalRadius);

      // 5. Update Position
      pos.setXYZ(i, tempPos.x, tempPos.y, tempPos.z);

      // --- COLOR ASSIGNMENT ---
      const finalColor = new THREE.Color().lerpColors(tendonColor, bellyColor, colorMix);
      colorAttr.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
    }
    
    pos.needsUpdate = true;
    colorAttr.needsUpdate = true;
    geo.computeVertexNormals();
    
  }, [geometry, curve, bulgeFactor, color, maxRadius, tendonStart, tendonEnd]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        vertexColors={true}
        roughness={0.4}
        metalness={0.15}
        bumpMap={fiberTexture || undefined}
        bumpScale={0.02} 
      />
    </mesh>
  );
};

export default Muscle;