import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box3, MeshPhysicalMaterial, Vector3, type Group, type Mesh } from 'three';

const LOGO_MODEL_PATH = '/models/textured.glb';
const LOGO_SCALE = 1.4;

const ChromeJesneLogo = () => {
  const { scene } = useGLTF(LOGO_MODEL_PATH);
  const logo = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<Group>(null);

  const createChromeMaterial = useCallback(
    () =>
      new MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.05,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.4,
      }),
    [],
  );

  useEffect(() => {
    const materials: MeshPhysicalMaterial[] = [];

    logo.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
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

    group.current.rotation.y += delta * 0.6;
    group.current.rotation.x = Math.sin(Date.now() / 2500) * 0.22;
  });

  return (
    <group ref={group}>
      <primitive object={logo} dispose={null} />
    </group>
  );
};

const LogoSpinner = () => {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/70 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.75)]">
      <Canvas
        camera={{ position: [0, 0.4, 4], fov: 32 }}
        dpr={[1, 2]}
        className="[&>*]:!bg-transparent"
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 3, 2]} intensity={1.3} />
        <directionalLight position={[-3, -2, -3]} intensity={0.45} />
        <pointLight position={[0, 2, 2]} intensity={0.4} color="#c7d2fe" />
        <Suspense fallback={null}>
          <ChromeJesneLogo />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
      <span className="sr-only">Jesnes Galleri</span>
    </div>
  );
};

useGLTF.preload(LOGO_MODEL_PATH);

export default LogoSpinner;
