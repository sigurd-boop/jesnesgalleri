'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';
import MonitorGLB from './MonitorGLB';
import MonitorPlaceholder from './MonitorPlaceholder';
import ScreenHtml from './ScreenHtml';

export default function Scene() {
  const screenRef = useRef<Mesh>(null);

  return (
    <div className="w-screen h-screen">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [2.6, 1.8, 4.6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[5, 6, 5]}
          intensity={1.1}
          shadow-mapSize={[2048, 2048]}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        <Suspense fallback={<MonitorPlaceholder screenRef={screenRef} />}>
          <MonitorGLB screenRef={screenRef} />
        </Suspense>
        <ScreenHtml widthPx={800} heightPx={500} position={[0, 0.9, 0.53]} />
        <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  );
}

