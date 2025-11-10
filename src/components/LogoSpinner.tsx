import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box3,
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
} from 'three';

import useFileAvailability from '../hooks/useFileAvailability';
import { cn } from '../lib/cn';

const LOGO_MODEL_PATH = '/models/textured.glb';

// Stor, men med litt “pust” rundt kantene
const LOGO_SCALE = 5.2;
const BASE_SPIN_SPEED = 0.35;
const BOOSTED_SPIN_SPEED = 1.0;

type LogoSpinnerProps = {
  className?: string;
};

const ChromeJesneLogo = ({ boosted }: { boosted: boolean }) => {
  const group = useRef<Group>(null);
  const spinVelocity = useRef(BASE_SPIN_SPEED);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const boundingBox = new Box3().setFromObject(logo);
    const center = boundingBox.getCenter(new Vector3());
    const size = boundingBox.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    // Sentrer og skaler
    logo.position.sub(center);
    logo.scale.setScalar(LOGO_SCALE / maxDimension);

    // Ekstra shiny / chrome
    logo.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const originalMaterial = mesh.material;
        const materials = Array.isArray(originalMaterial) ? originalMaterial : [originalMaterial];

        materials.forEach((material) => {
          if (material && 'metalness' in material) {
            const physicalMaterial = material as MeshPhysicalMaterial | MeshStandardMaterial;
            physicalMaterial.metalness = Math.min(1, (physicalMaterial.metalness ?? 0.9) + 0.1);
            physicalMaterial.roughness = Math.max(0.03, (physicalMaterial.roughness ?? 0.35) * 0.55);
            physicalMaterial.envMapIntensity = Math.max(
              physicalMaterial.envMapIntensity ?? 1.5,
              2.8,
            );
            if ('clearcoat' in physicalMaterial) {
              physicalMaterial.clearcoat = 1;
              physicalMaterial.clearcoatRoughness = Math.min(
                0.06,
                Math.max(0.015, physicalMaterial.clearcoatRoughness ?? 0.03),
              );
            }
          }
        });
      }
    });

    return () => undefined;
  }, [logo]);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }

    const targetSpeed = boosted ? BOOSTED_SPIN_SPEED : BASE_SPIN_SPEED;
    spinVelocity.current = MathUtils.lerp(spinVelocity.current, targetSpeed, 0.08);
    const elapsed = state.clock.getElapsedTime();

    group.current.rotation.y += delta * spinVelocity.current;
    group.current.rotation.x = Math.sin(elapsed * 0.35) * 0.18;
    group.current.position.y = -0.15 + Math.sin(elapsed * 0.5) * 0.04;
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <primitive object={logo} dispose={null} />
    </group>
  );
};

const FallbackIcosahedron = () => {
  const meshRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = Math.sin(Date.now() / 2800) * 0.22;
  });

  return (
    <group ref={meshRef} scale={2.3}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.55} roughness={0.18} />
      </mesh>
    </group>
  );
};

const LogoSpinner = ({ className }: LogoSpinnerProps) => {
  const [boosted, setBoosted] = useState(false);
  const availability = useFileAvailability(LOGO_MODEL_PATH);
  const shouldUseFallback = availability !== 'available';

  return (
    <div
      className={cn(
        'relative aspect-[16/9] w-full max-w-3xl min-h-[200px] sm:max-w-4xl sm:min-h-[260px]',
        className,
      )}
      onPointerEnter={() => setBoosted(true)}
      onPointerLeave={() => setBoosted(false)}
    >
      <Canvas
        // Close enough to show the chrome, but with a little breathing room for the header layout
        camera={{ position: [0, 0.26, 6.5], fov: 32 }}
        dpr={[1.5, 3]}
        shadows
        gl={{ alpha: true, powerPreference: 'high-performance' }}
        className="!h-full !w-full [&>*]:!bg-transparent"
      >
        {/* Lys som gir blank metall-look uten harde skygger på kantene */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 6, 8]} intensity={1.7} />
        <directionalLight position={[-4, -3, -6]} intensity={0.6} />
        <pointLight position={[0, 3, 5]} intensity={0.6} color="#c7d2fe" />
        <pointLight position={[-3, -2, -4]} intensity={0.4} color="#e5e7eb" />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full border border-slate-200/60 bg-white/80 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-slate-500">
                Loading logo …
              </div>
            </Html>
          }
        >
          {shouldUseFallback ? <FallbackIcosahedron /> : <ChromeJesneLogo boosted={boosted} />}
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
};

useGLTF.preload(LOGO_MODEL_PATH);

export default LogoSpinner;
