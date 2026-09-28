import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { asset } from "../asset";
import { BRAND, CASES_PER_KNIFE, KEY_PRICE_USD, ODDS } from "../brand";
import { Cursor, FAST, Label, Layer, Noise, SNAP, Shape, ShapeKey, Words, clamp, track, useSpring } from "./motion";
import { L, LT } from "./tokens";
import { LightSoundTrack } from "./LightSoundTrack";

// ───────────────────────────── shape path ─────────────────────────────

const SHAPE: ShapeKey[] = [
  { t: 0, cx: 540, cy: 1230, w: 120, h: 120, r: 60 },
  { t: 4, cx: 540, cy: 1230, w: 820, h: 600, r: 56 },
  { t: LT.caseIn, cx: 540, cy: 1000, w: 860, h: 960, r: 56 },
  { t: LT.rouletteIn, cx: 540, cy: 1000, w: 1000, h: 440, r: 44 },
  { t: LT.oddsIn, cx: 540, cy: 1000, w: 920, h: 1040, r: 48 },
  { t: LT.bigNumber, cx: 540, cy: 1000, w: 820, h: 560, r: 56 },
  { t: LT.gridIn, cx: 540, cy: 1000, w: 920, h: 1160, r: 48 },
  { t: LT.orIn, cx: 540, cy: 1000, w: 340, h: 132, r: 66, dark: 1 },
  { t: LT.appIn, cx: 540, cy: 1010, w: 960, h: 1180, r: 44, dark: 0 },
  { t: LT.outroIn, cx: 540, cy: 1000, w: 900, h: 1060, r: 56, dark: 0 },
];

// ───────────────────────────── hook ─────────────────────────────

const HookCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <Img
        src={asset("skins/weapon_knife_karambit-418.png")}
        style={{
          width: 640,
          transform: `translateY(${Math.sin(frame / 16) * 10}px) rotate(${-6 + Math.sin(frame / 22) * 3}deg)`,
          filter: "drop-shadow(0 24px 30px rgba(20,18,14,.22))",
        }}
      />
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: L.rare }} />
        <Label color={L.ink}>★ Karambit | Doppler</Label>
      </div>
    </div>
  );
};

// ───────────────────────────── case + roulette ─────────────────────────────

const CASE_W = 860;
const CASE_H = 960;
const BTN_Y = CASE_H - 70 - 55; // button center, relative to card top

const CaseCard: React.FC = () => {
  const frame = useCurrentFrame();
  const press = interpolate(frame, [LT.click1 - 3, LT.click1, LT.click1 + 6], [1, 0.94, 1], clamp);
  const shake = frame > LT.click1 && frame < LT.click1 + 9 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center" }}>
        <Label>CS2 · Кейс зброї</Label>
      </div>
      <Img
        src={asset("cases/crate_community_default_png.png")}
        style={{
          position: "absolute",
          left: (CASE_W - 560) / 2,
          top: 170,
          width: 560,
          transform: `rotate(${shake}deg) translateY(${Math.sin(frame / 18) * 6}px)`,
          filter: "drop-shadow(0 24px 30px rgba(20,18,14,.22))",
        }}
      />
      <div style={{ position: "absolute", top: 610, width: "100%", textAlign: "center", fontFamily: L.sans, fontWeight: 650, fontSize: 64, letterSpacing: "-0.04em", color: L.ink }}>
        Відкриваємо кейс
      </div>
      <div
        style={{
          position: "absolute",
          left: (CASE_W - 560) / 2,
          top: BTN_Y - 55,
          width: 560,
          height: 110,
          borderRadius: 55,
          background: L.ink,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          fontFamily: L.sans,
          fontWeight: 600,
          fontSize: 42,
          transform: `scale(${press})`,
        }}
      >
        Відкрити <span style={{ fontFamily: L.sans, fontWeight: 600, color: L.accent, fontSize: 40, fontVariantNumeric: "tabular-nums" }}>${KEY_PRICE_USD}</span>
      </div>
    </div>
  );
};

