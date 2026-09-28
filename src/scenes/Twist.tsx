import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Background, Flash, Glitch, clamp, usePop, useShake } from "../components/fx";
import { Knife3D, KNIVES } from "../components/Knife3D";
import { Slam, Stamp } from "../components/text";
import { C, DISPLAY } from "../theme";

export const TWIST_DROP = 15; // beat drop — music hits here
export const TWIST_SWAP = 63; // second knife model
export const TWIST_FREE = 36;

const KnifeShot: React.FC<{ model: string; skins: (typeof KNIVES)[keyof typeof KNIVES][] }> = ({ model, skins }) => {
  const enter = usePop(0, 13, 0.7);
  return <Knife3D model={model} skins={skins} swapEvery={12} spin={0.07} enter={enter} scale={1.2} />;
};

export const Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = useShake(TWIST_FREE, 24, 12);
  const pre = frame < TWIST_DROP;
  const out = interpolate(frame, [110, 120], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: out }}>
      {pre ? (
        <Glitch from={4} length={10}>
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 900,
                fontSize: 180,
                color: C.white,
                transform: `scale(${interpolate(frame, [0, TWIST_DROP], [0.9, 1.15])})`,
              }}
            >
              АБО<span style={{ color: C.gold }}>...</span>
            </div>
          </AbsoluteFill>
        </Glitch>
      ) : (
        <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
          <Background tint={C.gold} intensity={0.45} />
          <AbsoluteFill style={{ top: 120 }}>
            <Sequence from={TWIST_DROP} durationInFrames={TWIST_SWAP - TWIST_DROP} layout="none">
              <KnifeShot model="weapon_knife_karambit.glb" skins={[KNIVES.karambitFade, KNIVES.karambitDoppler, KNIVES.karambitMarble, KNIVES.karambitCaseHardened]} />
            </Sequence>
            <Sequence from={TWIST_SWAP} layout="none">
              <KnifeShot model="weapon_knife_butterfly.glb" skins={[KNIVES.butterflyGamma, KNIVES.butterflyFade, KNIVES.m9Doppler]} />
            </Sequence>
          </AbsoluteFill>
          <AbsoluteFill style={{ top: 280, alignItems: "center" }}>
            <Slam at={TWIST_DROP + 2} size={96}>
              БУДЬ-ЯКИЙ
            </Slam>
            <Slam at={TWIST_DROP + 8} size={170} color={C.gold} glow={C.gold} style={{ marginTop: 10 }}>
              НІЖ
            </Slam>
          </AbsoluteFill>
          <AbsoluteFill style={{ top: 1330, alignItems: "center" }}>
            <Stamp at={TWIST_FREE} color={C.gold} size={80} rotate={-5}>
              БЕЗКОШТОВНО
            </Stamp>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      <Flash at={TWIST_DROP} length={9} />
      <Flash at={TWIST_SWAP} length={6} color={C.gold} />
    </AbsoluteFill>
  );
};
