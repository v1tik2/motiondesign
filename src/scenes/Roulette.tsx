import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background, Flash, clamp, usePop, useShake } from "../components/fx";
import { Stamp } from "../components/text";
import { C, DISPLAY } from "../theme";

type Rarity = "milspec" | "restricted" | "classified" | "covert" | "rare";
const POOL: Record<Rarity, string[]> = {
  milspec: ["weapon_nova-3", "weapon_mac10-3", "weapon_p250-102", "weapon_famas-47", "weapon_ump45-37", "weapon_mp9-33"],
  restricted: ["weapon_usp_silencer-313", "weapon_m4a1_silencer-548", "weapon_deagle-351"],
  classified: ["weapon_ak47-302", "weapon_awp-279", "weapon_glock-38"],
  covert: ["weapon_awp-344", "weapon_m4a1-309", "weapon_ak47-180"],
  rare: ["rare"],
};

// Hand-tuned strip: mostly blue, a near-miss knife right after the landing card.
const PATTERN: Rarity[] = [
  "milspec", "restricted", "milspec", "milspec", "classified", "milspec", "restricted", "milspec",
  "covert", "milspec", "milspec", "restricted", "milspec", "classified", "milspec", "milspec",
  "restricted", "milspec", "milspec", "covert", "milspec", "restricted", "milspec", "milspec",
  "classified", "milspec", "restricted", "milspec", "milspec", "milspec", "rare", "restricted", "milspec",
];
export const LAND_INDEX = 29; // a Mil-Spec card; index 30 is the knife
const PITCH = 330;
const CARD_W = 310;
export const SPIN_START = 26;
export const SPIN_END = 118;
const LAND_OFFSET = 118; // stop close to the right edge so the knife is *just* out of reach

const counters: Record<Rarity, number> = { milspec: 0, restricted: 0, classified: 0, covert: 0, rare: 0 };
const ITEMS = PATTERN.map((r) => {
  const list = POOL[r];
  const img = list[counters[r]++ % list.length];
  return { r, img };
});

export const stripOffset = (frame: number) => {
  const t = interpolate(frame, [SPIN_START, SPIN_END], [0, 1], clamp);
  const e = Easing.bezier(0.08, 0.72, 0.18, 1)(t);
  return e * (LAND_INDEX * PITCH + LAND_OFFSET);
};

// Frames on which a card edge crosses the center marker → tick sounds.
export const rouletteTicks = (): number[] => {
  const ticks: number[] = [];
  let last = 0;
  for (let f = SPIN_START; f <= SPIN_END; f++) {
    const n = Math.floor((stripOffset(f) + PITCH / 2) / PITCH);
    if (n !== last) {
      ticks.push(f);
      last = n;
    }
  }
  return ticks;
};

const RCOLOR: Record<Rarity, string> = {
  milspec: C.milspec,
  restricted: C.restricted,
  classified: C.classified,
  covert: C.covert,
  rare: C.rare,
};

export const Roulette: React.FC = () => {
  const frame = useCurrentFrame();
  const caseIn = usePop(0, 10, 0.6);
  const caseOpen = interpolate(frame, [18, 26], [1, 0], clamp);
  const caseShake = frame < 22 ? Math.sin(frame * 2.2) * interpolate(frame, [8, 22], [0, 14], clamp) : 0;
  const offset = stripOffset(frame);
  const landed = frame >= SPIN_END + 2;
  const shake = useShake(SPIN_END + 6, 18, 10);
  const stripIn = interpolate(frame, [20, 30], [0, 1], clamp);
  const out = interpolate(frame, [140, 150], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)`, opacity: out }}>
      <Background tint={landed ? C.milspec : C.gold} intensity={0.25} />

      {/* Case */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("cases/crate_community_default_png.png")}
          style={{
            width: 620,
            transform: `translateY(${-80 + (1 - caseIn) * -900}px) rotate(${caseShake}deg) scale(${1 + (1 - caseOpen) * 0.6})`,
            opacity: caseOpen,
            filter: `drop-shadow(0 30px 60px rgba(0,0,0,.7)) brightness(${1 + (1 - caseOpen) * 2})`,
          }}
        />
      </AbsoluteFill>

      {/* Strip */}
      <AbsoluteFill style={{ top: 760, height: 400, opacity: stripIn, transform: `scaleY(${0.6 + 0.4 * stripIn})` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0), rgba(255,255,255,.04), rgba(0,0,0,0))" }} />
        {ITEMS.map((it, i) => {
          const x = 540 + i * PITCH - offset - CARD_W / 2;
          if (x < -PITCH || x > 1080 + PITCH) return null;
          const col = RCOLOR[it.r];
          const isLand = landed && i === LAND_INDEX;
          const isKnife = it.r === "rare";
          const dim = landed && !isLand && !isKnife ? 0.35 : 1;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 40,
                width: CARD_W,
                height: 320,
                borderRadius: 22,
                background: `linear-gradient(180deg, #1a1d29, ${col}55)`,
                border: `3px solid ${isLand ? col : "rgba(255,255,255,.08)"}`,
                boxShadow: isKnife ? `0 0 40px ${C.gold}88` : isLand ? `0 0 50px ${col}` : "none",
                overflow: "hidden",
                opacity: dim,
                transform: isLand ? `scale(${interpolate(frame, [SPIN_END + 2, SPIN_END + 8], [1, 1.08], clamp)})` : undefined,
              }}
            >
              <Img
                src={staticFile(isKnife ? "cases/default_rare_item_png.png" : `skins/${it.img}.png`)}
                style={{ width: "100%", height: 250, objectFit: "contain", padding: 16 }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: col, boxShadow: `0 0 20px ${col}` }} />
            </div>
          );
        })}
        {/* marker */}
        <div style={{ position: "absolute", left: 537, top: 0, width: 6, height: 400, background: C.gold, boxShadow: `0 0 20px ${C.gold}, 0 0 60px ${C.gold}` }} />
        <div style={{ position: "absolute", left: 520, top: -10, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `28px solid ${C.gold}` }} />
        <div style={{ position: "absolute", left: 520, bottom: -10, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: `28px solid ${C.gold}` }} />
      </AbsoluteFill>

      {/* Near-miss arrow + verdict */}
      {landed ? (
        <>
          <AbsoluteFill style={{ top: 1230, alignItems: "center" }}>
            <Stamp at={SPIN_END + 6} color={C.covert} size={120}>
              МИМО
            </Stamp>
          </AbsoluteFill>
          <AbsoluteFill style={{ top: 1440, alignItems: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 54,
                color: C.gold,
                opacity: interpolate(frame, [SPIN_END + 14, SPIN_END + 20], [0, 1], clamp),
                transform: `translateY(${interpolate(frame, [SPIN_END + 14, SPIN_END + 20], [20, 0], clamp)}px)`,
              }}
            >
              ★ був поруч...
            </div>
          </AbsoluteFill>
        </>
      ) : null}
      <Flash at={24} length={8} color={C.gold} />
    </AbsoluteFill>
  );
};
