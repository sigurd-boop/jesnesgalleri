import React from 'react';
import Scene from '../3d/Scene';

export default function Page() {
  return (
    <>
      <Scene />
      <a
        href="/plain"
        className="fixed top-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded"
      >
        Skip 3D
      </a>
    </>
  );
}

