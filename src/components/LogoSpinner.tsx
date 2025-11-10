import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  createElement,
} from 'react';
import * as THREE from 'three';

import useFileAvailability from '../hooks/useFileAvailability';
import { cn } from '../lib/cn';
import './LogoSpinner.css';

const LOGO_MODEL_PATH = '/models/textured.glb';

// Big shiny logo
const LOGO_SCALE = 3;
const BASE_SPIN_SPEED = 0.35;
const BOOSTED_SPIN_SPEED = 1.0;

type LogoSpinnerProps = {
  className?: string;
};

// JSX wrapper components to avoid TS "intrinsic" errors
const Group = (props: any) => createElement('group', props);
const Mesh = (props: any) => createElement('mesh', props);
const IcosahedronGeometry = (props: any) => createElement('icosahedronGeometry', props);
const MeshStandardMaterial = (props: any) => createElement('meshStandardMaterial', props);
const AmbientLight = (props: any) => createElement('ambientLight', props);
const DirectionalLight = (props: any) => createElement('directionalLight', props);
const PointLight = (props: any) => createElement('pointLight', props);

const ChromeJesneLogo = ({ boosted }: { boosted: boolean }) => {
  const group = useRef<any>(null);
  const spinVelocity = useRef(BASE_SPIN_SPEED);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const Box3 = (THREE as any).Box3;
    const Vector3 = (THREE as any).Vector3;

    const boundingBox = new Box3().setFromObject(logo);
    const center = boundingBox.getCenter(new Vector3());
    const size = boundingBox.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    // center + scale
    logo.position.sub(center);
    logo.scale.setScalar(LOGO_SCALE / maxDimension);

    // make materials extra chrome
    logo.traverse((child: any) => {
      if (child && child.isMesh) {
        const mesh = child as any;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const originalMaterial = mesh.material;
        const materials = Array.isArray(originalMaterial)
          ? originalMaterial
          : [originalMaterial];

        materials.forEach((material: any) => {
          if (material && 'metalness' in material) {
            material.metalness = 1;
            material.roughness = 0.05;
            material.envMapIntensity = 2.5;
            if ('clearcoat' in material) {
              material.clearcoat = 1;
              material.clearcoatRoughness = 0.04;
            }
          }
        });
      }
    });

    return () => undefined;
  }, [logo]);

  useFrame((state: any, delta: number) => {
    if (!group.current) return;

    const targetSpeed = boosted ? BOOSTED_SPIN_SPEED : BASE_SPIN_SPEED;
    spinVelocity.current = (THREE as any).MathUtils.lerp(
      spinVelocity.current,
      targetSpeed,
      0.08,
    );

    const elapsed = state.clock.getElapsedTime();
    group.current.rotation.y += delta * spinVelocity.current;
    group.current.rotation.x = Math.sin(elapsed * 0.35) * 0.18;
    group.current.position.y = -0.15 + Math.sin(elapsed * 0.5) * 0.04;
  });

  return (
    <Group ref={group} position={[0, -0.15, 0]}>
      <primitive object={logo} dispose={null} />
    </Group>
  );
};

const FallbackIcosahedron = () => {
  const meshRef = useRef<any>(null);

  useFrame((_: any, delta: number) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = Math.sin(Date.now() / 2800) * 0.22;
  });

  return (
    <Group ref={meshRef} scale={2.3}>
      <Mesh castShadow>
        <IcosahedronGeometry args={[1.2, 2]} />
        <MeshStandardMaterial color="#1e293b" metalness={0.55} roughness={0.18} />
      </Mesh>
    </Group>
  );
};

const LogoSpinner = ({ className }: LogoSpinnerProps) => {
  const [boosted, setBoosted] = useState(false);
  const availability = useFileAvailability(LOGO_MODEL_PATH);
  const shouldUseFallback = availability !== 'available';

  return (
    <figure
      className={cn('logo-spinner-frame relative mx-auto flex-shrink-0', className)}
      onPointerEnter={() => setBoosted(true)}
      onPointerLeave={() => setBoosted(false)}
    >
      <Canvas
        camera={{ position: [0, 0.18, 7], fov: 24 }}
        dpr={[1.5, 3]}
        shadows
        gl={{ alpha: true, powerPreference: 'high-performance' }}
        className="!h-full !w-full [&>*]:!bg-transparent"
      >
        <AmbientLight intensity={0.75} />
        <DirectionalLight position={[6, 6, 8]} intensity={1.7} />
        <DirectionalLight position={[-4, -3, -6]} intensity={0.6} />
        <PointLight position={[0, 3, 5]} intensity={0.6} color="#c7d2fe" />
        <PointLight position={[-3, -2, -4]} intensity={0.4} color="#e5e7eb" />
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
    </figure>
  );
};

useGLTF.preload(LOGO_MODEL_PATH);

export default LogoSpinner;
