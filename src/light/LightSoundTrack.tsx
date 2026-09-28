import React from "react";
import { Audio, Sequence } from "remotion";
import { asset } from "../asset";
import { LT } from "./tokens";
import { rouletteTicks } from "./KnifeChanceLight";

const LEN: Record<string, number> = {
  impact: 54, slam: 18, swish: 13, reverse: 21, tick: 3, fail: 27, ding: 66,
  pop: 6, pop_hi: 6, riser: 60, coins: 29, cash: 30, click: 2,
};

type Cue = { at: number; sfx: string; vol: number };

const morphs = [LT.caseIn, LT.rouletteIn, LT.oddsIn, LT.bigNumber, LT.gridIn, LT.orIn, LT.outroIn];

// Sparse on purpose: only the key beats get a sound.
const cues = (): Cue[] => [
  ...morphs.map((f) => ({ at: f - 2, sfx: "swish", vol: 0.35 })),
  // case
  { at: LT.click1, sfx: "click", vol: 0.8 },
  ...rouletteTicks().map((f) => ({ at: f, sfx: "tick", vol: 0.22 })),
  // odds
  { at: LT.highlight, sfx: "swish", vol: 0.35 },
  { at: LT.bigNumber + 18, sfx: "ding", vol: 0.3 },
  // grid
  { at: LT.winner, sfx: "ding", vol: 0.35 },
  { at: LT.money, sfx: "coins", vol: 0.25 },
  { at: LT.orIn - 50, sfx: "riser", vol: 0.22 },
  // drop + app
  { at: LT.drop, sfx: "impact", vol: 0.6 },
  { at: LT.click2, sfx: "click", vol: 0.8 },
  { at: LT.click3, sfx: "click", vol: 0.8 },
  { at: LT.click3 + 1, sfx: "ding", vol: 0.3 },
  // outro
  { at: LT.outroIn + 4, sfx: "impact", vol: 0.4 },
];

export const LightSoundTrack: React.FC = () => (
  <>
    <Audio src={asset("sfx/music_light.wav")} volume={0.7} />
    {cues().map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={LEN[c.sfx]} layout="none">
        <Audio src={asset(`sfx/${c.sfx}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
