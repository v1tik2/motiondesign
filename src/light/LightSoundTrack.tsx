import React from "react";
import { Audio, Sequence } from "remotion";
import { asset } from "../asset";
import { BRAND, ODDS } from "../brand";
import { LT } from "./tokens";
import { rouletteTicks } from "./KnifeChanceLight";

const LEN: Record<string, number> = {
  impact: 54, slam: 18, swish: 13, reverse: 21, tick: 3, fail: 27, ding: 66,
  pop: 6, pop_hi: 6, riser: 60, coins: 29, cash: 30, click: 2,
};

type Cue = { at: number; sfx: string; vol: number };

const morphs = [LT.caseIn, LT.rouletteIn, LT.oddsIn, LT.bigNumber, LT.gridIn, LT.orIn, LT.outroIn];

const cues = (): Cue[] => [
  // hook: headline words
  ...[6, 9, 12, 15, 18, 21].map((f, i) => ({ at: f, sfx: i === 3 ? "pop_hi" : "pop", vol: 0.35 })),
  { at: 22, sfx: "ding", vol: 0.25 },
  ...morphs.map((f) => ({ at: f - 2, sfx: "swish", vol: 0.5 })),
  // case
  { at: LT.click1, sfx: "click", vol: 0.9 },
  ...rouletteTicks().map((f) => ({ at: f, sfx: "tick", vol: 0.4 })),
  { at: LT.spinEnd + 4, sfx: "fail", vol: 0.35 },
  // odds
  ...ODDS.map((_, i) => ({ at: LT.oddsIn + 6 + i * 7, sfx: "pop", vol: 0.35 })),
  { at: LT.highlight, sfx: "swish", vol: 0.45 },
  { at: LT.bigNumber + 18, sfx: "ding", vol: 0.45 },
  // grid
  { at: LT.winner, sfx: "ding", vol: 0.5 },
  { at: LT.money, sfx: "coins", vol: 0.4 },
  { at: LT.money + 24, sfx: "cash", vol: 0.4 },
  { at: LT.orIn - 50, sfx: "riser", vol: 0.3 },
  // drop + app
  { at: LT.drop, sfx: "impact", vol: 0.75 },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: LT.appIn + 10 + i * 4, sfx: "pop", vol: 0.3 })),
  { at: LT.click2, sfx: "click", vol: 0.9 },
  { at: LT.click2 + 1, sfx: "pop_hi", vol: 0.4 },
  { at: LT.click3, sfx: "click", vol: 0.9 },
  { at: LT.click3 + 1, sfx: "ding", vol: 0.5 },
  // outro
  { at: LT.outroIn + 4, sfx: "impact", vol: 0.5 },
  { at: LT.outroIn + 16, sfx: "pop_hi", vol: 0.4 },
  ...BRAND.modes.map((_, i) => ({ at: LT.outroIn + 44 + i * 3, sfx: i % 2 ? "pop_hi" : "pop", vol: 0.28 })),
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
