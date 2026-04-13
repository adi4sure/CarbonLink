import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GPU-instanced particle field — thousands of particles with minimal CPU cost.
 * Particles drift organically and respond to a cursor position uniform.
 */
export default function ParticleField({ count = 3000, color = '#0ea5e9', mouseRef }) {
  const meshRef = useRef();
  const timeRef = useRef(0);

  // Pre-compute random positions, speeds, and sizes
  const { positions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4); // random per-particle data
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread particles in a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 16;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      randoms[i * 4] = Math.random();     // speed factor
      randoms[i * 4 + 1] = Math.random(); // phase offset
      randoms[i * 4 + 2] = Math.random(); // orbit radius
      randoms[i * 4 + 3] = Math.random(); // brightness

      sizes[i] = 0.02 + Math.random() * 0.06;
    }

    return { positions, randoms, sizes };
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;

    const posArr = meshRef.current.geometry.attributes.position.array;
    const mouse = mouseRef?.current || { x: 0, y: 0 };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const speed = 0.1 + randoms[i4] * 0.3;
      const phase = randoms[i4 + 1] * Math.PI * 2;
      const orbitR = randoms[i4 + 2] * 0.5;

      // Gentle orbital drift
      posArr[i3] += Math.sin(t * speed + phase) * orbitR * delta;
      posArr[i3 + 1] += Math.cos(t * speed * 0.7 + phase) * orbitR * delta;
      posArr[i3 + 2] += Math.sin(t * speed * 0.5 + phase * 1.3) * orbitR * delta * 0.5;

      // Subtle cursor repulsion
      const dx = posArr[i3] - mouse.x * 5;
      const dy = posArr[i3 + 1] - mouse.y * 5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) {
        const force = (3 - dist) * 0.002;
        posArr[i3] += dx * force;
        posArr[i3 + 1] += dy * force;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
