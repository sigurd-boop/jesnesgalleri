import React, { FC } from 'react';
import { Mesh } from 'three';

type Props = JSX.IntrinsicElements['group'] & {
  screenRef: React.Ref<Mesh>;
};

export const MonitorPlaceholder: FC<Props> = ({ screenRef, ...props }) => (
  <group {...props} dispose={null}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2.5, 2, 2]} />
      <meshStandardMaterial color="#777" />
    </mesh>
    <mesh ref={screenRef} position={[0, 0.2, 1.01]}>
      <planeGeometry args={[1.8, 1.2]} />
      <meshBasicMaterial color="black" />
    </mesh>
    <mesh position={[0, -1.3, 0.5]} castShadow>
      <boxGeometry args={[1.5, 0.3, 1]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  </group>
);

export default MonitorPlaceholder;

