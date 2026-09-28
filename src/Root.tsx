import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL, WIDTH, loadFonts } from "./theme";
import { KnifeChance } from "./KnifeChance";
import { KnifeChanceLight } from "./light/KnifeChanceLight";
import { LT, loadLightFonts } from "./light/tokens";
import { Knife3D, KNIVES } from "./components/Knife3D";

loadFonts();
loadLightFonts();

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="KnifeChance"
      component={KnifeChance}
      durationInFrames={TOTAL}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withSound: true }}
    />
    <Composition
      id="KnifeChanceLight"
      component={KnifeChanceLight}
      durationInFrames={LT.total}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withSound: true }}
    />
    <Composition
      id="KnifeChanceLightEN"
      component={KnifeChanceLight}
      durationInFrames={LT.total}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ withSound: true, lang: "en" as const }}
    />
    {/* Pre-rendered to a transparent PNG sequence (public/butterfly/) for the light reel's hook. */}
    <Composition
      id="ButterflySpin"
      component={() => (
        <Knife3D model="weapon_knife_butterfly.glb" skins={[KNIVES.butterflyFade]} spin={2 * Math.PI / 90} tilt={0.3} scale={1.25} />
      )}
      durationInFrames={90}
      fps={FPS}
      width={1000}
      height={1000}
    />
  </>
);
