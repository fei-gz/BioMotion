import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Muscle from './Muscle';
import { JointState } from '../types';

interface Arm3DProps {
  joints: JointState;
}

const BONE_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#f1f5f9",
  roughness: 0.4,
  metalness: 0.1,
});

const JOINT_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#cbd5e1",
  roughness: 0.5,
  metalness: 0.0,
});

const Arm3D: React.FC<Arm3DProps> = ({ joints }) => {
  // References for hierarchy
  const shoulderGroupRef = useRef<THREE.Group>(null);
  const elbowGroupRef = useRef<THREE.Group>(null);

  // References for Muscle Attachments
  const bShortOriginRef = useRef<THREE.Group>(null); // Biceps Short Head Origin
  const bLongOriginRef = useRef<THREE.Group>(null);  // Biceps Long Head Origin
  const bInsertRef = useRef<THREE.Group>(null);      // Common Biceps Insertion
  
  const tOriginRef = useRef<THREE.Group>(null); 
  const tInsertRef = useRef<THREE.Group>(null); 

  // References for Collision Avoidance Guides
  const bGuideRef = useRef<THREE.Group>(null); 
  const tGuideRef = useRef<THREE.Group>(null); 

  const [muscleCoords, setMuscleCoords] = useState({
    bShortStart: new THREE.Vector3(0,0,0),
    bLongStart: new THREE.Vector3(0,0,0),
    bEnd: new THREE.Vector3(0,0,0),
    bGuide: new THREE.Vector3(0,0,0),
    tStart: new THREE.Vector3(0,0,0),
    tEnd: new THREE.Vector3(0,0,0),
    tGuide: new THREE.Vector3(0,0,0),
  });

  useFrame(() => {
    if (
      bShortOriginRef.current && bLongOriginRef.current && bInsertRef.current && 
      tOriginRef.current && tInsertRef.current && 
      bGuideRef.current && tGuideRef.current
    ) {
      const bShortStart = new THREE.Vector3();
      const bLongStart = new THREE.Vector3();
      const bEnd = new THREE.Vector3();
      const bGuide = new THREE.Vector3();
      
      const tStart = new THREE.Vector3();
      const tEnd = new THREE.Vector3();
      const tGuide = new THREE.Vector3();

      bShortOriginRef.current.getWorldPosition(bShortStart);
      bLongOriginRef.current.getWorldPosition(bLongStart);
      bInsertRef.current.getWorldPosition(bEnd);
      bGuideRef.current.getWorldPosition(bGuide);

      tOriginRef.current.getWorldPosition(tStart);
      tInsertRef.current.getWorldPosition(tEnd);
      tGuideRef.current.getWorldPosition(tGuide);

      setMuscleCoords({ bShortStart, bLongStart, bEnd, bGuide, tStart, tEnd, tGuide });
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 1, 6]} fov={35} />
      <OrbitControls target={[0, -1.5, 0]} maxPolarAngle={Math.PI / 1.5} minDistance={3} maxDistance={12} />
      <Environment preset="studio" />
      
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-bias={-0.001} />
      <spotLight position={[-5, 5, 2]} intensity={0.5} />

      {/* --- ROOT: TORSO / SCAPULA --- */}
      <group position={[-1.0, 2.2, 0]}>
        
        <group position={[0, 0, 0]}>
           {/* Glenoid Fossa & Scapula Body */}
           <mesh rotation={[0, 0, Math.PI/2]} material={JOINT_MATERIAL}>
              <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
           </mesh>
           {/* Scapula Blade (Medial - Negative X) */}
           <mesh position={[-0.6, 0.2, 0]} rotation={[0, 0, -0.2]} material={BONE_MATERIAL}>
              <boxGeometry args={[1.2, 0.15, 0.6]} />
           </mesh>
           
           {/* Coracoid Process (Biceps Short Head Origin) */}
           {/* Anatomically: Projects Anteriorly from Medial side */}
           <mesh position={[-0.3, 0.5, 0.4]} rotation={[0.5, -0.2, 0]} material={BONE_MATERIAL}>
              <capsuleGeometry args={[0.08, 0.7, 8, 16]} />
           </mesh>
        </group>

        {/* === MUSCLE ORIGINS (Proximal) === */}
        
        {/* Biceps SHORT Head Origin: Coracoid Process (Medial) */}
        <group ref={bShortOriginRef} position={[-0.3, 0.6, 0.4]} />

        {/* Biceps LONG Head Origin: Supraglenoid Tubercle (Superior/Lateral) */}
        <group ref={bLongOriginRef} position={[0.1, 0.55, 0.0]} />
        
        {/* Triceps Origin: Infraglenoid Tubercle & Posterior Humerus */}
        <group ref={tOriginRef} position={[-0.1, -0.4, -0.3]} />


        {/* --- SHOULDER JOINT --- */}
        <group 
          ref={shoulderGroupRef} 
          position={[0, 0, 0]} 
          rotation={[
            THREE.MathUtils.degToRad(joints.shoulderX), 
            THREE.MathUtils.degToRad(joints.shoulderY), 
            THREE.MathUtils.degToRad(joints.shoulderZ)
          ]}
        >
          
          {/* HUMERUS BONE */}
          <group>
            <mesh position={[0, 0, 0]} material={BONE_MATERIAL}>
              <sphereGeometry args={[0.5, 32, 32]} />
            </mesh>
            {/* Shaft */}
            <mesh position={[0, -1.5, 0]} material={BONE_MATERIAL}>
              <cylinderGeometry args={[0.22, 0.18, 3, 20]} />
            </mesh>
            {/* Distal Condyles */}
            <mesh position={[0, -3.1, 0]} rotation={[0, 0, Math.PI/2]} material={BONE_MATERIAL}>
              <cylinderGeometry args={[0.25, 0.35, 0.8, 20]} />
            </mesh>

            {/* --- MUSCLE GUIDES (Pulleys) --- */}
            
            {/* Biceps Guide: Keeps muscle off the bone during contraction */}
            <group ref={bGuideRef} position={[0.1, -1.5, 0.4]} />
            
            {/* Triceps Guide */}
            <group ref={tGuideRef} position={[0, -2.0, -0.6]} />
          </group>

          {/* --- ELBOW JOINT --- */}
          {/* IMPORTANT: Negative rotation to flex FORWARD/UP for a downward hanging arm */}
          <group 
            ref={elbowGroupRef} 
            position={[0, -3.2, 0]} 
            rotation={[-THREE.MathUtils.degToRad(joints.elbow), 0, 0]}
          >
            {/* FOREARM */}
            <group>
              {/* ULNA (Main Forearm Bone - Stationary relative to elbow hinge) */}
              <group position={[-0.15, -1.4, 0]}>
                {/* Olecranon Process (Tip of Elbow) */}
                <mesh position={[0, 1.55, -0.15]} material={BONE_MATERIAL}>
                  <sphereGeometry args={[0.34, 32, 32]} />
                </mesh>
                {/* Ulna Shaft */}
                <mesh position={[0, 0, 0]} material={BONE_MATERIAL}>
                   <cylinderGeometry args={[0.1, 0.08, 2.8, 16]} />
                </mesh>

                {/* Triceps Insertion: Tip of Olecranon */}
                <group ref={tInsertRef} position={[0, 1.65, -0.2]} />
              </group>

              {/* RADIUS (Rotates for Pronation/Supination) */}
              <group 
                position={[0.2, -1.2, 0]} 
                rotation={[0, THREE.MathUtils.degToRad(joints.wrist), 0]} 
              >
                 {/* Radial Head */}
                 <mesh position={[0, 1.2, 0]} rotation={[Math.PI/2,0,0]} material={BONE_MATERIAL}>
                    <cylinderGeometry args={[0.15, 0.15, 0.15, 20]} />
                 </mesh>
                 {/* Radial Shaft */}
                 <mesh position={[0, -0.2, 0]} material={BONE_MATERIAL}>
                    <cylinderGeometry args={[0.11, 0.15, 2.4, 16]} />
                 </mesh>
                 
                 {/* Biceps Insertion: Radial Tuberosity (Medial side of Radius) */}
                 <group ref={bInsertRef} position={[-0.15, 0.9, 0.1]} />
              </group>

              {/* HAND */}
              <group rotation={[0, THREE.MathUtils.degToRad(joints.wrist), 0]} position={[0, -3.0, 0]}>
                <mesh position={[0, 0, 0]} material={BONE_MATERIAL}>
                  <boxGeometry args={[0.6, 0.7, 0.2]} />
                </mesh>
                <mesh position={[0.4, 0.1, 0]} rotation={[0,0,-0.5]} material={BONE_MATERIAL}>
                  <capsuleGeometry args={[0.08, 0.4]} />
                </mesh>
              </group>
              
            </group>
          </group>
        </group>
      </group>

      {/* --- MUSCLES --- */}
      
      {/* 
        BICEPS BRACHII - SHORT HEAD (Medial)
        Tendon Start reduced 0.1 -> 0.05
        Tendon End reduced 0.25 -> 0.15
      */}
      <Muscle 
        name="BicepsShort"
        start={muscleCoords.bShortStart} 
        end={muscleCoords.bEnd}
        controlPoint={muscleCoords.bGuide}
        color="#e11d48" 
        maxRadius={0.45} 
        restingLength={3.3} 
        tendonStart={0.05}
        tendonEnd={0.15}
        bulgeIntensity={2.2}
      />

      {/* 
        BICEPS BRACHII - LONG HEAD (Lateral)
        Tendon Start reduced 0.15 -> 0.08
        Tendon End reduced 0.25 -> 0.15
      */}
      <Muscle 
        name="BicepsLong"
        start={muscleCoords.bLongStart} 
        end={muscleCoords.bEnd}
        controlPoint={muscleCoords.bGuide}
        color="#e11d48" 
        maxRadius={0.42} 
        restingLength={3.4} 
        tendonStart={0.08}
        tendonEnd={0.15}
        bulgeIntensity={2.2}
      />

      {/* 
        TRICEPS BRACHII 
        bulgeIntensity = 0.0 -> No popping, stays flat.
        maxRadius = 0.20 -> Slender.
        Tendon percentages reduced.
      */}
      <Muscle 
        name="Triceps"
        start={muscleCoords.tStart} 
        end={muscleCoords.tEnd}
        controlPoint={muscleCoords.tGuide}
        color="#e11d48"
        maxRadius={0.20} 
        restingLength={2.5} 
        tendonStart={0.05}
        tendonEnd={0.1}
        bulgeIntensity={0.0} 
      />

      <ContactShadows opacity={0.3} scale={20} blur={2.5} far={10} position={[0, -5, 0]} />
      <gridHelper args={[20, 20, 0xe2e8f0, 0xf8fafc]} position={[0, -5, 0]} />
    </>
  );
};

export default Arm3D;