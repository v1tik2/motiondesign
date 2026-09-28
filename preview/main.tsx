import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, PlayerRef } from "@remotion/player";
import { KnifeChance } from "../src/KnifeChance";
import { FPS, HEIGHT, T, TOTAL, WIDTH, loadFonts } from "../src/theme";
import manifest from "./manifest.json";
import { preloadKnives } from "../src/components/Knife3D";

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

// Fetch every asset once into blob: URLs so the sandboxed page never loads by path.
const preload = async (onProgress: (p: number) => void) => {
  const entries = Object.entries(manifest as Record<string, string>);
  const map: Record<string, string> = {};
  let done = 0;
  await Promise.all(
    entries.map(async ([key, file]) => {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`${file}: ${res.status}`);
      map[key] = URL.createObjectURL(await res.blob());
      onProgress(++done / entries.length);
    }),
  );
  window.__assets = map;
};

const Loader: React.FC = () => {
  const [p, setP] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    window.__previewDpr = 0.5;
    preload(setP)
      .then(() => {
        loadFonts();
        return Promise.all([document.fonts.ready, preloadKnives()]);
      })
      .then(() => setReady(true))
      .catch((e) => setErr(String(e)));
  }, []);
  if (ready) return <App />;
  return (
    <div className="stage">
      <div className="phone loading">
        <div className="bar"><i style={{ width: `${Math.round(p * 100)}%` }} /></div>
        <span>{err ? `Не вдалося завантажити: ${err}` : `Завантажую скіни, 3D і звук… ${Math.round(p * 100)}%`}</span>
      </div>
    </div>
  );
};

createRoot(document.getElementById("app")!).render(<Loader />);
