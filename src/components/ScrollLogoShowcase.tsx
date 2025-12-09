import { Canvas, useFrame } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box3, MathUtils, MeshPhysicalMaterial, Vector3, type Group, type Mesh, type Object3D } from 'three';

import logoModelUrl from '/models/textured.glb?url';

const LOGO_MODEL_PATH = logoModelUrl;

const ScrollLogoModel = ({
  isMobile,
  rotationTarget,
  onReady,
}: {
  isMobile: boolean;
  rotationTarget: React.MutableRefObject<{ x: number; y: number }>;
  onReady?: () => void;
}) => {
  const group = useRef<Group>(null);
  const hasCentered = useRef(false);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

  const createChromeMaterial = useCallback(
    () =>
      new MeshPhysicalMaterial({
        color: 0xf7f7f7,
        metalness: 1,
        roughness: 0.03,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.9,
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
        mesh.material = material;
        materials.push(material);
      }
    });

    const boundingBox = new Box3().setFromObject(logo);
    const center = boundingBox.getCenter(new Vector3());
    const size = boundingBox.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    logo.position.sub(center);

    const targetWidth = isMobile ? 8 : 6.4;
    const scaleFactor = targetWidth / maxDimension;
    logo.scale.setScalar(scaleFactor);

    hasCentered.current = true;
    
    // Notify parent that model is ready
    onReady?.();

    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [createChromeMaterial, isMobile, logo, onReady]);

  useFrame(() => {
    if (!group.current || !hasCentered.current) {
      return;
    }

    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, rotationTarget.current.x, 0.12);
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, rotationTarget.current.y, 0.12);
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <primitive object={logo} dispose={null} />
    </group>
  );
};

const ScrollLogoCanvas = ({
  rotationTarget,
}: {
  rotationTarget: React.MutableRefObject<{ x: number; y: number }>;
}) => {
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window === 'undefined' ? 1024 : window.innerWidth);
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Canvas
      camera={
        viewportWidth < 768
          ? { position: [0, 0.18, 5.8], fov: 38 }
          : { position: [0, 0.22, 5.2], fov: 38 }
      }
      dpr={[1, 2]}
      shadows
      gl={{ alpha: true }}
      className="h-full w-full"
      style={{
        backgroundColor: '#f1f5f9',
        visibility: isModelReady ? 'visible' : 'hidden',
      }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 6, 8]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -3, -6]} intensity={0.45} />
      <pointLight position={[0, 3, 4]} intensity={0.5} color="#c7d2fe" />
      <Suspense
        fallback={
          <Html center>
            <div className="rounded-full border border-slate-200/60 bg-white/90 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              Loading sculpture …
            </div>
          </Html>
        }
      >
        <ScrollLogoModel 
          isMobile={viewportWidth < 768} 
          rotationTarget={rotationTarget}
          onReady={() => setIsModelReady(true)}
        />
      </Suspense>
    </Canvas>
  );
};

const ScrollLogoShowcase = () => {
  const rotationTarget = useRef({ x: 0, y: 0 });
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const updateTarget = (event: React.PointerEvent) => {
    const surface = surfaceRef.current;
    if (!surface) {
      return;
    }
    const rect = surface.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    rotationTarget.current.y = nx * 0.8;
    rotationTarget.current.x = -ny * 0.6;
  };

  const resetTarget = () => {
    rotationTarget.current = { x: 0, y: 0 };
  };

  return (
    <div
      ref={surfaceRef}
      className="mx-auto h-[420px] w-full max-w-5xl md:h-[620px]"
      onPointerMove={updateTarget}
      onPointerLeave={resetTarget}
      onPointerDown={updateTarget}
      onPointerUp={resetTarget}
    >
      <ScrollLogoCanvas rotationTarget={rotationTarget} />
    </div>
  );
};

export default ScrollLogoShowcase;

useGLTF.preload(LOGO_MODEL_PATH);
