import { asset } from "../asset";
import React, { useEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { Img, continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useThree } from "@react-three/fiber";

export type Skin = { map: string; metal?: string; image: string };

type Props = {
  model: string; // file in public/models
  skins: Skin[];
  swapEvery?: number; // frames per skin
  spin?: number; // radians per frame
  tilt?: number;
  scale?: number;
  enter?: number; // 0..1 entrance progress (drives zoom/rotation)
};

// ───────────── shared asset cache (parsed once, reused by every scene) ─────────────

const cache = new Map<string, Promise<unknown>>();
const once = <T,>(key: string, load: () => Promise<T>) => {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
};

const loadTex = (url: string, srgb: boolean) =>
  once(`tex:${url}:${srgb}`, () =>
    new THREE.TextureLoader().loadAsync(asset(url)).then((t) => {
      t.flipY = false;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }),
  );

const loadModel = (model: string) =>
  once(`glb:${model}`, () => new GLTFLoader().loadAsync(asset(`models/${model}`)).then((g) => g.scene));

const loadHdr = () => once("hdr", () => new RGBELoader().loadAsync(asset("environment.hdr")));

export const hasWebGL = (() => {
  let v: boolean | null = null;
  return () => {
    if (v === null) {
      try {
        const c = document.createElement("canvas");
        v = !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        v = false;
      }
    }
    return v;
  };
})();

// Warm every model/texture before playback starts (used by the web preview).
export const preloadKnives = () =>
  hasWebGL() && window.__knifeMode !== "2d"
    ? Promise.all([
        loadHdr(),
        ...["weapon_knife_karambit.glb", "weapon_knife_butterfly.glb"].map(loadModel),
        ...Object.values(KNIVES).flatMap((s) => [loadTex(s.map, true), s.metal ? loadTex(s.metal, false) : null]),
      ]).catch((e) => console.error(e))
    : Promise.resolve();

type Assets = {
  scene: THREE.Group;
  size: number;
  textures: { map: THREE.Texture; metal: THREE.Texture | null }[];
};

const useAssets = (model: string, skins: Skin[]) => {
  const [state, setState] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender(`knife ${model}`));

  useEffect(() => {
    Promise.all([
      loadModel(model),
      Promise.all(
        skins.map(async (s) => ({
          map: await loadTex(s.map, true),
          metal: s.metal ? await loadTex(s.metal, false) : null,
        })),
      ),
    ])
      .then(([base, textures]) => {
        const scene = base.clone(true);
        const box = new THREE.Box3().setFromObject(scene);
        scene.position.sub(box.getCenter(new THREE.Vector3()));
        const size = box.getSize(new THREE.Vector3()).length();
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) m.material = (m.material as THREE.MeshStandardMaterial).clone();
        });
        setState({ scene, size, textures });
        continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
};

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  const [handle] = useState(() => delayRender("hdr"));
  useEffect(() => {
    loadHdr()
      .then((t) => {
        const pmrem = new THREE.PMREMGenerator(gl);
        scene.environment = pmrem.fromEquirectangular(t).texture;
        pmrem.dispose();
      })
      .catch((e) => console.error(e))
      .finally(() => continueRender(handle));
  }, [gl, scene, handle]);
  return null;
};

const Knife: React.FC<Props & { assets: Assets }> = ({
  assets,
  swapEvery = 0,
  spin = 0.03,
  tilt = 0.35,
  scale = 1,
  enter = 1,
}) => {
  const frame = useCurrentFrame();
  const idx = swapEvery > 0 ? Math.floor(frame / swapEvery) % assets.textures.length : 0;
  const tex = assets.textures[idx];

  useMemo(() => {
    assets.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.map = tex.map;
      mat.metalnessMap = tex.metal;
      mat.envMapIntensity = 1.6;
      mat.needsUpdate = true;
    });
  }, [assets, tex]);

  const s = (7 / assets.size) * scale * (0.3 + 0.7 * enter);
  const entryTwist = (1 - enter) * Math.PI * 2.5;
  return (
    <group
      scale={s}
      rotation={[tilt + Math.sin(frame / 25) * 0.08, Math.PI + frame * spin + entryTwist, -0.25]}
      position={[0, Math.sin(frame / 18) * 0.25, 0]}
    >
      <primitive object={assets.scene} />
    </group>
  );
};

