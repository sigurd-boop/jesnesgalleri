import React, { FC } from 'react';
import { Html, useThree } from '@react-three/drei';
import ResumeUI from './ResumeUI';
import { useUiState } from './useUiState';

interface Props {
  widthPx: number;
  heightPx: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ScreenHtml: FC<Props> = ({ widthPx, heightPx, position, rotation = [0, 0, 0], scale = 1 }) => {
  const { brightness, scanlines } = useUiState();
  const controls = useThree((state) => state.controls as { enabled: boolean } | undefined);

  return (
    <Html
      transform
      distanceFactor={1}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onPointerEnter={() => controls && (controls.enabled = false)}
      onPointerLeave={() => controls && (controls.enabled = true)}
    >
      <div style={{ width: widthPx, height: heightPx }} className="relative overflow-hidden">
        <div className="w-full h-full" style={{ filter: `brightness(${brightness})` }}>
          <ResumeUI />
        </div>
        {scanlines && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px,' +
                ' rgba(0,0,0,0.25) 1px, rgba(0,0,0,0.25) 2px)',
            }}
          />
        )}
      </div>
    </Html>
  );
};

export default ScreenHtml;

