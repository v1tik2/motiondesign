import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, DISPLAY } from "../theme";
import { clamp } from "./fx";

// Big display word that slams in from oversized + blurred.
export const Slam: React.FC<{
  children: React.ReactNode;
  at: number;
  size?: number;
  color?: string;
  glow?: string;
  style?: React.CSSProperties;
  rotate?: number;
}> = ({ children, at, size = 120, color = C.white, glow, style, rotate = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.5, stiffness: 260 } });
  if (frame < at) return null;
  const scale = interpolate(p, [0, 1], [2.4, 1]);
  const blur = interpolate(frame - at, [0, 5], [18, 0], clamp);
  const o = interpolate(frame - at, [0, 3], [0, 1], clamp);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: -size * 0.02,
        textAlign: "center",
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        filter: `blur(${blur}px)`,
        opacity: o,
        textShadow: glow ? `0 0 30px ${glow}, 0 0 80px ${glow}88` : "0 8px 30px rgba(0,0,0,.6)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Rubber-stamp style label.
export const Stamp: React.FC<{ children: React.ReactNode; at: number; color: string; size?: number; rotate?: number }> = ({
  children,
  at,
  color,
  size = 110,
  rotate = -6,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.4, stiffness: 300 } });
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 900,
        fontSize: size,
        color,
        padding: `${size * 0.12}px ${size * 0.35}px`,
        border: `${size * 0.08}px solid ${color}`,
        borderRadius: size * 0.18,
        transform: `rotate(${rotate}deg) scale(${interpolate(p, [0, 1], [3, 1])})`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        boxShadow: `0 0 50px ${color}66, inset 0 0 30px ${color}33`,
        textShadow: `0 0 24px ${color}`,
        background: "rgba(0,0,0,.35)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const Counter: React.FC<{ from: number; to: number; start: number; end: number; decimals?: number; prefix?: string; suffix?: string }> = ({
  from,
  to,
  start,
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [start, end], [0, 1], clamp);
  const eased = 1 - Math.pow(1 - t, 3);
  const v = from + (to - from) * eased;
  return (
    <>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </>
  );
};
