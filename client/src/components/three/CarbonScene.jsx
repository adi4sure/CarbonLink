import { useRef, useMemo, Suspense, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import ParticleField from './ParticleField';
import GlowingSphere from './GlowingSphere';
import SceneNavigation from './SceneNavigation';
import PostProcessing from './PostProcessing';
import CursorTrail from './CursorTrail';

/**
 * Camera controller — handles smooth transitions between scenes via GSAP.
 */
function CameraController({ sceneIndex, mouseRef }) {
  const { camera } = useThree();

  const scenes = useMemo(() => [
    { pos: [0, 0.5, 8], lookAt: [0, 0, 0] },     // Hero
    { pos: [-4, 1, 5], lookAt: [-5, 0, -2] },     // Features
    { pos: [0, 3, 3], lookAt: [0, 0, -2] },       // How it works
    { pos: [3, 0, 6], lookAt: [0, 0, 0] },        // Impact
    { pos: [0, 0.5, 5], lookAt: [0, 0, 0] },      // CTA
  ], []);

  useEffect(() => {
    const scene = scenes[sceneIndex] || scenes[0];
    gsap.to(camera.position, {
      x: scene.pos[0],
      y: scene.pos[1],
      z: scene.pos[2],
      duration: 2.2,
      ease: 'power2.inOut',
    });
  }, [sceneIndex, camera, scenes]);

  // Subtle mouse parallax
  useFrame(() => {
    if (!mouseRef?.current) return;
    const mouse = mouseRef.current;
    const scene = scenes[sceneIndex] || scenes[0];

    camera.position.x += (scene.pos[0] + mouse.x * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (scene.pos[1] + mouse.y * 0.15 - camera.position.y) * 0.02;

    camera.lookAt(
      scene.lookAt[0],
      scene.lookAt[1],
      scene.lookAt[2]
    );
  });

  return null;
}

/**
 * Feature cards floating in 3D space
 */
function FeatureCards() {
  const features = [
    { icon: '🌱', title: 'Submit Actions', desc: 'Log eco-activities with proof', pos: [-6, 1.5, -2] },
    { icon: '🤖', title: 'AI Verification', desc: 'Automated proof analysis', pos: [-6, 0.3, -1.5] },
    { icon: '🪙', title: 'Earn Credits', desc: 'Get CLC for verified actions', pos: [-6, -0.8, -2.5] },
    { icon: '📊', title: 'Marketplace', desc: 'Trade carbon credits P2P', pos: [-4.5, 1, -3.5] },
    { icon: '🔗', title: 'Blockchain', desc: 'Immutable transparency', pos: [-4.5, -0.2, -3] },
    { icon: '🌍', title: 'Global Impact', desc: 'Track worldwide offset', pos: [-4.5, -1.3, -3.5] },
  ];

  return (
    <group>
      {features.map((f, i) => (
        <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={0} floatIntensity={0.4}>
          <group position={f.pos}>
            <mesh>
              <planeGeometry args={[1.8, 0.7]} />
              <meshPhysicalMaterial
                color="#080818"
                transparent
                opacity={0.75}
                roughness={0.1}
                clearcoat={1}
              />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[1.84, 0.74]} />
              <meshBasicMaterial color="#0ea5e9" transparent opacity={0.06} />
            </mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

/**
 * Connecting lines/geometry for "How It Works" scene
 */
function TimelinePath() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      pts.push(new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * 2,
        3 - t * 6,
        -2 + t * -2
      ));
    }
    return pts;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.01, 8, false), [curve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
    </mesh>
  );
}

/**
 * Main CarbonScene — the complete 3D world.
 */
export default function CarbonScene({ onSceneChange }) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef();
  const scrollCooldown = useRef(false);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (scrollCooldown.current) return;
    const next = e.deltaY > 0
      ? Math.min(currentScene + 1, 4)
      : Math.max(currentScene - 1, 0);
    if (next !== currentScene) {
      scrollCooldown.current = true;
      setCurrentScene(next);
      onSceneChange?.(next);
      setTimeout(() => { scrollCooldown.current = false; }, 800);
    }
  }, [currentScene, onSceneChange]);

  const handleNavigate = useCallback((sceneIdx) => {
    setCurrentScene(sceneIdx);
    onSceneChange?.(sceneIdx);
  }, [onSceneChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ width: '100%', height: '100vh', position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          {/* Environment */}
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 10, 35]} />
          <ambientLight intensity={0.15} />

          {/* Stars background */}
          <Stars radius={30} depth={60} count={2000} factor={3} saturation={0.1} fade speed={0.5} />

          {/* Camera controller */}
          <CameraController sceneIndex={currentScene} mouseRef={mouseRef} />

          {/* Core elements */}
          <GlowingSphere mouseRef={mouseRef} />
          <ParticleField count={2500} mouseRef={mouseRef} />
          <CursorTrail mouseRef={mouseRef} />

          {/* Scene-specific elements */}
          <FeatureCards />
          <TimelinePath />

          {/* Navigation */}
          <SceneNavigation onNavigate={handleNavigate} activeScene={currentScene} />

          {/* Post-processing */}
          <PostProcessing bloomIntensity={1.2} />
        </Suspense>
      </Canvas>
    </div>
  );
}
