import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, useGLTF } from '@react-three/drei';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Group, Mesh } from 'three';
import { Box3, MeshPhysicalMaterial, Vector3 } from 'three';

import { Muted, Surface } from './Bits';
import {
  subscribeToGalleryItems,
  type GalleryItem,
} from '../lib/galleryRepository';
import { fallbackGalleryItems } from '../lib/galleryFallback';

const LOGO_MODEL_PATH = '/models/textured.glb';
const HDRI_PATH = '/hdr/studio_small_09_2k.hdr';
const LOGO_SCALE = 3.25;
const CAROUSEL_INTERVAL_MS = 6000;

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
        roughness: 0.04,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.7,
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

type CarouselSlide = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  gradient: string;
};

const createFallbackSlides = (): CarouselSlide[] => {
  const gradients = [
    'from-slate-200 via-white to-slate-100',
    'from-slate-900 via-slate-700 to-slate-900',
    'from-indigo-500 via-sky-500 to-cyan-400',
    'from-rose-500 via-orange-400 to-amber-300',
    'from-emerald-400 via-teal-400 to-sky-500',
  ];

  return fallbackGalleryItems.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    gradient: gradients[index % gradients.length],
  }));
};

const useGallerySlides = () => {
  const [items, setItems] = useState<GalleryItem[]>(fallbackGalleryItems);
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems(
      (nextItems) => {
        if (nextItems.length === 0) {
          setItems(fallbackGalleryItems);
          setUsingFallback(true);
          return;
        }

        setItems(nextItems);
        setUsingFallback(false);
      },
      () => {
        setItems(fallbackGalleryItems);
        setUsingFallback(true);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const slides = useMemo(() => {
    const withImages = items.filter((item) => item.imageUrl);

    if (withImages.length > 0) {
      return withImages.map<CarouselSlide>((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        gradient: 'from-slate-900/0 via-slate-900/30 to-slate-900/70',
      }));
    }

    return createFallbackSlides();
  }, [items]);

  return { slides, usingFallback };
};

const Carousel = () => {
  const { slides, usingFallback } = useGallerySlides();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((previous) => (previous + 1) % slides.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [slides]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">
        Legg til bilder i Firestore for å se en levende forhåndsvisning i heroen.
      </div>
    );
  }

  const activeSlide = slides[activeIndex];

  return (
    <div className="flex w-full flex-col gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-[1.25rem] border border-white/80 bg-slate-900/10">
          {activeSlide.imageUrl ? (
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${activeSlide.gradient}`} />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
            {usingFallback ? 'Forhåndsinnhold' : 'Fra galleriet'}
          </p>
          <p className="text-lg font-semibold text-slate-900">{activeSlide.title}</p>
          <Muted className="text-[0.8rem] text-slate-600">{activeSlide.description}</Muted>
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Vis ${slide.title}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index === activeIndex
                    ? 'bg-slate-900'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">
            <span>{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="h-px w-6 bg-slate-200" aria-hidden />
            <span>{String(slides.length).padStart(2, '0')}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const JesneLogoHero = () => {
  return (
    <Surface className="relative h-[460px] overflow-hidden border-slate-200/70 bg-white/70 p-0">
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
      <div className="pointer-events-auto absolute inset-x-6 bottom-6">
        <Carousel />
      </div>
      <span className="sr-only">Roterende Jesné-logo</span>
    </Surface>
  );
};

useGLTF.preload(LOGO_MODEL_PATH);

export default JesneLogoHero;
