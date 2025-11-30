import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box3,
  Cache,
  MeshPhysicalMaterial,
  Vector3,
  type Group,
  type Mesh,
  type Object3D,
} from 'three';

import useFileAvailability from '../hooks/useFileAvailability';
import { cn } from '../lib/cn';
import './LogoSpinner.css';

import logoModelUrl from '/models/textured.glb?url';
import { useLoadingManagerState } from '../lib/loadingManager';

const LOGO_MODEL_PATH = logoModelUrl;
const SPIN_SPEED = 0.32;

const getScaleFactor = (isMobile: boolean, maxDimension: number) => {
  const scale = isMobile ? 3.4 : 3.0;
  return scale / maxDimension;
};

const JesneLogo = ({ onReady }: { onReady?: () => void }) => {
  const group = useRef<Group>(null);
  const hasNotified = useRef(false);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

  // State to hold the current scale factor
  const [scale, setScale] = useState(1);

  // Memoize bounding box calculations to prevent re-running on every render
  const { center, maxDimension } = useMemo(() => {
    const box = new Box3().setFromObject(logo);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    return { center, maxDimension: Math.max(size.x, size.y, size.z) || 1 };
  }, [logo]);

  const createChromeMaterial = useCallback(
    () =>
      new MeshPhysicalMaterial({
        color: 0xf7f7f7,
        metalness: 1,
        roughness: 0.035,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.75,
      }),
    [],
  );

  useEffect(() => {
    const materials: MeshPhysicalMaterial[] = [];

    logo.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = createChromeMaterial();
        material.needsUpdate = true;
        mesh.material = material;
        materials.push(material);
      }
    });

    logo.position.sub(center);

    // Set initial scale based on window size
    const initialIsMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const initialScale = getScaleFactor(initialIsMobile, maxDimension);
    setScale(initialScale);
    logo.scale.setScalar(initialScale);

    if (!hasNotified.current) {
      hasNotified.current = true;
      onReady?.();
    }

    // Use a debounced resize handler for performance
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const isMobile = window.innerWidth < 640;
        const newScale = getScaleFactor(isMobile, maxDimension);
        setScale(newScale);
      }, 150); // 150ms delay
    };

    window.addEventListener('resize', handleResize);

    return () => {
      materials.forEach((material) => material.dispose());
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [createChromeMaterial, logo, onReady, center, maxDimension]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * SPIN_SPEED;
    group.current.rotation.x = Math.sin(Date.now() / 3600) * 0.16;
  });

  // Smoothly interpolate to the new scale on resize
  useFrame(() => {
    if (logo) logo.scale.lerp(new Vector3(scale, scale, scale), 0.1);
  });

  return (
    <group ref={group} position={[0, 0.3, 0]}>
      <primitive object={logo} dispose={null} />
    </group>
  );
};

const FallbackIcosahedron = () => {
  const meshRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = Math.sin(Date.now() / 2800) * 0.22;
  });

  return (
    <group ref={meshRef} scale={2.8} position={[0, 0.3, 0]}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.55}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
};

const LogoSpinner = ({ className }: { className?: string }) => {
  const availability = useFileAvailability(LOGO_MODEL_PATH);
  const shouldUseFallback = availability !== 'available';
  const [logoReady, setLogoReady] = useState(false);
  const { pending } = useLoadingManagerState();

  useEffect(() => {
    Cache.clear();
  }, []);

  useEffect(() => {
    if (shouldUseFallback) {
      setLogoReady(true);
    }
  }, [shouldUseFallback]);

  return (
    <div className={cn('logo-spinner-frame relative', className)}>
      <Canvas
        camera={{ position: [0, 0, 6.6], fov: 30 }}
        dpr={[1, 2]}
        shadows
        className="logo-spinner-canvas"
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 6, 8]} intensity={1.6} />
        <directionalLight position={[-4, -3, -6]} intensity={0.55} />
        <pointLight position={[0, 2.5, 4]} intensity={0.45} color="#c7d2fe" />
        <Suspense fallback={null}>
          <Environment preset="studio" background={false} />
        </Suspense>
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full border border-slate-200/60 bg-white/90 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                Loading logo …
              </div>
            </Html>
          }
        >
          {shouldUseFallback ? (
            <FallbackIcosahedron />
          ) : (
            <JesneLogo onReady={() => setLogoReady(true)} />
          )}
        </Suspense>
      </Canvas>
      {!shouldUseFallback ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white via-white/40 to-transparent transition-opacity duration-500',
            logoReady && pending === 0 ? 'opacity-0' : 'opacity-100',
          )}
          aria-hidden="true"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      ) : null}
      <span className="sr-only">Jesnes Galleri</span>
    </div>
  );
};

export default LogoSpinner;

useGLTF.preload(logoModelUrl);
