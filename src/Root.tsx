import React from "react";
import { Composition } from "remotion";
import "./theme";
import { FPS, HEIGHT, TOTAL, WIDTH } from "./theme";
import { KnifeChance } from "./KnifeChance";

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
