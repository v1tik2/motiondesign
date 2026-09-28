import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Hook } from "./scenes/Hook";
import { Roulette } from "./scenes/Roulette";
import { Odds } from "./scenes/Odds";
import { OneIn } from "./scenes/OneIn";
import { Twist } from "./scenes/Twist";
import { Outro } from "./scenes/Outro";
import { SoundTrack } from "./SoundTrack";
import { C, T } from "./theme";

const scenes = [
  [T.hook, Hook],
  [T.roulette, Roulette],
  [T.odds, Odds],
  [T.oneIn, OneIn],
  [T.twist, Twist],
  [T.outro, Outro],
] as const;

export const KnifeChance: React.FC<{ withSound?: boolean }> = ({ withSound = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {scenes.map(([t, Scene], i) => (
      <Sequence key={i} from={t.from} durationInFrames={t.dur} premountFor={30}>
        <Scene />
      </Sequence>
    ))}
    {withSound ? <SoundTrack /> : null}
  </AbsoluteFill>
);
