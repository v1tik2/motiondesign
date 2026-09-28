# CSHUNTER — motion design reels

Vertical (1080×1920, 30 fps) promo reels for Reels / TikTok / Threads, built in code with
[Remotion](https://www.remotion.dev/) + three.js. Sound design is fully synthesized (`scripts/make_sounds.py`).

## Reel: «Який шанс вибити ніж в CS2?» (`KnifeChance`, 28 s)

| Time | Scene |
| --- | --- |
| 0–3 s | Hook — 3D Karambit Doppler, «ЯКИЙ ШАНС ВИБИТИ НІЖ В CS2?» |
| 3–8 s | Case opening roulette → lands one card short of the knife, «МИМО» |
| 8–14 s | Valve's official odds: 79.92 / 15.98 / 3.20 / 0.64 / **0.26 %** |
| 14–19 s | «1 з 385» grid → ≈ $959 on keys alone |
| 19–23 s | «АБО...» → beat drop, 3D knives swapping skins, «БУДЬ-ЯКИЙ НІЖ — БЕЗКОШТОВНО» |
| 23–28 s | Logo, CSHUNTER.COM, modes (DM, DUELS, BHOP, SURF, AWP, ARENA, KZ, 2v2, 5v5), CTA |

## Commands

```bash
npm install
python3 scripts/make_sounds.py      # regenerate SFX + music (needs numpy, scipy)
npm run studio                      # live preview in the browser
npm run render                      # → out/knife-chance.mp4
```

## Customizing

- `src/brand.ts` — domain, modes list, odds, key price. **Real logo:** put it in `public/logo.png`
  and set `logoFile: "logo.png"` (a crosshair placeholder is drawn until then).
- `src/theme.ts` — colors, fonts, scene timing (120 BPM grid: 1 beat = 15 frames).
- `src/SoundTrack.tsx` — every sound cue and its volume.

## Assets

- 3D knife models/textures: [LielXD/CS2-WeaponPaints-Website](https://github.com/LielXD/CS2-WeaponPaints-Website)
- Skin renders: [Nereziel/cs2-WeaponPaints](https://github.com/Nereziel/cs2-WeaponPaints)
- Case / rare-item icons: [ByMykel/counter-strike-image-tracker](https://github.com/ByMykel/counter-strike-image-tracker)
- Fonts: Unbounded, Inter (OFL, via Fontsource)

Counter-Strike item art © Valve Corporation.
