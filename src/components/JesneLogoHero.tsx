import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { Box3, MeshPhysicalMaterial, Vector3 } from 'three';

import { Surface } from './Bits';

const LOGO_MODEL_PATH = '/models/jesne.glb';
const HDRI_PATH = '/hdr/studio_small_09_2k.hdr';
const LOGO_SCALE = 3.25;

const JesneEnvironment = () => {
  const [hasHdri, setHasHdri] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(HDRI_PATH, { method: 'HEAD' })
      .then((response) => {
        if (!mounted) {
          return;
        }

        if (response.ok) {
          setHasHdri(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasHdri(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return hasHdri ? <Environment files={HDRI_PATH} /> : <Environment preset="studio" />;
};

const JesneLogo = () => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);

  const createChromeMaterial = useCallback(
    () =>
      new MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.05,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.6,
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
    logo.position.sub(center);

    return () => {
      materials.forEach((material) => {
        material.dispose();
      });
    };
  }, [logo, createChromeMaterial]);

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x = Math.sin(Date.now() / 3500) * 0.18;
  });

  return (
    <group ref={group} scale={LOGO_SCALE} position={[0, -0.15, 0]}>
      <primitive object={logo} dispose={null} />
    </group>
  );
};

const JesneLogoHero = () => {
  return (
    <Surface className="relative h-[420px] overflow-hidden border-slate-200/70 bg-white/70 p-0">
      <Canvas camera={{ position: [0, 0.7, 6.8], fov: 32 }} dpr={[1, 2]} shadows>
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[6, 6, 8]} intensity={1.6} />
        <directionalLight position={[-4, -3, -6]} intensity={0.55} />
        <pointLight position={[0, 2.5, 4]} intensity={0.4} color="#c7d2fe" />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                Laster logo …
              </div>
            </Html>
          }
        >
          <JesneLogo />
          <JesneEnvironment />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/80 to-transparent" />
      <span className="sr-only">Roterende Jesné-logo</span>
    </Surface>
  );
};

useGLTF.preload(LOGO_MODEL_PATH);

export default JesneLogoHero;
