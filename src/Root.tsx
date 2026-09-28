import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL, WIDTH, loadFonts } from "./theme";
import { KnifeChance } from "./KnifeChance";
import { KnifeChanceLight } from "./light/KnifeChanceLight";
import { LT, loadLightFonts } from "./light/tokens";

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
  </>
);
