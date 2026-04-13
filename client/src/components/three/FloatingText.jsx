import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';

/**
 * 3D floating text with gentle animation effects.
 */
export function FloatingTitle({ text, position = [0, 3.5, 0], fontSize = 0.6, color = '#ffffff' }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={fontSize}
      color={color}
      font="/fonts/Inter-Bold.woff"
      anchorX="center"
      anchorY="middle"
      maxWidth={10}
      textAlign="center"
      outlineWidth={0.005}
      outlineColor="#0ea5e9"
    >
      {text}
      <meshBasicMaterial transparent opacity={0.95} />
    </Text>
  );
}

/**
 * Subtitle with lighter styling and animation
 */
export function FloatingSubtitle({ text, position = [0, 2.6, 0], fontSize = 0.18, color = 'rgba(255,255,255,0.5)' }) {
  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
      <Text
        position={position}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        maxWidth={8}
        textAlign="center"
      >
        {text}
      </Text>
    </Float>
  );
}

/**
 * Stat counter floating in 3D space
 */
export function FloatingStat({ value, label, position, color = '#0ea5e9' }) {
  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
      <group position={position}>
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.3}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {value}
        </Text>
        <Text
          position={[0, -0.12, 0]}
          fontSize={0.08}
          color="rgba(255,255,255,0.35)"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}
