import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ODDS } from "../brand";
import { Background, Flash, clamp, useShake } from "../components/fx";
import { Counter, Slam } from "../components/text";
import { C, DISPLAY } from "../theme";

const ICON: Record<string, string> = {
  milspec: "skins/weapon_mp9-33.png",
  restricted: "skins/weapon_usp_silencer-313.png",
  classified: "skins/weapon_ak47-302.png",
  covert: "skins/weapon_awp-344.png",
  rare: "cases/default_rare_item_png.png",
};

export const ODDS_ROW_AT = (i: number) => 10 + i * 13;
export const ODDS_FOCUS = 92; // zoom into the knife row

const ROW_H = 190;
const BAR_MAX = 560;

export const Odds: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const focus = spring({ frame: frame - ODDS_FOCUS, fps, config: { damping: 16, mass: 0.8 } });
  const shake = useShake(ODDS_FOCUS + 8, 20, 10);
  const out = interpolate(frame, [170, 180], [1, 0], clamp);

  // Knife row lifts to the center and grows; the rest fades away.
  const lastRowY = 520 + 4 * ROW_H + ROW_H / 2;

  return (
    <AbsoluteFill style={{ opacity: out, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      <Background tint={interpolate(focus, [0, 1], [0, 1]) > 0.5 ? C.gold : C.milspec} intensity={0.22 + focus * 0.2} />
      <AbsoluteFill style={{ top: 280, alignItems: "center", opacity: 1 - Math.min(1, focus * 4) }}>
        <Slam at={0} size={78}>
          ШАНСИ З КЕЙСА
        </Slam>
      </AbsoluteFill>

      <AbsoluteFill>
        {ODDS.map((o, i) => {
          const at = ODDS_ROW_AT(i);
          const p = spring({ frame: frame - at, fps, config: { damping: 14, mass: 0.5 } });
          const col = C[o.key as keyof typeof C];
          const isRare = o.key === "rare";
          const barW = Math.max(4, (o.pct / 80) * BAR_MAX) * interpolate(frame, [at, at + 22], [0, 1], clamp);
          const dim = isRare ? 1 : 1 - Math.min(1, focus * 1.4);
          const lift = isRare ? focus * (1000 - lastRowY) : 0;
          const grow = isRare ? 1 + focus * 0.35 : 1;
          return (
            <div
              key={o.key}
              style={{
                position: "absolute",
                top: 520 + i * ROW_H,
                left: 70,
                right: 70,
                height: ROW_H - 30,
                display: "flex",
                alignItems: "center",
                gap: 28,
                opacity: p * dim,
                transform: `translateX(${(1 - p) * -200 + (isRare ? focus * 250 : 0)}px) translateY(${lift}px) scale(${grow})`,
                transformOrigin: "left center",
              }}
            >
              <div
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 24,
                  background: `radial-gradient(circle, ${col}55, #12141c)`,
                  border: `3px solid ${col}`,
                  boxShadow: `0 0 ${isRare ? 50 : 20}px ${col}88`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Img src={staticFile(ICON[o.key])} style={{ width: 180, height: 130, objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, position: "relative", height: 150 }}>
                {isRare ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 42 - (30 + Math.sin(frame / 3) * 6) * focus,
                      left: 2 - (30 + Math.sin(frame / 3) * 6) * focus,
                      width: (60 + Math.sin(frame / 3) * 12) * focus,
                      height: (60 + Math.sin(frame / 3) * 12) * focus,
                      borderRadius: "50%",
                      border: `5px solid ${C.gold}`,
                      boxShadow: `0 0 30px ${C.gold}`,
                      opacity: focus,
                    }}
                  />
                ) : null}
                <div style={{ position: "absolute", top: 20, left: 0, height: 44, width: barW, borderRadius: 22, background: col, boxShadow: `0 0 30px ${col}` }} />
                <div
                  style={{
                    position: "absolute",
                    top: 78,
                    left: 0,
                    fontFamily: DISPLAY,
                    fontWeight: 900,
                    fontSize: 62,
                    color: isRare ? C.gold : C.white,
                    opacity: isRare ? 1 - focus : 1,
                    textShadow: isRare ? `0 0 30px ${C.gold}` : undefined,
                  }}
                >
                  <Counter from={0} to={o.pct} start={at} end={at + 24} decimals={2} suffix="%" />
                </div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Knife reveal overlay */}
      <AbsoluteFill style={{ top: 360, alignItems: "center" }}>
        <Slam at={ODDS_FOCUS + 8} size={240} color={C.gold} glow={C.gold}>
          0.26%
        </Slam>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 1500, alignItems: "center" }}>
        <Slam at={ODDS_FOCUS + 22} size={64} color={C.white}>
          ★ НІЖ АБО РУКАВИЧКИ
        </Slam>
      </AbsoluteFill>
      <Flash at={ODDS_FOCUS + 8} length={7} color={C.gold} />
    </AbsoluteFill>
  );
};