// Fallback when WebGL is unavailable: the skin's 2D render with a faux-3D turn.
const Knife2D: React.FC<Props> = ({ skins, swapEvery = 0, spin = 0.03, scale = 1, enter = 1 }) => {
  const frame = useCurrentFrame();
  const idx = swapEvery > 0 ? Math.floor(frame / swapEvery) % skins.length : 0;
  const turn = Math.sin(frame * spin * 1.2) * 28;
  const shine = ((frame * 14) % 1600) - 400;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", perspective: 1400 }}>
      <div
        style={{
          width: 900 * scale,
          transform: `rotateY(${turn + (1 - enter) * 540}deg) rotateZ(${-12 + Math.sin(frame / 25) * 4}deg) scale(${0.3 + 0.7 * enter}) translateY(${Math.sin(frame / 18) * 14}px)`,
          position: "relative",
          filter: "drop-shadow(0 30px 50px rgba(0,0,0,.7))",
        }}
      >
        <Img src={asset(skins[idx].image)} style={{ width: "100%", display: "block" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${shine / 16}%, rgba(255,255,255,.55) ${shine / 16 + 4}%, transparent ${shine / 16 + 9}%)`,
            WebkitMaskImage: `url(${asset(skins[idx].image)})`,
            maskImage: `url(${asset(skins[idx].image)})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
};

const Knife3DCanvas: React.FC<Props> = (props) => {
  const { width, height } = useVideoConfig();
  const assets = useAssets(props.model, props.skins);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 0, 16], fov: 38 }}
      dpr={window.__previewDpr ?? 1}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: true }}
    >
      <Env />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <directionalLight position={[-6, -2, 4]} intensity={1.2} color="#ffd27a" />
      <pointLight position={[0, 0, 8]} intensity={40} color="#ffffff" />
      {assets ? <Knife {...props} assets={assets} /> : null}
    </ThreeCanvas>
  );
};

export const Knife3D: React.FC<Props> = (props) =>
  hasWebGL() && window.__knifeMode !== "2d" ? <Knife3DCanvas {...props} /> : <Knife2D {...props} />;

export const KNIVES = {
  karambitDoppler: {
    map: "textures/weapon_knife_karambit/418.webp",
    metal: "textures/weapon_knife_karambit/doppler_metal.webp",
    image: "skins/weapon_knife_karambit-418.png",
  },
  karambitFade: {
    map: "textures/weapon_knife_karambit/38.png",
    metal: "textures/weapon_knife_karambit/38_metal.png",
    image: "skins/weapon_knife_karambit-38.png",
  },
  karambitMarble: {
    map: "textures/weapon_knife_karambit/413.png",
    metal: "textures/weapon_knife_karambit/413_metal.png",
    image: "skins/weapon_knife_karambit-413.png",
  },
  karambitCaseHardened: {
    map: "textures/weapon_knife_karambit/44.png",
    metal: "textures/weapon_knife_karambit/44_metal.png",
    image: "skins/weapon_knife_karambit-44.png",
  },
  butterflyGamma: {
    map: "textures/weapon_knife_butterfly/568.webp",
    metal: "textures/weapon_knife_butterfly/doppler_metal.webp",
    image: "skins/weapon_knife_butterfly-568.png",
  },
  butterflyFade: {
    map: "textures/weapon_knife_butterfly/38.png",
    metal: "textures/weapon_knife_butterfly/38_metal.png",
    image: "skins/weapon_knife_butterfly-38.png",
  },
} satisfies Record<string, Skin>;
