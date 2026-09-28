import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background, Flash, clamp, usePop, useShake } from "../components/fx";
import { Knife3D, KNIVES } from "../components/Knife3D";
import { Slam } from "../components/text";
import { C } from "../theme";

export const HOOK_HITS = [4, 14, 26, 40]; // slam frames, reused by the sound track

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 16, 0.9);
  const shake = useShake(HOOK_HITS[2], 26, 12);
  const out = interpolate(frame, [78, 90], [1, 0], clamp);
  const zoomOut = interpolate(frame, [78, 90], [1, 1.25], clamp);

  return (
    <AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px)` }}>
      <Background tint={C.gold} intensity={0.3 + 0.15 * Math.sin(frame / 6)} />
      <AbsoluteFill style={{ top: 420, opacity: out, transform: `scale(${zoomOut})` }}>
        <Knife3D model="weapon_knife_karambit.glb" skins={[KNIVES.karambitDoppler]} enter={enter} spin={0.045} scale={1.15} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          top: 250,
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 18,
          opacity: out,
        }}
      >
        <Slam at={HOOK_HITS[0]} size={104}>
          ЯКИЙ ШАНС
        </Slam>
        <Slam at={HOOK_HITS[1]} size={104}>
          ВИБИТИ
        </Slam>
        <Slam at={HOOK_HITS[2]} size={210} color={C.gold} glow={C.gold}>
          НІЖ
        </Slam>
        <Slam at={HOOK_HITS[3]} size={96} color={C.white} style={{ opacity: 0.9 }}>
          В CS2<span style={{ color: C.gold }}>?</span>
        </Slam>
      </AbsoluteFill>
      <Flash at={HOOK_HITS[2]} length={6} color={C.gold} />
    </AbsoluteFill>
  );
};
