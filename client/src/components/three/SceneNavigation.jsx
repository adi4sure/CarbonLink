import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Holographic floating navigation panel in 3D space.
 */
function NavPanel({ label, icon, position, onClick, delay = 0 }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + delay) * 0.08;

    // Hover scale
    const targetScale = hovered ? 1.1 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    // Glow pulse on hover
    if (glowRef.current) {
      glowRef.current.material.opacity = hovered
        ? 0.15 + Math.sin(t * 3) * 0.05
        : 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
    >
      {/* Glass panel */}
      <RoundedBox args={[1.6, 0.5, 0.02]} radius={0.06} smoothness={4}>
        <meshPhysicalMaterial
          color="#0a0a1a"
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Glow border */}
      <mesh ref={glowRef}>
        <RoundedBox args={[1.64, 0.54, 0.01]} radius={0.07} smoothness={4}>
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} side={THREE.BackSide} />
        </RoundedBox>
      </mesh>

      {/* Icon */}
      <Text
        position={[-0.55, 0, 0.02]}
        fontSize={0.16}
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>

      {/* Label */}
      <Text
        position={[0.1, 0, 0.02]}
        fontSize={0.1}
        color={hovered ? '#38bdf8' : 'rgba(255,255,255,0.7)'}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Arrow indicator */}
      <Text
        position={[0.65, 0, 0.02]}
        fontSize={0.1}
        color={hovered ? '#0ea5e9' : 'rgba(255,255,255,0.2)'}
        anchorX="center"
        anchorY="middle"
      >
        →
      </Text>
    </group>
  );
}

/**
 * Navigation hub — floating holographic panels arranged around the scene.
 */
export default function SceneNavigation({ onNavigate, activeScene }) {
  const navItems = [
    { label: 'Features', icon: '⚡', offset: 0 },
    { label: 'How It Works', icon: '🔄', offset: 1 },
    { label: 'Impact', icon: '🌍', offset: 2 },
    { label: 'Get Started', icon: '🚀', offset: 3 },
  ];

  return (
    <group position={[5.5, 0.5, -1]}>
      {navItems.map((item, i) => (
        <NavPanel
          key={item.label}
          label={item.label}
          icon={item.icon}
          position={[0, -i * 0.65, 0]}
          delay={i * 0.5}
          onClick={() => onNavigate?.(i + 1)}
        />
      ))}
    </group>
  );
}
