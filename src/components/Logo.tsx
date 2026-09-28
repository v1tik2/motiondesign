import { asset } from "../asset";
import React from "react";
import {Img, interpolate, useCurrentFrame} from "remotion";
import { BRAND } from "../brand";
import { C, DISPLAY } from "../theme";

// Crosshair mark; replaced by public/<BRAND.logoFile> when provided.
export const LogoMark: React.FC<{ size: number; draw?: number }> = ({ size, draw = 1 }) => {
  const frame = useCurrentFrame();
  if (BRAND.logoFile) {
    return (
      <Img
        src={asset(BRAND.logoFile)}
        style={{ width: size, height: size, objectFit: "contain", filter: `drop-shadow(0 0 ${24 * draw}px ${C.gold}aa)` }}
      />
    );
  }
  const r = 42;
  const circ = 2 * Math.PI * r;
  const spin = frame * 0.6;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 18px ${C.gold})` }}>
      <g transform={`rotate(${spin} 50 50)`}>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={C.gold}
          strokeWidth="6"
          strokeDasharray={`${circ / 4 - 10} 10`}
          strokeDashoffset={interpolate(draw, [0, 1], [circ, 0])}
        />
      </g>
      {[0, 90, 180, 270].map((a) => (
        <rect
          key={a}
          x="47"
          y={4 + (1 - draw) * 20}
          width="6"
          height="22"
          rx="2"
          fill={C.white}
          transform={`rotate(${a} 50 50)`}
          opacity={draw}
        />
      ))}
      <circle cx="50" cy="50" r={6 * draw} fill={C.accent} />
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, lineHeight: 1 }}>
    <span style={{ color: C.white }}>CS</span>
    <span style={{ color: C.gold, textShadow: `0 0 30px ${C.gold}88` }}>HUNTER</span>
  </div>
);
