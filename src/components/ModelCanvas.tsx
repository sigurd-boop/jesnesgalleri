import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { Component, Suspense, createElement, type ReactNode, useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { Box3, Vector3 } from 'three';

import { Surface } from './Bits';

const CAMERA_POSITION: [number, number, number] = [0, 1.6, 5.2];
const CAMERA_FOV = 35;
const MODEL_TARGET_SIZE = 2.4;

const Primitive = ({ children, ...props }: any) => createElement('primitive', props, children);
const Color = ({ children, ...props }: any) => createElement('color', props, children);
const AmbientLight = ({ children, ...props }: any) => createElement('ambientLight', props, children);
const DirectionalLight = ({ children, ...props }: any) =>
  createElement('directionalLight', props, children);
const Mesh = ({ children, ...props }: any) => createElement('mesh', props, children);
const IcosahedronGeometry = ({ children, ...props }: any) => createElement('icosahedronGeometry', props, children);
const MeshStandardMaterial = ({ children, ...props }: any) =>
  createElement('meshStandardMaterial', props, children);

type ModelProps = {
  modelPath: string;
  animated?: boolean;
};

const RotatingModel = ({ modelPath, animated = true }: ModelProps) => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);
  const model = useMemo(() => scene.clone(true), [scene]);

  useFrame((_: unknown, delta: number) => {
    if (group.current && animated) {
      group.current.rotation.y += delta * 0.35;
    }
  });

  useEffect(() => {
    const boundingBox = new Box3().setFromObject(model);
    const size = boundingBox.getSize(new Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = maxAxis > 0 ? MODEL_TARGET_SIZE / maxAxis : 1;

    model.scale.setScalar(scale);

    const center = boundingBox.getCenter(new Vector3());
    model.position.sub(center);

    return () => {
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
    };
  }, [model]);

  return (
    <Primitive ref={group} object={model} dispose={null} />
  );
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error): void {
    console.error('Unable to load the GLB model', error);
  }

  public componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

type ModelCanvasProps = {
  modelPath: string;
  animated?: boolean;
};

const ModelCanvas = ({ modelPath, animated = true }: ModelCanvasProps) => {
  return (
    <ModelErrorBoundary
      resetKey={modelPath}
      fallback={
        <Surface className="flex h-80 w-full items-center justify-center bg-white/60 text-center text-sm text-slate-500">
          Could not find the model. Drop a GLB file in <code className="font-mono text-xs">public/models</code> and update
          the gallery configuration.
        </Surface>
      }
    >
      <Surface className="h-80 w-full overflow-hidden border-slate-200/80 bg-white/80 p-0">
        <Canvas camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }} dpr={[1, 2]}>
          <Color attach="background" args={["#f8fafc"]} />
          <AmbientLight intensity={0.75} />
          <DirectionalLight position={[3, 4, 3]} intensity={1.1} />
          <DirectionalLight position={[-3, -2, -4]} intensity={0.25} />
          <Suspense
            fallback={
              <Mesh>
                <IcosahedronGeometry args={[1.1, 1]} />
                <MeshStandardMaterial color="#cbd5f5" wireframe />
              </Mesh>
            }
          >
            <RotatingModel modelPath={modelPath} animated={animated} />
          </Suspense>
          <Environment preset="apartment" />
        </Canvas>
      </Surface>
    </ModelErrorBoundary>
  );
};

export default ModelCanvas;
