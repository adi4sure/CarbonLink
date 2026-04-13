import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Central glowing Earth-like sphere made of points with fresnel edge glow.
 * Represents the global carbon ecosystem.
 */
export default function GlowingSphere({ radius = 2.2, detail = 48, mouseRef }) {
  const pointsRef = useRef();
  const glowRef = useRef();
  const ringRef = useRef();

  // Generate sphere points
  const { positions, colors, basePositions } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const pos = geo.attributes.position.array;
    const count = pos.length / 3;
    const colors = new Float32Array(count * 3);
    const basePositions = new Float32Array(pos);

    // Color gradient: cyan at equator, blue at poles
    for (let i = 0; i < count; i++) {
      const y = pos[i * 3 + 1] / radius; // -1 to 1
      const t = (y + 1) / 2;

      // Cyan-to-blue gradient
      colors[i * 3] = 0.05 + t * 0.05;        // R
      colors[i * 3 + 1] = 0.6 + t * 0.3;      // G
      colors[i * 3 + 2] = 0.8 + (1 - t) * 0.2; // B
    }

    return { positions: new Float32Array(pos), colors, basePositions };
  }, [radius, detail]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.08;
      pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;

      // Pulse effect — points breathe in and out
      const posArr = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < posArr.length / 3; i++) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];
        const noise = Math.sin(bx * 3 + t) * Math.cos(by * 3 + t * 0.7) * 0.03;
        const len = Math.sqrt(bx * bx + by * by + bz * bz);
        const scale = 1 + noise;
        posArr[i3] = (bx / len) * radius * scale;
        posArr[i3 + 1] = (by / len) * radius * scale;
        posArr[i3 + 2] = (bz / len) * radius * scale;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Glow sphere pulse
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.06;
      const pulse = 1 + Math.sin(t * 1.5) * 0.03;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }

    // Ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.15;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group>
      {/* Main point sphere */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Inner glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 0.98, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmospheric glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[radius * 1.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.3} />
      </mesh>

      {/* Second ring */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[radius * 1.8, 0.005, 16, 100]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.15} />
      </mesh>

      {/* Data point lights */}
      <pointLight position={[3, 2, 1]} color="#0ea5e9" intensity={2} distance={10} />
      <pointLight position={[-3, -1, 2]} color="#22d3ee" intensity={1.5} distance={8} />
      <pointLight position={[0, 3, -2]} color="#06b6d4" intensity={1} distance={8} />
    </group>
  );
}