type Rarity = "milspec" | "restricted" | "classified" | "covert" | "rare";
const POOL: Record<Rarity, string[]> = {
  milspec: ["weapon_nova-3", "weapon_mac10-3", "weapon_p250-102", "weapon_famas-47", "weapon_ump45-37", "weapon_mp9-33"],
  restricted: ["weapon_usp_silencer-313", "weapon_m4a1_silencer-548", "weapon_deagle-351"],
  classified: ["weapon_ak47-302", "weapon_awp-279", "weapon_glock-38"],
  covert: ["weapon_awp-344", "weapon_m4a1-309", "weapon_ak47-180"],
  rare: ["rare"],
};
const PATTERN: Rarity[] = [
  "milspec", "restricted", "milspec", "milspec", "classified", "milspec", "restricted", "milspec",
  "covert", "milspec", "milspec", "restricted", "milspec", "classified", "milspec", "milspec",
  "restricted", "milspec", "milspec", "covert", "milspec", "restricted", "milspec", "milspec",
  "classified", "milspec", "restricted", "milspec", "milspec", "milspec", "rare", "restricted", "milspec",
];
const LAND = 29;
const PITCH = 250;
const TILE_W = 230;
const LAND_OFFSET = 92;
const counters: Record<Rarity, number> = { milspec: 0, restricted: 0, classified: 0, covert: 0, rare: 0 };
const ITEMS = PATTERN.map((r) => ({ r, img: POOL[r][counters[r]++ % POOL[r].length] }));

export const stripOffset = (frame: number) => {
  const t = interpolate(frame, [LT.spinStart, LT.spinEnd], [0, 1], clamp);
  return Easing.bezier(0.1, 0.7, 0.2, 1)(t) * (LAND * PITCH + LAND_OFFSET);
};

export const rouletteTicks = () => {
  const out: number[] = [];
  let last = 0;
  for (let f = LT.spinStart; f <= LT.spinEnd; f++) {
    const n = Math.floor((stripOffset(f) + PITCH / 2) / PITCH);
    if (n !== last) out.push(f);
    last = n;
  }
  return out;
};

const Roulette: React.FC = () => {
  const frame = useCurrentFrame();
  const off = stripOffset(frame);
  const landed = frame >= LT.spinEnd + 2;
  const W = 1000;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 40, width: W, height: 330, overflow: "hidden" }}>
        {ITEMS.map((it, i) => {
          const x = W / 2 + i * PITCH - off - TILE_W / 2;
          if (x < -PITCH || x > W + PITCH) return null;
          const col = L[it.r];
          const isLand = landed && i === LAND;
          const isKnife = it.r === "rare";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 20,
                width: TILE_W,
                height: 290,
                borderRadius: 26,
                background: L.tile,
                boxShadow: isLand ? `0 0 0 4px ${col}` : isKnife && landed ? `0 0 0 ${4 + 3 * Math.abs(Math.sin((frame - LT.spinEnd) / 3))}px ${L.accent}` : "none",
                opacity: landed && !isLand && !isKnife ? 0.4 : 1,
                transform: isKnife && landed ? `translateY(${-Math.abs(Math.sin((frame - LT.spinEnd) / 4)) * 10 * Math.max(0, 1 - (frame - LT.spinEnd) / 30)}px)` : undefined,
                overflow: "hidden",
              }}
            >
              <Img
                src={asset(isKnife ? "cases/default_rare_item_png.png" : `skins/${it.img}.png`)}
                style={{ position: "absolute", left: 10, top: 40, width: TILE_W - 20, height: 190, objectFit: "contain" }}
              />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, background: col }} />
            </div>
          );
        })}
      </div>
      {/* marker */}
      <div style={{ position: "absolute", left: W / 2 - 3, top: 36, width: 6, height: 338, borderRadius: 3, background: L.ink }} />
      <div style={{ position: "absolute", left: W / 2 - 16, top: 26, width: 32, height: 32, borderRadius: 16, background: L.accent, border: `5px solid ${L.ink}` }} />
    </div>
  );
};

