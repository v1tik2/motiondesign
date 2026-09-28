import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// 120 BPM → one beat = 15 frames, one bar = 60 frames. Scene cuts land on the beat.
export const BEAT = 15;

export const T = {
  hook: { from: 0, dur: 90 },
  roulette: { from: 90, dur: 150 },
  odds: { from: 240, dur: 180 },
  oneIn: { from: 420, dur: 150 },
  twist: { from: 570, dur: 120 },
  outro: { from: 690, dur: 150 },
} as const;

export const TOTAL = T.outro.from + T.outro.dur;

export const C = {
  bg: "#06070B",
  bg2: "#0E1018",
  white: "#F4F5F8",
  dim: "#8A8FA3",
  gold: "#FFC93C",
  goldDeep: "#E4AE39",
  accent: "#FF4A1C",
  milspec: "#4B69FF",
  restricted: "#8847FF",
  classified: "#D32CE6",
  covert: "#EB4B4B",
  rare: "#FFC93C",
};

export const DISPLAY = "Unbounded";
export const BODY = "Inter";

const fonts: [string, string, string][] = [
  [DISPLAY, "700", "unbounded-latin-700-normal.woff2"],
  [DISPLAY, "700", "unbounded-cyrillic-700-normal.woff2"],
  [DISPLAY, "900", "unbounded-latin-900-normal.woff2"],
  [DISPLAY, "900", "unbounded-cyrillic-900-normal.woff2"],
  [BODY, "600", "inter-latin-600-normal.woff2"],
  [BODY, "600", "inter-cyrillic-600-normal.woff2"],
  [BODY, "800", "inter-latin-800-normal.woff2"],
  [BODY, "800", "inter-cyrillic-800-normal.woff2"],
];

for (const [family, weight, file] of fonts) {
  loadFont({ family, weight, url: staticFile(`fonts/${file}`) });
}
