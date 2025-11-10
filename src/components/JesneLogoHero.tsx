import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box3, MeshPhysicalMaterial, Vector3, type Group, type Mesh } from 'three';

import { Surface } from './Bits';
import useFileAvailability from '../hooks/useFileAvailability';

const LOGO_MODEL_PATH = '/models/textured.glb';
const HDRI_PATH = '/hdr/studio_small_09_2k.hdr';
const LOGO_SCALE = 3.6;

const JesneEnvironment = () => {
  const availability = useFileAvailability(HDRI_PATH);
  const shouldUsePreset = availability !== 'available';

  return shouldUsePreset ? <Environment preset="studio" /> : <Environment files={HDRI_PATH} />;
};

const JesneLogo = () => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

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

    logo.traverse((child) => {
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

    const boundingBox = new Box3().setFromObject(logo);
    const center = boundingBox.getCenter(new Vector3());
    const size = boundingBox.getSize(new Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    logo.position.sub(center);
    logo.scale.setScalar(LOGO_SCALE / maxDimension);

    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [createChromeMaterial, logo]);

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y += delta * 0.32;
    group.current.rotation.x = Math.sin(Date.now() / 3600) * 0.16;
  });

  return (
    <group ref={group} position={[0, -0.18, 0]}>
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
    <group ref={meshRef} scale={2.8}>
      <mesh castShadow>
        <icosahedronGeometry args={[1.4, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.55} roughness={0.18} />
      </mesh>
    </group>
  );
};

const JesneLogoHero = () => {
  const availability = useFileAvailability(LOGO_MODEL_PATH);
  const shouldUseFallback = availability !== 'available';

  return (
    <Surface className="relative h-[460px] overflow-hidden border-slate-200/70 bg-white/50 p-0">
      <Canvas camera={{ position: [0, 0.65, 6.2], fov: 30 }} dpr={[1, 2]} shadows>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 6, 8]} intensity={1.6} />
        <directionalLight position={[-4, -3, -6]} intensity={0.55} />
        <pointLight position={[0, 2.5, 4]} intensity={0.45} color="#c7d2fe" />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                Laster logo …
              </div>
            </Html>
          }
        >
          {shouldUseFallback ? <FallbackIcosahedron /> : <JesneLogo />}
          <JesneEnvironment />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
      <span className="sr-only">Roterende Jesné-logo</span>
    </Surface>
  );
};

export default JesneLogoHero;
