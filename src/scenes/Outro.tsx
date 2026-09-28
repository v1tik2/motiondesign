import { asset } from "../asset";
import React from "react";
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import { BRAND } from "../brand";
import { Background, Flash, clamp, useShake } from "../components/fx";
import { LogoMark, Wordmark } from "../components/Logo";
import { C, DISPLAY } from "../theme";

export const OUTRO_LOGO = 0;
export const OUTRO_DOMAIN = 16;
export const OUTRO_CHIPS = 34;
export const CHIP_STEP = 4;
export const OUTRO_CTA = 86;

const FLOATERS = [
  { src: "skins/weapon_knife_karambit-38.png", x: -60, y: 1480, r: -18, w: 420 },
  { src: "skins/weapon_awp-344.png", x: 640, y: 1560, r: 12, w: 480 },
  { src: "skins/weapon_ak47-180.png", x: -120, y: 120, r: 14, w: 460 },
  { src: "skins/weapon_knife_butterfly-568.png", x: 720, y: 150, r: -20, w: 380 },
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - OUTRO_LOGO, fps, config: { damping: 11, mass: 0.6 } });
  const domain = spring({ frame: frame - OUTRO_DOMAIN, fps, config: { damping: 13, mass: 0.5 } });
  const cta = spring({ frame: frame - OUTRO_CTA, fps, config: { damping: 10, mass: 0.5 } });
  const shake = useShake(OUTRO_LOGO + 2, 20, 10);
  const pulse = 1 + Math.max(0, Math.sin((frame - OUTRO_CTA) / 4.8)) * 0.04 * cta;

  return (
    <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      <Background tint={C.gold} intensity={0.3} />

      {FLOATERS.map((f, i) => (
        <Img
          key={f.src}
          src={asset(f.src)}
          style={{
            position: "absolute",
            left: f.x,
            top: f.y + Math.sin((frame + i * 25) / 22) * 18,
            width: f.w,
            transform: `rotate(${f.r + Math.sin((frame + i * 13) / 30) * 4}deg) scale(${spring({ frame: frame - 6 - i * 4, fps, config: { damping: 14 } })})`,
            opacity: 0.35,
            filter: "blur(1.5px)",
          }}
        />
      ))}

      <AbsoluteFill style={{ top: 290, alignItems: "center" }}>
        <div style={{ transform: `scale(${interpolate(logo, [0, 1], [2.6, 1])}) rotate(${(1 - logo) * -90}deg)`, opacity: Math.min(1, logo * 2) }}>
          <LogoMark size={300} draw={interpolate(frame, [0, 18], [0, 1], clamp)} />
        </div>
        <div style={{ marginTop: 6, transform: `scale(${interpolate(logo, [0, 1], [0.4, 1])})`, opacity: logo }}>
          <Wordmark size={128} />
        </div>
        <div
          style={{
            marginTop: 26,
            padding: "14px 34px",
            borderRadius: 18,
            background: C.gold,
            color: "#1a1200",
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 64,
            letterSpacing: 2,
            transform: `translateY(${(1 - domain) * 60}px) scaleX(${domain})`,
            opacity: domain,
            boxShadow: `0 0 50px ${C.gold}88`,
          }}
        >
          {BRAND.domain}
        </div>
      </AbsoluteFill>

      {/* Modes */}
      <AbsoluteFill style={{ top: 1010, alignItems: "center" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, width: 960 }}>
          {BRAND.modes.map((m, i) => {
            const p = spring({ frame: frame - OUTRO_CHIPS - i * CHIP_STEP, fps, config: { damping: 11, mass: 0.4, stiffness: 260 } });
            return (
              <div
                key={m}
                style={{
                  width: 296,
                  height: 104,
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontWeight: 900,
                  fontSize: 50,
                  color: C.white,
                  background: "linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.03))",
                  border: `3px solid ${i % 2 ? C.gold : "rgba(255,255,255,.2)"}`,
                  boxShadow: i % 2 ? `0 0 26px ${C.gold}55` : "none",
                  transform: `scale(${p}) translateY(${(1 - p) * 40}px)`,
                  opacity: p,
                }}
              >
                {m}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* CTA */}
      <AbsoluteFill style={{ top: 1420, alignItems: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 50,
            textAlign: "center",
            lineHeight: 1.2,
            color: C.white,
            opacity: cta,
            transform: `scale(${interpolate(cta, [0, 1], [1.6, 1]) * pulse})`,
          }}
        >
          ГРАЙ З <span style={{ color: C.gold }}>БУДЬ-ЯКИМИ</span> СКІНАМИ
          <br />
          <span style={{ color: C.gold, textShadow: `0 0 24px ${C.gold}` }}>БЕЗКОШТОВНО</span>
        </div>
      </AbsoluteFill>
      <Flash at={OUTRO_LOGO} length={10} />
      <Flash at={OUTRO_CTA} length={6} color={C.gold} />
    </AbsoluteFill>
  );
};
