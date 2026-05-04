import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Large glowing distorted sphere
const PrimaryOrb = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.15;
      ref.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={ref} args={[1.8, 128, 128]} position={[2.5, 0, -2]}>
        <MeshDistortMaterial
          color="#7c3aed"
          distort={0.45}
          speed={2.5}
          roughness={0.1}
          metalness={0.9}
          emissive="#3b0764"
          emissiveIntensity={0.4}
        />
      </Sphere>
    </Float>
  );
};

// Smaller secondary orb
const SecondaryOrb = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = -clock.getElapsedTime() * 0.2;
      ref.current.rotation.y = -clock.getElapsedTime() * 0.15;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
      <Sphere ref={ref} args={[1, 64, 64]} position={[-3, -1, -1]}>
        <MeshDistortMaterial
          color="#2563eb"
          distort={0.5}
          speed={3}
          roughness={0.05}
          metalness={1}
          emissive="#1e3a8a"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
};

// Tiny accent orb
const AccentOrb = () => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.5 + 1.5;
      ref.current.position.x = Math.cos(clock.getElapsedTime() * 0.5) * 0.5 + 1;
    }
  });
  return (
    <mesh ref={ref} position={[1, 1.5, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color="#f0abfc"
        emissive="#d946ef"
        emissiveIntensity={2}
        roughness={0}
        metalness={1}
      />
    </mesh>
  );
};

// Floating rings (torus)
const FloatingRing = ({ position, rotation, color }) => {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.3 + rotation[0];
      ref.current.rotation.y = clock.getElapsedTime() * 0.2 + rotation[1];
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.7, 0.06, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.1} metalness={0.9} />
    </mesh>
  );
};

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #020010 0%, #0d0a2e 50%, #020010 100%)' }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#c084fc" />
        <pointLight position={[-5, -5, -5]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[0, 5, 0]} intensity={1} color="#f0abfc" />

        {/* Stars deep background */}
        <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

        {/* Sparkles */}
        <Sparkles count={80} scale={12} size={3} speed={0.3} opacity={0.6} color="#c084fc" />
        <Sparkles count={40} scale={8} size={2} speed={0.5} opacity={0.4} color="#60a5fa" />

        {/* 3D Objects */}
        <PrimaryOrb />
        <SecondaryOrb />
        <AccentOrb />

        {/* Floating rings */}
        <FloatingRing position={[3.5, 1.5, -1]} rotation={[0.5, 0.3]} color="#7c3aed" />
        <FloatingRing position={[-3, 2, -2]} rotation={[1, 0.7]} color="#2563eb" />
        <FloatingRing position={[1, -2.5, -1]} rotation={[0.2, 1.2]} color="#d946ef" />
      </Canvas>
    </div>
  );
}
