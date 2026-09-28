import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const usePop = (delay = 0, damping = 12, mass = 0.6) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass, stiffness: 180 } });
};

// Deterministic camera shake that decays after `at`.
export const useShake = (at: number, strength = 22, length = 12) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > length) return { x: 0, y: 0 };
  const k = 1 - t / length;
  return {
    x: (random(`sx${at}-${t}`) - 0.5) * 2 * strength * k,
    y: (random(`sy${at}-${t}`) - 0.5) * 2 * strength * k,
  };
};

export const Background: React.FC<{ tint?: string; intensity?: number }> = ({
  tint = C.gold,
  intensity = 0.35,
}) => {
  const frame = useCurrentFrame();
  const a = frame * 0.6;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${45 + Math.sin(frame / 40) * 4}%, ${tint}${alpha(
            intensity,
          )} 0%, transparent 55%)`,
        }}
      />
      {/* rotating light rays */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${a}deg at 50% 45%, ${tint}0d 0deg 6deg, transparent 6deg 18deg)`,
          maskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 65%)",
        }}
      />
      <Particles color={tint} />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};

const alpha = (v: number) =>
  Math.round(Math.max(0, Math.min(1, v)) * 255)
    .toString(16)
    .padStart(2, "0");

const Particles: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(38).fill(0).map((_, i) => {
        const x = random(`px${i}`) * 1080;
        const speed = 0.6 + random(`ps${i}`) * 2.2;
        const y = 1960 - ((frame * speed + random(`py${i}`) * 2000) % 2000);
        const s = 2 + random(`pz${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin((frame + i * 20) / 30) * 12,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: color,
              opacity: 0.25 + random(`po${i}`) * 0.45,
              boxShadow: `0 0 ${s * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)" }}
  />
);

// Full-frame white flash used on cuts.
export const Flash: React.FC<{ at: number; length?: number; color?: string }> = ({
  at,
  length = 8,
  color = "#fff",
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + length], [0, 0.85, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

// RGB-split glitch wrapper, active in [from, from+length).
export const Glitch: React.FC<{ from: number; length: number; children: React.ReactNode }> = ({
  from,
  length,
  children,
}) => {
  const frame = useCurrentFrame();
  const on = frame >= from && frame < from + length;
  if (!on) return <>{children}</>;
  const off = (random(`g${frame}`) - 0.5) * 40;
  const slice = random(`gs${frame}`) * 80;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${off}px)`, filter: "drop-shadow(8px 0 0 #ff003c) drop-shadow(-8px 0 0 #00e5ff)" }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: `inset(${slice}% 0 ${100 - slice - 8}% 0)`,
          transform: `translateX(${-off * 2}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
