import React from "react";
import { Audio, Sequence } from "remotion";
import { asset } from "../asset";
import { LT } from "./tokens";
import { rouletteTicks } from "./KnifeChanceLight";

// Length of each SFX in frames, so its <Audio> unmounts when done.
const LEN: Record<string, number> = {
  impact: 54, swish: 13, ding: 66, riser: 60, coins: 29, click: 2, knock: 9, thud: 14, latch: 15,
  scribble: 9, rain: 30, chime: 48, select: 11, success: 27,
  ...Object.fromEntries([...Array(10)].map((_, i) => [`note_${i}`, 15])),
  ...Object.fromEntries([...Array(6)].map((_, i) => [`bubble_${i}`, 5])),
  ...Object.fromEntries([...Array(4)].map((_, i) => [`tick_${i}`, 2])),
};

type Cue = { at: number; sfx: string; vol: number };

const morphs = [LT.rouletteIn, LT.oddsIn, LT.bigNumber, LT.gridIn, LT.orIn, LT.outroIn];

// Every event has its own sound; series play as a pentatonic melody, never one repeated blip.
const cues = (): Cue[] => [
  // hook
  { at: 4, sfx: "thud", vol: 0.3 },
  ...[0, 2, 4, 5, 7].map((n, i) => ({ at: 6 + i * 3, sfx: `note_${n}`, vol: 0.2 })),
  { at: 23, sfx: "scribble", vol: 0.35 },
  ...morphs.map((f) => ({ at: f - 2, sfx: "swish", vol: 0.3 })),
  // case
  { at: LT.caseIn + 2, sfx: "thud", vol: 0.35 },
  { at: LT.click1, sfx: "click", vol: 0.8 },
  { at: LT.click1 + 2, sfx: "latch", vol: 0.45 },
  ...rouletteTicks().map((f, i) => ({ at: f, sfx: `tick_${i % 4}`, vol: 0.18 })),
  { at: LT.spinEnd + 1, sfx: "knock", vol: 0.4 },
  // odds
  ...[0, 1, 2, 3, 4].map((i) => ({ at: LT.oddsIn + 6 + i * 7, sfx: `note_${i + 1}`, vol: 0.16 })),
  { at: LT.highlight, sfx: "select", vol: 0.3 },
  { at: LT.bigNumber + 18, sfx: "chime", vol: 0.35 },
  // grid
  { at: LT.gridIn + 4, sfx: "rain", vol: 0.3 },
  { at: LT.winner, sfx: "ding", vol: 0.32 },
  { at: LT.money, sfx: "coins", vol: 0.22 },
  { at: LT.orIn - 50, sfx: "riser", vol: 0.22 },
  // drop + app
  { at: LT.drop, sfx: "impact", vol: 0.6 },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ at: LT.appIn + 10 + i * 4, sfx: `bubble_${i}`, vol: 0.2 })),
  { at: LT.click2, sfx: "click", vol: 0.8 },
  { at: LT.click2 + 1, sfx: "select", vol: 0.35 },
  { at: LT.click3, sfx: "click", vol: 0.8 },
  { at: LT.click3 + 1, sfx: "success", vol: 0.4 },
  // outro
  { at: LT.outroIn + 4, sfx: "impact", vol: 0.4 },
  { at: LT.outroIn + 16, sfx: "chime", vol: 0.22 },
  ...[9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => ({ at: LT.outroIn + 44 + i * 3, sfx: `note_${n}`, vol: 0.13 })),
];

export const LightSoundTrack: React.FC = () => (
  <>
    {/* Wide tolerance so a busy preview doesn't keep re-seeking the music. */}
    <Audio src={asset("sfx/music_light.wav")} volume={0.7} acceptableTimeShiftInSeconds={1.2} />
    {cues().map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={LEN[c.sfx]} layout="none">
        <Audio src={asset(`sfx/${c.sfx}.wav`)} volume={c.vol} />
      </Sequence>
    ))}
  </>
);
