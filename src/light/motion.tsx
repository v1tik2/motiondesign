import React from "react";
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { asset } from "../asset";
import { L } from "./tokens";

type Cfg = { damping: number; mass: number; stiffness: number };
// Tiny overshoot at most, as in the reference style.
export const SPR: Cfg = { damping: 19, mass: 0.9, stiffness: 150 };
export const FAST: Cfg = { damping: 22, mass: 0.5, stiffness: 260 };
export const SNAP: Cfg = { damping: 14, mass: 0.45, stiffness: 300 };

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A value that changes target many times = sum of one spring per change.
export const track = (frame: number, fps: number, keys: [number, number][], cfg: Cfg = SPR) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t, val] = keys[i];
    if (frame < t) break;
    v += (val - keys[i - 1][1]) * spring({ frame: frame - t, fps, config: cfg });
  }
  return v;
};

export const useSpring = (at: number, cfg: Cfg = FAST) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame < at ? 0 : spring({ frame: frame - at, fps, config: cfg });
};

export type ShapeKey = { t: number; cx: number; cy: number; w: number; h: number; r: number; dark?: number };

// The one continuous shape. Children are absolutely positioned layers centered on it.
export const Shape: React.FC<{ keys: ShapeKey[]; children: React.ReactNode }> = ({ keys, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = (f: keyof ShapeKey) => keys.map((s) => [s.t, (s[f] as number) ?? 0] as [number, number]);
  const cx = track(frame, fps, k("cx"));
  const cy = track(frame, fps, k("cy"));
  // Leading/trailing edges ride different springs so the shape stretches as it moves.
  const w = track(frame, fps, k("w"));
  const h = track(frame, fps, k("h"), { damping: 21, mass: 1, stiffness: 140 });
  const r = track(frame, fps, k("r"));
  const dark = Math.min(1, Math.max(0, track(frame, fps, k("dark"), FAST)));
  const bg = interpolateColors(dark, [0, 1], [L.card, L.ink]);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        borderRadius: Math.min(r, h / 2, w / 2),
        background: bg,
        overflow: "hidden",
        isolation: "isolate",
        boxShadow: "0 2px 4px rgba(20,18,14,.06), 0 30px 80px -20px rgba(20,18,14,.28)",
      }}
    >
      <div style={{ position: "absolute", left: w / 2, top: h / 2, width: 0, height: 0 }}>{children}</div>
    </div>
  );
};

// Content that swaps in/out with a short blur. Laid out around the shape's center.
export const Layer: React.FC<{
  from: number;
  to?: number;
  w: number;
  h: number;
  children: React.ReactNode;
  dy?: number;
}> = ({ from, to = 1e9, w, h, children, dy = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from - 1 || frame > to + 14) return null;
  const inn = frame < from ? 0 : spring({ frame: frame - from, fps, config: FAST });
  const out = frame < to ? 0 : spring({ frame: frame - to, fps, config: FAST });
  const o = inn * (1 - out);
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: -w / 2,
        top: -h / 2 + dy,
        width: w,
        height: h,
        opacity: o,
        filter: `blur(${(1 - inn) * 12 + out * 12}px)`,
        transform: `scale(${0.96 + 0.04 * inn - 0.03 * out})`,
      }}
    >
      {children}
    </div>
  );
};

// Canvas-level text that rises in word by word.
export const Words: React.FC<{
  text: string;
  at: number;
  size: number;
  stagger?: number;
  weight?: number;
  color?: string;
  mark?: string; // word to underline with the accent highlighter
  exit?: number;
}> = ({ text, at, size, stagger = 3, weight = 650, color = L.ink, mark, exit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exit !== undefined && frame >= exit ? spring({ frame: frame - exit, fps, config: FAST }) : 0;
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.26,
        fontFamily: L.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: "-0.045em",
        color,
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        transform: `translateY(${-out * 40}px)`,
      }}
    >
      {words.map((word, i) => {
        const p = frame < at + i * stagger ? 0 : spring({ frame: frame - at - i * stagger, fps, config: SPR });
        const isMark = mark && word.replace(/[?.,!]/g, "") === mark;
        const hl = isMark ? spring({ frame: Math.max(0, frame - at - i * stagger - 8), fps, config: FAST }) : 0;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.08 }}>
            <span
              style={{
                display: "inline-block",
                position: "relative",
                transform: `translateY(${(1 - p) * 110}%)`,
                filter: `blur(${(1 - p) * 6}px)`,
              }}
            >
              {isMark ? (
                <span
                  style={{
                    position: "absolute",
                    left: -size * 0.06,
                    right: -size * 0.06,
                    top: "18%",
                    bottom: "4%",
                    background: L.accent,
                    borderRadius: size * 0.12,
                    transform: `scaleX(${hl})`,
                    transformOrigin: "0 50%",
                    zIndex: -1,
                  }}
                />
              ) : null}
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export type CursorKey = { t: number; x: number; y: number };

export const Cursor: React.FC<{ keys: CursorKey[]; clicks: number[]; show: [number, number][] }> = ({ keys, clicks, show }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const x = track(frame, fps, keys.map((k) => [k.t, k.x]), { damping: 24, mass: 0.9, stiffness: 120 });
  const y = track(frame, fps, keys.map((k) => [k.t, k.y]), { damping: 24, mass: 0.9, stiffness: 120 });
  const vis = show.reduce((acc, [a, b]) => Math.max(acc, interpolate(frame, [a, a + 6, b - 6, b], [0, 1, 1, 0], clamp)), 0);
  if (vis <= 0) return null;
  const press = clicks.reduce((acc, c) => Math.max(acc, interpolate(frame, [c - 3, c, c + 5], [0, 1, 0], clamp)), 0);
  const ring = clicks.map((c) => frame - c).find((d) => d >= 0 && d < 16);
  return (
    <>
      {ring !== undefined ? (
        <div
          style={{
            position: "absolute",
            left: x - 40,
            top: y - 40,
            width: 80,
            height: 80,
            borderRadius: 80,
            border: `4px solid ${L.accent}`,
            transform: `scale(${interpolate(ring, [0, 15], [0.3, 1.5])})`,
            opacity: interpolate(ring, [0, 15], [0.9, 0]),
          }}
        />
      ) : null}
      <svg
        width={64}
        height={64}
        viewBox="0 0 24 24"
        style={{
          position: "absolute",
          left: x - 5,
          top: y - 3,
          opacity: vis,
          transform: `scale(${1 - press * 0.16})`,
          transformOrigin: "5px 3px",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,.28))",
          zIndex: 50,
        }}
      >
        <path d="M4 2.5 L4 19.5 L8.6 15.4 L11.6 21.8 L14.4 20.5 L11.5 14.2 L17.6 14.2 Z" fill={L.ink} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = L.muted, size = 26 }) => (
  <div style={{ fontFamily: L.sans, fontWeight: 600, fontSize: size, letterSpacing: "0.08em", textTransform: "uppercase", color }}>{children}</div>
);

export const Noise: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.035,
        backgroundImage: `url(${asset("noise.png")})`,
        backgroundPosition: `${(frame * 37) % 256}px ${(frame * 91) % 256}px`,
        mixBlendMode: "multiply",
      }}
    />
  );
};
