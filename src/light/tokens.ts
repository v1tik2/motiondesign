import { loadFont } from "@remotion/fonts";
import { asset } from "../asset";

export const L = {
  canvas: "#E9E7E2",
  card: "#FFFFFF",
  tile: "#F4F2EE",
  line: "#E4E1DA",
  ink: "#0B0B0B",
  muted: "#85827B",
  accent: "#FAC116", // CSHUNTER gold, sampled from the logo
  milspec: "#4B69FF",
  restricted: "#8847FF",
  classified: "#D32CE6",
  covert: "#EB4B4B",
  rare: "#FAC116",
  sans: "Geist, system-ui, sans-serif",
};

export const loadLightFonts = () => {
  loadFont({ family: "Geist", weight: "100 900", format: "woff2", url: asset("fonts/Geist-Variable.woff2") });
};

// Timeline (30 fps, 120 BPM → 15 frames per beat).
export const LT = {
  hookOut: 78,
  caseIn: 80,
  click1: 125,
  rouletteIn: 134,
  spinStart: 142,
  spinEnd: 222,
  oddsIn: 258,
  highlight: 322,
  bigNumber: 348,
  gridIn: 402,
  winner: 436,
  money: 452,
  orIn: 480,
  drop: 510,
  appIn: 510,
  click2: 566,
  click3: 598,
  handoff: 612, // knife flies to the corner, gameplay video starts
  videoFrames: 260, // gameplay.mp4 is 8.69 s
  outroIn: 705, // 23.5 s, right after the knife is drawn in the gameplay
  total: 855,
};
