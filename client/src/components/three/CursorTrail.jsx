import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Mouse cursor trail — particles spawn at cursor position and fade out.
 */
export default function CursorTrail({ mouseRef, count = 50, color = '#22d3ee' }) {
  const pointsRef = useRef();
  const trailIndex = useRef(0);

  const positions = useMemo(() => new Float32Array(count * 3).fill(0), [count]);
  const opacities = useMemo(() => new Float32Array(count).fill(0), [count]);
  const sizes = useMemo(() => new Float32Array(count).fill(0.02), [count]);

  useFrame(() => {
    if (!pointsRef.current || !mouseRef?.current) return;

    const mouse = mouseRef.current;
    const idx = trailIndex.current % count;

    // Place new particle at cursor position
    positions[idx * 3] = mouse.x * 6;
    positions[idx * 3 + 1] = mouse.y * 4;
    positions[idx * 3 + 2] = 0;
    opacities[idx] = 1;
    sizes[idx] = 0.06;

    trailIndex.current++;

    // Fade all particles
    for (let i = 0; i < count; i++) {
      opacities[i] *= 0.96;
      sizes[i] *= 0.98;

      // Drift particles slightly upward
      positions[i * 3 + 1] += 0.005;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={[0, 0, 2]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