// ───────────────────────────── odds ─────────────────────────────

const ROW_TOP = 180;
const ROW_H = 160;

const OddsCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hlIn = useSpring(LT.highlight - 12, FAST);
  const hlY = track(frame, fps, [[0, ROW_TOP], [LT.highlight, ROW_TOP + 4 * ROW_H]], SNAP);
  const focus = useSpring(LT.highlight + 4, FAST);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", top: 70, left: 70 }}>
        <Label>Шанс з одного кейсу · дані Valve</Label>
      </div>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: hlY - 14,
          height: ROW_H - 12,
          borderRadius: 28,
          background: L.accent,
          opacity: hlIn,
          transform: `scaleX(${0.9 + 0.1 * hlIn})`,
        }}
      />
      {ODDS.map((o, i) => {
        const at = LT.oddsIn + 6 + i * 7;
        const p = frame < at ? 0 : interpolate(frame - at, [0, 10], [0, 1], clamp);
        const bar = frame < at ? 0 : Easing.out(Easing.cubic)(interpolate(frame - at, [0, 22], [0, 1], clamp));
        const isRare = o.key === "rare";
        const dim = isRare ? 1 : 1 - focus * 0.65;
        const col = L[o.key as Rarity];
        return (
          <div key={o.key} style={{ position: "absolute", left: 70, right: 70, top: ROW_TOP + i * ROW_H, height: ROW_H - 40, opacity: p * dim, transform: `translateY(${(1 - p) * 16}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ width: 20, height: 20, borderRadius: 10, background: isRare && focus > 0.5 ? L.ink : col }} />
              <span style={{ fontFamily: L.sans, fontWeight: 600, fontSize: 42, color: L.ink, letterSpacing: "-0.03em" }}>{o.label}</span>
              <span style={{ marginLeft: "auto", fontFamily: L.sans, fontWeight: 600, fontSize: 42, color: L.ink, fontVariantNumeric: "tabular-nums" }}>{(o.pct * bar).toFixed(2)}%</span>
            </div>
            <div style={{ marginTop: 18, height: 16, borderRadius: 8, background: isRare && focus > 0.5 ? "rgba(11,11,11,.12)" : L.line }}>
              <div style={{ height: 16, width: `${Math.max(1.2, (o.pct / 80) * 100) * bar}%`, borderRadius: 8, background: isRare && focus > 0.5 ? L.ink : col }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BigNumber: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [LT.bigNumber, LT.bigNumber + 20], [100, 0.26], { ...clamp, easing: Easing.out(Easing.exp) });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Img src={asset("cases/default_rare_item_png.png")} style={{ width: 170, marginBottom: -6 }} />
      <div style={{ fontFamily: L.sans, fontWeight: 700, fontSize: 210, letterSpacing: "-0.06em", color: L.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {v.toFixed(2).replace(".", ",")}%
      </div>
      <div style={{ marginTop: 18, fontFamily: L.sans, fontWeight: 500, fontSize: 40, color: L.muted, letterSpacing: "-0.02em" }}>ніж або рукавички</div>
    </div>
  );
};

// ───────────────────────────── 1 in 385 ─────────────────────────────

const COLS = 20;
const CELL = 30;
const GAP = 7;
const WINNER = 262;

// Every cell gets a rarity in the real proportions: 308 / 62 / 12 / 2 / 1 of 385.
const CELL_RARITY: Rarity[] = (() => {
  const counts: [Rarity, number][] = [["restricted", 62], ["classified", 12], ["covert", 2]];
  const cells: Rarity[] = new Array(CASES_PER_KNIFE).fill("milspec");
  const free = cells.map((_, i) => i).filter((i) => i !== WINNER);
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(random(`shuffle${i}`) * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  let k = 0;
  for (const [r, n] of counts) for (let m = 0; m < n; m++) cells[free[k++]] = r;
  cells[WINNER] = "rare";
  return cells;
})();

const GridCard: React.FC = () => {
  const frame = useCurrentFrame();
  const win = useSpring(LT.winner, SNAP);
  const money = useSpring(LT.money, FAST);
  const gw = COLS * (CELL + GAP) - GAP;
  const dollars = interpolate(frame, [LT.money, LT.money + 24], [0, CASES_PER_KNIFE * KEY_PRICE_USD], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center" }}>
        <Label>В середньому</Label>
        <div style={{ fontFamily: L.sans, fontWeight: 700, fontSize: 130, letterSpacing: "-0.06em", color: L.ink, lineHeight: 1.05 }}>
          1 з {CASES_PER_KNIFE}
        </div>
      </div>
      <div style={{ position: "absolute", left: (920 - gw) / 2, top: 290, width: gw, display: "flex", flexWrap: "wrap", gap: GAP }}>
        {new Array(CASES_PER_KNIFE).fill(0).map((_, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const at = LT.gridIn + 4 + (r + c) * 0.6 + random(`c${i}`) * 3;
          const s = interpolate(frame, [at, at + 6], [0, 1], clamp);
          const lit = i === WINNER && frame >= LT.winner;
          return (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 8,
                background: CELL_RARITY[i] === "rare" ? (lit ? L.accent : L.line) : L[CELL_RARITY[i]],
                opacity: lit || CELL_RARITY[i] !== "milspec" ? 1 : 0.8,
                transform: `scale(${s * (lit ? 1 + win * 0.7 : 1)})`,
                boxShadow: lit ? `0 0 0 ${4 * win}px ${L.ink}` : "none",
                position: "relative",
                zIndex: lit ? 2 : 1,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1050,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 18,
          opacity: money,
          filter: `blur(${(1 - money) * 8}px)`,
          transform: `translateY(${(1 - money) * 20}px)`,
        }}
      >
        <span style={{ fontFamily: L.sans, fontWeight: 700, fontSize: 76, letterSpacing: "-0.05em", color: L.ink, fontVariantNumeric: "tabular-nums" }}>≈ ${Math.round(dollars)}</span>
        <span style={{ fontFamily: L.sans, fontWeight: 500, fontSize: 40, color: L.muted }}>лише на ключі</span>
      </div>
    </div>
  );
};

// ───────────────────────────── CSHUNTER app ─────────────────────────────

const APP_W = 960;
const APP_H = 1180;
const APP_TOP = 1010 - APP_H / 2;
const TILE = { w: 420, h: 250, gap: 24, top: 240 };
const TILE_LEFT = (APP_W - (2 * TILE.w + TILE.gap)) / 2;
const APP_BTN_Y = APP_H - 50 - 50;

const KNIVES = [
  { img: "weapon_knife_karambit-38", name: "Karambit | Fade" },
  { img: "weapon_knife_butterfly-568", name: "Butterfly | Gamma Doppler" },
  { img: "weapon_knife_karambit-418", name: "Karambit | Doppler" },
  { img: "weapon_knife_m9_bayonet-409", name: "M9 | Tiger Tooth" },
  { img: "weapon_knife_karambit-413", name: "Karambit | Marble Fade" },
  { img: "weapon_knife_skeleton-38", name: "Skeleton | Fade" },
];

const tileCenter = (i: number) => ({
  x: 540 - APP_W / 2 + TILE_LEFT + (i % 2) * (TILE.w + TILE.gap) + TILE.w / 2,
  y: APP_TOP + TILE.top + Math.floor(i / 2) * (TILE.h + TILE.gap) + TILE.h / 2,
});

const AppCard: React.FC = () => {
  const frame = useCurrentFrame();
  const picked = useSpring(LT.click2, SNAP);
  const equipped = frame >= LT.click3;
  const btnPress = interpolate(frame, [LT.click3 - 3, LT.click3, LT.click3 + 6], [1, 0.95, 1], clamp);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* header */}
      <div style={{ position: "absolute", left: 48, right: 48, top: 36, height: 80, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={asset(BRAND.logoFile ?? "logo.png")} style={{ height: 64 }} />
        <span style={{ fontFamily: L.sans, fontWeight: 700, fontSize: 40, letterSpacing: "-0.04em", color: L.ink }}>CSHUNTER</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[0, 1, 2].map((d) => (
            <span key={d} style={{ width: 14, height: 14, borderRadius: 7, background: L.line }} />
          ))}
        </span>
      </div>
      {/* tabs */}
      <div style={{ position: "absolute", left: 48, top: 144, display: "flex", gap: 12 }}>
        {["Ножі", "Рукавички", "Гвинтівки"].map((t, i) => (
          <span
            key={t}
            style={{
              padding: "14px 26px",
              borderRadius: 30,
              background: i === 0 ? L.ink : L.tile,
              color: i === 0 ? "#fff" : L.muted,
              fontFamily: L.sans,
              fontWeight: 600,
              fontSize: 30,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      {/* tiles */}
      {KNIVES.map((k, i) => {
        const p = useSpringInline(frame, LT.appIn + 10 + i * 4);
        const sel = i === 0 ? picked : 0;
        return (
          <div
            key={k.img}
            style={{
              position: "absolute",
              left: TILE_LEFT + (i % 2) * (TILE.w + TILE.gap),
              top: TILE.top + Math.floor(i / 2) * (TILE.h + TILE.gap),
              width: TILE.w,
              height: TILE.h,
              borderRadius: 28,
              background: L.tile,
              boxShadow: sel > 0 ? `0 0 0 ${5 * sel}px ${L.accent}` : "none",
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px) scale(${1 + sel * 0.03})`,
              overflow: "hidden",
            }}
          >
            <Img src={asset(`skins/${k.img}.png`)} style={{ position: "absolute", left: 30, top: 12, width: TILE.w - 60, height: 170, objectFit: "contain" }} />
            <div style={{ position: "absolute", left: 22, right: 22, bottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: L.sans, fontWeight: 600, fontSize: 24, color: L.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</span>
              <span style={{ marginLeft: "auto", fontFamily: L.sans, fontWeight: 650, fontSize: 22, color: L.ink, background: L.accent, padding: "5px 12px", borderRadius: 14 }}>$0</span>
            </div>
            {i === 0 && sel > 0.05 ? (
              <div style={{ position: "absolute", right: 18, top: 16, width: 48, height: 48, borderRadius: 24, background: L.ink, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sel})` }}>
                <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" stroke={L.accent} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            ) : null}
          </div>
        );
      })}
      {/* equip button */}
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          top: APP_BTN_Y - 50,
          height: 100,
          borderRadius: 50,
          background: equipped ? L.accent : L.ink,
          color: equipped ? L.ink : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: L.sans,
          fontWeight: 650,
          fontSize: 40,
          transform: `scale(${btnPress})`,
        }}
      >
        {equipped ? "Екіпіровано · безкоштовно" : "Екіпірувати"}
      </div>
    </div>
  );
};

// Pure (non-hook) spring for use inside map callbacks.
const useSpringInline = (frame: number, at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps: 30, config: FAST }));

// ───────────────────────────── outro ─────────────────────────────

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useSpring(LT.outroIn + 4, SNAP);
  const dom = useSpring(LT.outroIn + 16, FAST);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Img src={asset(BRAND.logoFile ?? "logo.png")} style={{ marginTop: 80, width: 300, transform: `scale(${0.6 + 0.4 * logo})`, opacity: logo }} />
      <div style={{ marginTop: 30, fontFamily: L.sans, fontWeight: 750, fontSize: 96, letterSpacing: "-0.055em", color: L.ink, opacity: logo }}>CSHUNTER</div>
      <div
        style={{
          marginTop: 22,
          padding: "18px 44px",
          borderRadius: 60,
          background: L.ink,
          color: "#fff",
          fontFamily: L.sans,
          fontWeight: 600,
          fontSize: 52,
          letterSpacing: "-0.02em",
          opacity: dom,
          transform: `translateY(${(1 - dom) * 20}px)`,
          filter: `blur(${(1 - dom) * 8}px)`,
        }}
      >
        cshunter.com
      </div>
      <div style={{ marginTop: 56, width: 780 }}>
        <Words text="Грай з будь-якими скінами безкоштовно" at={LT.outroIn + 26} size={52} stagger={2} weight={620} mark="безкоштовно" />
      </div>
      <div style={{ marginTop: 44, width: 800, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {BRAND.modes.map((m, i) => {
          const p = useSpringInline(frame, LT.outroIn + 44 + i * 3);
          return (
            <span
              key={m}
              style={{
                padding: "14px 28px",
                borderRadius: 30,
                background: L.tile,
                border: `2px solid ${L.line}`,
                fontFamily: L.sans,
                fontWeight: 650,
                fontSize: 34,
                color: L.ink,
                opacity: p,
                transform: `scale(${0.8 + 0.2 * p})`,
              }}
            >
              {m}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────────────── composition ─────────────────────────────

export const KnifeChanceLight: React.FC<{ withSound?: boolean }> = ({ withSound = true }) => {
  const t0 = tileCenter(0);
  return (
    <AbsoluteFill style={{ background: L.canvas }}>
      <Noise />

      {/* Canvas headlines */}
      <div style={{ position: "absolute", top: 330, left: 90, right: 90 }}>
        <Words text="Який шанс вибити ніж у\u00A0CS2?" at={6} size={124} stagger={3} mark="ніж" exit={LT.hookOut} />
      </div>
      <div style={{ position: "absolute", top: 230, left: 80, right: 80 }}>
        <Words text="Або будь-який ніж. Безкоштовно." at={LT.appIn + 4} size={70} stagger={2} mark="Безкоштовно." exit={LT.outroIn - 4} />
      </div>

      <Shape keys={SHAPE}>
        <Layer from={6} to={LT.caseIn - 2} w={820} h={600}>
          <HookCard />
        </Layer>
        <Layer from={LT.caseIn + 2} to={LT.rouletteIn - 2} w={CASE_W} h={CASE_H}>
          <CaseCard />
        </Layer>
        <Layer from={LT.rouletteIn + 2} to={LT.oddsIn - 2} w={1000} h={440}>
          <Roulette />
        </Layer>
        <Layer from={LT.oddsIn + 2} to={LT.bigNumber - 2} w={920} h={1040}>
          <OddsCard />
        </Layer>
        <Layer from={LT.bigNumber + 2} to={LT.gridIn - 2} w={820} h={560}>
          <BigNumber />
        </Layer>
        <Layer from={LT.gridIn + 2} to={LT.orIn - 2} w={920} h={1160}>
          <GridCard />
        </Layer>
        <Layer from={LT.orIn + 4} to={LT.appIn - 2} w={340} h={132}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: L.sans, fontWeight: 600, fontSize: 60, color: "#fff", letterSpacing: "-0.03em" }}>
            Або…
          </div>
        </Layer>
        <Layer from={LT.appIn + 4} to={LT.outroIn - 2} w={APP_W} h={APP_H}>
          <AppCard />
        </Layer>
        <Layer from={LT.outroIn + 2} w={900} h={1060}>
          <Outro />
        </Layer>
      </Shape>

      <Cursor
        keys={[
          { t: 0, x: 980, y: 1760 },
          { t: 96, x: 560, y: 1000 - CASE_H / 2 + BTN_Y + 10 },
          { t: LT.click1 + 10, x: 900, y: 1640 },
          { t: LT.appIn + 20, x: 1000, y: 1760 },
          { t: LT.appIn + 30, x: t0.x + 20, y: t0.y + 20 },
          { t: LT.click2 + 8, x: 560, y: APP_TOP + APP_BTN_Y + 10 },
          { t: LT.click3 + 12, x: 900, y: 1660 },
        ]}
        clicks={[LT.click1, LT.click2, LT.click3]}
        show={[
          [92, LT.click1 + 22],
          [LT.appIn + 24, LT.click3 + 24],
        ]}
      />
      {withSound ? <LightSoundTrack /> : null}
    </AbsoluteFill>
  );
};

