import React, { FC } from 'react';
import { Mesh } from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

type Props = JSX.IntrinsicElements['group'] & {
  screenRef: React.Ref<Mesh>;
};

interface GLTFResult extends GLTF {
  nodes: Record<string, unknown>;
  materials: Record<string, unknown>;
}

export const MonitorGLB: FC<Props> = ({ screenRef, ...props }) => {
  const { scene } = useGLTF('/models/monitor.glb') as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <primitive object={scene} />
      <mesh ref={screenRef} position={[0, 0.9, 0.53]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </group>
  );
};

useGLTF.preload('/models/monitor.glb');

export default MonitorGLB;

