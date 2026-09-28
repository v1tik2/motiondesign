import React, { useEffect, useMemo, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useThree } from "@react-three/fiber";

export type Skin = { map: string; metal?: string };

type Props = {
  model: string; // file in public/models
  skins: Skin[];
  swapEvery?: number; // frames per skin
  spin?: number; // radians per frame
  tilt?: number;
  scale?: number;
  enter?: number; // 0..1 entrance progress (drives zoom/rotation)
};

const loadTex = (loader: THREE.TextureLoader, url: string, srgb: boolean) =>
  new Promise<THREE.Texture>((res, rej) =>
    loader.load(
      staticFile(url),
      (t) => {
        t.flipY = false;
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        res(t);
      },
      undefined,
      rej,
    ),
  );

const useAssets = (model: string, skins: Skin[]) => {
  const [state, setState] = useState<{
    scene: THREE.Group;
    size: number;
    textures: { map: THREE.Texture; metal: THREE.Texture | null }[];
  } | null>(null);
  const [handle] = useState(() => delayRender(`knife ${model}`));

  useEffect(() => {
    const tl = new THREE.TextureLoader();
    Promise.all([
      new Promise<THREE.Group>((res, rej) =>
        new GLTFLoader().load(staticFile(`models/${model}`), (g) => res(g.scene), undefined, rej),
      ),
      Promise.all(
        skins.map(async (s) => ({
          map: await loadTex(tl, s.map, true),
          metal: s.metal ? await loadTex(tl, s.metal, false) : null,
        })),
      ),
    ])
      .then(([scene, textures]) => {
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        scene.position.sub(center);
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
    const pmrem = new THREE.PMREMGenerator(gl);
    new RGBELoader().load(
      staticFile("environment.hdr"),
      (t) => {
        scene.environment = pmrem.fromEquirectangular(t).texture;
        t.dispose();
        continueRender(handle);
      },
      undefined,
      () => continueRender(handle),
    );
  }, [gl, scene, handle]);
  return null;
};

const Knife: React.FC<Props & { assets: NonNullable<ReturnType<typeof useAssets>> }> = ({
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

export const Knife3D: React.FC<Props> = (props) => {
  const { width, height } = useVideoConfig();
  const assets = useAssets(props.model, props.skins);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 0, 16], fov: 38 }}
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

export const KNIVES = {
  karambitDoppler: {
    map: "textures/weapon_knife_karambit/418.webp",
    metal: "textures/weapon_knife_karambit/doppler_metal.webp",
  },
  karambitFade: {
    map: "textures/weapon_knife_karambit/38.png",
    metal: "textures/weapon_knife_karambit/38_metal.png",
  },
  karambitMarble: {
    map: "textures/weapon_knife_karambit/413.png",
    metal: "textures/weapon_knife_karambit/413_metal.png",
  },
  karambitCaseHardened: {
    map: "textures/weapon_knife_karambit/44.png",
    metal: "textures/weapon_knife_karambit/44_metal.png",
  },
  butterflyGamma: {
    map: "textures/weapon_knife_butterfly/568.webp",
    metal: "textures/weapon_knife_butterfly/doppler_metal.webp",
  },
  butterflyFade: {
    map: "textures/weapon_knife_butterfly/38.png",
    metal: "textures/weapon_knife_butterfly/38_metal.png",
  },
  m9Tiger: {
    map: "textures/weapon_knife_m9_bayonet/409.png",
    metal: "textures/weapon_knife_m9_bayonet/409_metal.png",
  },
  m9Doppler: {
    map: "textures/weapon_knife_m9_bayonet/415.webp",
    metal: "textures/weapon_knife_m9_bayonet/doppler_metal.webp",
  },
} satisfies Record<string, Skin>;
