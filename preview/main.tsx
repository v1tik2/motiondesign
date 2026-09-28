import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { KnifeChance } from "../src/KnifeChance";
import { FPS, HEIGHT, T, TOTAL, WIDTH } from "../src/theme";

const CHAPTERS = [
  { name: "Хук", from: T.hook.from },
  { name: "Рулетка", from: T.roulette.from },
  { name: "Шанси", from: T.odds.from },
  { name: "1 з 385", from: T.oneIn.from },
  { name: "Поворот", from: T.twist.from },
  { name: "Фінал", from: T.outro.from },
];

const fmt = (f: number) => {
  const s = f / FPS;
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}.${Math.floor((f % FPS) * (100 / FPS)).toString().padStart(2, "0")}`;
};

const App: React.FC = () => {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = ref.current;
      if (!p || (e.target as HTMLElement).tagName === "BUTTON") return;
      if (e.key === "ArrowRight") p.seekTo(Math.min(TOTAL - 1, p.getCurrentFrame() + (e.shiftKey ? FPS : 1)));
      if (e.key === "ArrowLeft") p.seekTo(Math.max(0, p.getCurrentFrame() - (e.shiftKey ? FPS : 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = CHAPTERS.reduce((a, c, i) => (frame >= c.from ? i : a), 0);

  return (
    <div className="stage">
      <div className="phone">
        <Player
          ref={ref}
          component={KnifeChance}
          inputProps={{ withSound: true }}
          durationInFrames={TOTAL}
          fps={FPS}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          controls
          loop
          clickToPlay
          doubleClickToFullscreen
          allowFullscreen
          style={{ width: "100%", height: "100%" }}
          numberOfSharedAudioTags={24}
          acknowledgeRemotionLicense
        />
      </div>
      <div className="side">
        <div className="readout">
          <span className="tc">{fmt(frame)}</span>
          <span className="fr">кадр {frame} / {TOTAL - 1}</span>
        </div>
        <ol className="chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.name}>
              <button
                type="button"
                id={`ch-${i}`}
                className={i === active ? "on" : ""}
                onClick={() => {
                  ref.current?.seekTo(c.from);
                  ref.current?.play();
                }}
              >
                <span className="t">{fmt(c.from).slice(0, 4)}</span>
                <span className="n">{c.name}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="hint">← → покадрово · Shift + ← → по секунді · подвійний клік — на весь екран</p>
      </div>
    </div>
  );
};

createRoot(document.getElementById("app")!).render(<App />);
