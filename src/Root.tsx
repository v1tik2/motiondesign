import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL, WIDTH, loadFonts } from "./theme";
import { KnifeChance } from "./KnifeChance";

loadFonts();

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
  </>
);
