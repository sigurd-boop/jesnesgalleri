import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, createElement, forwardRef, useRef } from 'react';

const Color = (props: any) => createElement('color', props);
const AmbientLight = (props: any) => createElement('ambientLight', props);
const DirectionalLight = (props: any) => createElement('directionalLight', props);
const IcosahedronGeometry = (props: any) => createElement('icosahedronGeometry', props);
const MeshStandardMaterial = (props: any) => createElement('meshStandardMaterial', props);

const Mesh = forwardRef<any, any>((props, ref) => createElement('mesh', { ...props, ref }));
Mesh.displayName = 'Mesh';

const FloatingIcosahedron = () => {
  const meshRef = useRef<any>(null);

  useFrame((_: unknown, delta: number) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x = Math.sin(Date.now() / 2000) * 0.25;
    }
  });

  return (
    <Mesh ref={meshRef} scale={0.9} castShadow>
      <IcosahedronGeometry args={[1.1, 1]} />
      <MeshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.2} />
    </Mesh>
  );
};

const LogoSpinner = () => {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/70 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.75)]">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        className="[&>*]:!bg-transparent"
      >
        <Color attach="background" args={["transparent"]} />
        <AmbientLight intensity={0.9} />
        <DirectionalLight position={[3, 3, 2]} intensity={1.3} />
        <DirectionalLight position={[-3, -2, -3]} intensity={0.45} />
        <Suspense fallback={null}>
          <FloatingIcosahedron />
        </Suspense>
        <Environment preset="city" />
      </Canvas>
      <span className="sr-only">Jesnes Galleri</span>
    </div>
  );
};

export default LogoSpinner;
