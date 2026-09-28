import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { HOOK_HITS } from "./scenes/Hook";
import { SPIN_END, rouletteTicks } from "./scenes/Roulette";
import { ODDS_FOCUS, ODDS_ROW_AT } from "./scenes/Odds";
import { ONEIN_MONEY, ONEIN_WIN } from "./scenes/OneIn";
import { TWIST_DROP, TWIST_FREE, TWIST_SWAP } from "./scenes/Twist";
import { CHIP_STEP, OUTRO_CHIPS, OUTRO_CTA, OUTRO_DOMAIN } from "./scenes/Outro";
import { BRAND } from "./brand";
import { T } from "./theme";

type Cue = { at: number; sfx: string; vol?: number };

const cues: Cue[] = [
  // Hook
  { at: HOOK_HITS[0], sfx: "slam", vol: 0.7 },
  { at: HOOK_HITS[1], sfx: "slam", vol: 0.7 },
  { at: HOOK_HITS[2], sfx: "impact", vol: 1 },
  { at: HOOK_HITS[2], sfx: "ding", vol: 0.35 },
  { at: HOOK_HITS[3], sfx: "slam", vol: 0.6 },
  { at: T.roulette.from - 8, sfx: "whoosh", vol: 0.6 },
  // Roulette
  { at: T.roulette.from + 2, sfx: "whoosh_down", vol: 0.6 },
  { at: T.roulette.from + 14, sfx: "reverse", vol: 0.5 },
  { at: T.roulette.from + 24, sfx: "slam", vol: 0.8 },
  ...rouletteTicks().map((f) => ({ at: T.roulette.from + f, sfx: "tick", vol: 0.55 })),
  { at: T.roulette.from + SPIN_END + 6, sfx: "fail", vol: 0.7 },
  { at: T.roulette.from + SPIN_END + 6, sfx: "slam", vol: 0.6 },
  { at: T.odds.from - 8, sfx: "whoosh", vol: 0.55 },
  // Odds
  { at: T.odds.from, sfx: "slam", vol: 0.5 },
  ...[0, 1, 2, 3, 4].map((i) => ({ at: T.odds.from + ODDS_ROW_AT(i), sfx: i === 4 ? "pop_hi" : "pop", vol: 0.55 })),
  { at: T.odds.from + ODDS_FOCUS - 14, sfx: "reverse", vol: 0.6 },
  { at: T.odds.from + ODDS_FOCUS + 8, sfx: "impact", vol: 0.9 },
  { at: T.odds.from + ODDS_FOCUS + 8, sfx: "ding", vol: 0.5 },
  { at: T.odds.from + ODDS_FOCUS + 22, sfx: "slam", vol: 0.45 },
  { at: T.oneIn.from - 8, sfx: "whoosh", vol: 0.55 },
  // 1 in 385
  { at: T.oneIn.from + 2, sfx: "slam", vol: 0.8 },
  { at: T.oneIn.from + ONEIN_WIN, sfx: "ding", vol: 0.6 },
  { at: T.oneIn.from + ONEIN_MONEY, sfx: "impact", vol: 0.7 },
  { at: T.oneIn.from + ONEIN_MONEY, sfx: "coins", vol: 0.55 },
  { at: T.oneIn.from + ONEIN_MONEY + 26, sfx: "cash", vol: 0.55 },
  { at: T.twist.from - 60, sfx: "riser", vol: 0.45 },
  // Twist
  { at: T.twist.from + 4, sfx: "glitch", vol: 0.6 },
  { at: T.twist.from + TWIST_DROP, sfx: "impact", vol: 1 },
  { at: T.twist.from + TWIST_DROP + 2, sfx: "slam", vol: 0.5 },
  { at: T.twist.from + TWIST_DROP + 8, sfx: "slam", vol: 0.7 },
  { at: T.twist.from + TWIST_FREE, sfx: "slam", vol: 0.9 },
  { at: T.twist.from + TWIST_FREE, sfx: "ding", vol: 0.5 },
  { at: T.twist.from + TWIST_SWAP - 6, sfx: "whoosh", vol: 0.6 },
  { at: T.outro.from - 20, sfx: "reverse", vol: 0.7 },
  // Outro
  { at: T.outro.from, sfx: "impact", vol: 1 },
  { at: T.outro.from + OUTRO_DOMAIN, sfx: "ding", vol: 0.5 },
  ...BRAND.modes.map((_, i) => ({ at: T.outro.from + OUTRO_CHIPS + i * CHIP_STEP, sfx: i % 2 ? "pop_hi" : "pop", vol: 0.45 })),
  { at: T.outro.from + OUTRO_CTA, sfx: "slam", vol: 0.8 },
];

export const SoundTrack: React.FC = () => (
  <>
    <Audio src={staticFile("sfx/music.wav")} volume={0.75} />
    {cues.map((c, i) => (
      <Sequence key={i} from={c.at} layout="none">
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.vol ?? 1} />
      </Sequence>
    ))}
  </>
);
