import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CASES_PER_KNIFE, KEY_PRICE_USD } from "../brand";
import { Background, Flash, clamp, useShake } from "../components/fx";
import { Counter, Slam } from "../components/text";
import { C, DISPLAY } from "../theme";

const COLS = 20;
const CELL = 40;
const GAP = 6;
const GRID_W = COLS * CELL + (COLS - 1) * GAP;
const WINNER = 262;

export const ONEIN_WIN = 52;
export const ONEIN_MONEY = 84;

export const OneIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const win = spring({ frame: frame - ONEIN_WIN, fps, config: { damping: 10, mass: 0.5 } });
  const money = spring({ frame: frame - ONEIN_MONEY, fps, config: { damping: 16, mass: 0.7 } });
  const shake = useShake(ONEIN_MONEY, 22, 12);
  const out = interpolate(frame, [140, 150], [1, 0], clamp);
  const gridScale = interpolate(money, [0, 1], [1, 0.72]);
  const gridY = interpolate(money, [0, 1], [0, 230]);

  return (
    <AbsoluteFill style={{ opacity: out, transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      <Background tint={C.gold} intensity={0.18 + win * 0.12} />

      <AbsoluteFill style={{ top: 260, alignItems: "center" }}>
        <Slam at={2} size={190} color={C.white}>
          1 <span style={{ fontSize: 110, color: C.dim }}>з</span> <span style={{ color: C.gold }}>{CASES_PER_KNIFE}</span>
        </Slam>
        <div
          style={{
            marginTop: 14,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 48,
            color: C.dim,
            opacity: interpolate(frame, [14, 22], [0, 1], clamp) * (1 - money),
          }}
        >
          кейсів
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: (1080 - GRID_W) / 2,
          top: 560,
          width: GRID_W,
          display: "flex",
          flexWrap: "wrap",
          gap: GAP,
          transform: `translateY(${gridY}px) scale(${gridScale})`,
          transformOrigin: "50% 0%",
          opacity: 1 - money * 0.55,
        }}
      >
        {new Array(CASES_PER_KNIFE).fill(0).map((_, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const appear = 8 + (row + col) * 0.9 + random(`c${i}`) * 4;
          const s = interpolate(frame, [appear, appear + 6], [0, 1], clamp);
          const isWin = i === WINNER;
          const lit = isWin && frame >= ONEIN_WIN;
          return (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 10,
                background: lit ? C.gold : "#1b1f2c",
                border: `2px solid ${lit ? "#fff6d0" : "#2a3042"}`,
                transform: `scale(${s * (lit ? 1 + win * 0.9 : 1)})`,
                boxShadow: lit ? `0 0 ${40 * win}px ${C.gold}, 0 0 ${120 * win}px ${C.gold}` : "none",
                zIndex: lit ? 2 : 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3a2a00",
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              {lit ? "★" : ""}
            </div>
          );
        })}
      </div>

      {/* Money */}
      <AbsoluteFill style={{ top: 560, alignItems: "center", opacity: money }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 900,
            fontSize: 170,
            color: C.gold,
            textShadow: `0 0 40px ${C.gold}`,
            transform: `scale(${interpolate(money, [0, 1], [2, 1])})`,
          }}
        >
          <Counter from={0} to={CASES_PER_KNIFE * KEY_PRICE_USD} start={ONEIN_MONEY} end={ONEIN_MONEY + 26} prefix="≈$" />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: C.white, marginTop: 10, opacity: interpolate(frame, [ONEIN_MONEY + 16, ONEIN_MONEY + 24], [0, 1], clamp) }}>
          лише на ключі
        </div>
      </AbsoluteFill>
      <Flash at={ONEIN_WIN} length={6} color={C.gold} />
    </AbsoluteFill>
  );
};
