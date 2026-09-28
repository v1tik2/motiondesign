"""Procedural sound design for the CSHUNTER reel.

Every sound is synthesized from scratch (no samples → no licensing issues).
Writes 48 kHz / 16-bit WAVs to public/sfx/. The music bed is laid out on the
same 120 BPM grid as the video (1 beat = 15 frames @ 30 fps).

    python3 scripts/make_sounds.py
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48_000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)

BPM = 120
BEAT = 60 / BPM
FPS = 30
TOTAL_FRAMES = 840


def t(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    """Attack + exponential decay envelope of n samples."""
    x = np.arange(n) / SR
    att = np.clip(x / max(a, 1e-5), 0, 1)
    dec = np.exp(-np.maximum(x - a, 0) * curve / max(d, 1e-5))
    return att * dec


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def sweep_filter(x, f0, f1, kind="low", steps=64):
    """Time-varying filter by crossfading blocks (cheap and good enough)."""
    out = np.zeros_like(x)
    n = len(x)
    edges = np.linspace(0, n, steps + 1, dtype=int)
    for i in range(steps):
        f = f0 * (f1 / f0) ** (i / (steps - 1))
        f = min(max(f, 30), SR / 2 - 100)
        seg = slice(max(edges[i] - 512, 0), edges[i + 1])
        y = (lp if kind == "low" else hp)(x[seg], f)
        out[edges[i]:edges[i + 1]] = y[-(edges[i + 1] - edges[i]):]
    return out


def noise(n):
    return rng.uniform(-1, 1, n)


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def stereo(x, width=0.0):
    """Mono → stereo with optional Haas widening."""
    d = int(width * SR)
    l = x
    r = np.concatenate([np.zeros(d), x[: len(x) - d]]) if d else x
    return np.stack([l, r], axis=1)


def save(name, x):
    OUT.mkdir(parents=True, exist_ok=True)
    if x.ndim == 1:
        x = stereo(x)
    x = np.tanh(x * 1.1) / np.tanh(1.1)
    wavfile.write(OUT / f"{name}.wav", SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    print(f"  {name}.wav  {len(x) / SR:.2f}s")


# ───────────────────────────── one-shots ─────────────────────────────

def kick(dur=0.5, f0=150, f1=42, click=0.6):
    x = t(dur)
    freq = f1 + (f0 - f1) * np.exp(-x * 28)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * env(len(x), 0.001, dur, 5)
    c = hp(noise(len(x)), 2000) * env(len(x), 0.0005, 0.012, 6) * click
    return body + c


def sub_boom(dur=1.6):
    x = t(dur)
    freq = 30 + 70 * np.exp(-x * 9)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(len(x), 0.002, dur, 3.2)
    return body


def impact():
    """Cinematic hit: sub drop + noise crack + low tail."""
    n = int(1.8 * SR)
    boom = np.pad(sub_boom(1.8), (0, 0))[:n]
    crack = bp(noise(n), 600, 7000) * env(n, 0.001, 0.12, 5) * 0.8
    tail = lp(noise(n), 400) * env(n, 0.01, 1.4, 3) * 0.5
    return norm(boom * 1.0 + crack + tail, 0.95)


def slam():
    """Short punchy text hit."""
    n = int(0.6 * SR)
    k = kick(0.6, 180, 45, 1.0)[:n]
    snap = bp(noise(n), 1500, 9000) * env(n, 0.0005, 0.06, 5) * 0.7
    return norm(k + snap, 0.9)


def whoosh(dur=0.55, up=True):
    n = int(dur * SR)
    x = noise(n)
    f0, f1 = (300, 7000) if up else (7000, 300)
    y = sweep_filter(x, f0, f1, "low")
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return norm(y * shape, 0.7)


def reverse_whoosh(dur=0.7):
    n = int(dur * SR)
    y = sweep_filter(noise(n), 200, 9000, "low")
    shape = np.linspace(0, 1, n) ** 3
    return norm(y * shape, 0.75)


def tick():
    n = int(0.05 * SR)
    x = t(0.05)
    click = np.sin(2 * np.pi * 2600 * x) * env(n, 0.0003, 0.012, 6)
    body = np.sin(2 * np.pi * 900 * x) * env(n, 0.0003, 0.02, 6) * 0.5
    return norm(click + body + hp(noise(n), 3000) * env(n, 0.0002, 0.006, 6) * 0.4, 0.6)


def fail():
    """Descending 'nope' buzzer."""
    dur = 0.9
    x = t(dur)
    freq = 330 * (0.5 ** (x / dur * 1.3))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    y = lp(saw + 0.5 * np.sign(np.sin(ph * 1.01)), 1800) * env(len(x), 0.005, dur, 2.2)
    return norm(y, 0.6)


def ding():
    """Gold shimmer: bell partials + sparkle."""
    dur = 2.2
    x = t(dur)
    n = len(x)
    base = 1318.5  # E6
    partials = [(1, 1.0, 1.6), (2.01, 0.5, 1.0), (2.76, 0.35, 0.8), (4.07, 0.2, 0.5), (5.4, 0.12, 0.35)]
    bell = sum(a * np.sin(2 * np.pi * base * r * x) * env(n, 0.001, dur * d, 3.5) for r, a, d in partials)
    sparkle = np.zeros(n)
    for i in range(26):
        st = int(rng.uniform(0, 0.9) * SR)
        f = rng.uniform(3000, 9000)
        ln = int(0.12 * SR)
        seg = np.sin(2 * np.pi * f * np.arange(ln) / SR) * env(ln, 0.001, 0.1, 5)
        sparkle[st:st + ln] += seg[: n - st] * rng.uniform(0.05, 0.18)
    return norm(bell + sparkle, 0.7)


def glitch():
    dur = 0.45
    n = int(dur * SR)
    y = np.zeros(n)
    pos = 0
    while pos < n:
        ln = int(rng.uniform(0.01, 0.05) * SR)
        kind = rng.integers(0, 3)
        tt = np.arange(ln) / SR
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1200) * tt))
        elif kind == 1:
            seg = noise(ln)
        else:
            seg = np.zeros(ln)
        y[pos:pos + ln] = seg[: n - pos] * rng.uniform(0.3, 1)
        pos += ln
    y = np.round(y * 6) / 6  # bitcrush
    return norm(y, 0.55)


def pop(freq=900):
    dur = 0.18
    x = t(dur)
    f = freq * (1 + 1.5 * np.exp(-x * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.001, 0.12, 5)
    return norm(y, 0.6)


def riser(dur=2.0):
    x = t(dur)
    n = len(x)
    f = 110 * 2 ** (x / dur * 3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = sum(np.sin(ph * k) / k for k in range(1, 8))
    nz = sweep_filter(noise(n), 300, 12000, "low")
    shape = (x / dur) ** 2
    return norm((saw * 0.5 + nz) * shape, 0.7)


def coin_roll():
    """Rapid coin-like pings for the money counter."""
    dur = 0.95
    n = int(dur * SR)
    y = np.zeros(n)
    k = 0
    tt = 0.0
    while tt < dur - 0.1:
        st = int(tt * SR)
        ln = int(0.08 * SR)
        f = 2200 + 400 * (k % 3)
        seg = (np.sin(2 * np.pi * f * np.arange(ln) / SR) + 0.4 * np.sin(2 * np.pi * f * 2.7 * np.arange(ln) / SR)) * env(ln, 0.0005, 0.06, 5)
        y[st:st + ln] += seg[: n - st] * 0.5
        tt += 0.03 + 0.07 * (tt / dur) ** 2  # decelerates like the counter
        k += 1
    return norm(y, 0.55)


def click():
    """Crisp UI mouse click."""
    n = int(0.06 * SR)
    x = t(0.06)
    a = hp(noise(n), 2500) * env(n, 0.0002, 0.004, 6)
    b = np.sin(2 * np.pi * 3200 * x) * env(n, 0.0002, 0.008, 6) * 0.5
    c = np.concatenate([np.zeros(int(0.022 * SR)), (hp(noise(n), 3000) * env(n, 0.0002, 0.003, 6) * 0.5)[: n - int(0.022 * SR)]])
    return norm(a + b + c, 0.7)


def soft_whoosh(dur=0.42):
    """Airy morph swish."""
    n = int(dur * SR)
    y = sweep_filter(noise(n), 500, 3500, "low")
    y = hp(y, 250)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 3
    return norm(y * shape, 0.45)


def cash():
    """Register 'cha-ching' accent."""
    n = int(1.0 * SR)
    x = t(1.0)
    ch = bp(noise(n), 2000, 8000) * env(n, 0.001, 0.05, 5)
    ring = (np.sin(2 * np.pi * 2637 * x) + np.sin(2 * np.pi * 3520 * x)) * env(n, 0.001, 0.8, 4)
    y = ch + np.concatenate([np.zeros(int(0.07 * SR)), ring[: n - int(0.07 * SR)]]) * 0.5
    return norm(y, 0.7)


# ───────────────────────────── music bed ─────────────────────────────

# ───────────────────── unique UI palette (light reel) ─────────────────────

PENTA = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98]  # A minor pentatonic


def marimba(freq, dur=0.5):
    """Soft wooden mallet note."""
    x = t(dur)
    n = len(x)
    y = np.sin(2 * np.pi * freq * x) * env(n, 0.001, dur * 0.7, 4)
    y += 0.35 * np.sin(2 * np.pi * freq * 3.99 * x) * env(n, 0.001, 0.06, 5)
    y += 0.12 * np.sin(2 * np.pi * freq * 9.8 * x) * env(n, 0.0005, 0.02, 5)
    return norm(y, 0.55)


def bubble(freq):
    """Rising water-drop plop."""
    dur = 0.16
    x = t(dur)
    f = freq * (1 + 0.9 * (x / dur) ** 1.5)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 0.1, 4)
    return norm(y, 0.5)


def knock(freq=180):
    """Woody stop knock (roulette lands)."""
    n = int(0.3 * SR)
    x = t(0.3)
    body = np.sin(2 * np.pi * freq * x) * env(n, 0.001, 0.12, 5)
    body += 0.5 * np.sin(2 * np.pi * freq * 2.3 * x) * env(n, 0.001, 0.05, 5)
    tap = bp(noise(n), 800, 4000) * env(n, 0.0005, 0.015, 6) * 0.6
    return norm(body + tap, 0.6)


def thud():
    """Soft box landing."""
    n = int(0.45 * SR)
    x = t(0.45)
    f = 70 + 60 * np.exp(-x * 25)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.25, 4)
    y += lp(noise(n), 900) * env(n, 0.001, 0.05, 5) * 0.6
    return norm(y, 0.6)


def latch():
    """Case latch: two metallic clicks and a short creak."""
    n = int(0.5 * SR)
    y = np.zeros(n)
    for at, f in ((0.0, 3400), (0.07, 2800)):
        s0 = int(at * SR)
        ln = int(0.05 * SR)
        xx = np.arange(ln) / SR
        seg = (np.sin(2 * np.pi * f * xx) + 0.6 * np.sin(2 * np.pi * f * 1.51 * xx)) * env(ln, 0.0003, 0.02, 6)
        seg += hp(noise(ln), 3000) * env(ln, 0.0002, 0.004, 6)
        y[s0:s0 + ln] += seg
    s0 = int(0.14 * SR)
    ln = int(0.3 * SR)
    xx = np.arange(ln) / SR
    creak = bp(np.sign(np.sin(2 * np.pi * (60 + 25 * np.sin(xx * 30)) * xx)) * 0.5 + noise(ln) * 0.3, 400, 2200)
    y[s0:s0 + ln] += creak * env(ln, 0.02, 0.25, 3) * 0.35
    return norm(y, 0.6)


def scribble():
    """Highlighter swipe."""
    n = int(0.28 * SR)
    y = bp(noise(n), 2500, 7000) * (np.sin(np.linspace(0, np.pi, n)) ** 1.5)
    y *= 0.7 + 0.3 * np.sin(np.arange(n) / SR * 2 * np.pi * 38)
    return norm(y, 0.35)


def rain(dur=1.0):
    """Tiny sparkle grains for the grid filling in."""
    n = int(dur * SR)
    y = np.zeros(n)
    for _ in range(90):
        s0 = int(rng.uniform(0, dur * 0.85) * SR)
        f = rng.choice(PENTA) * rng.choice([2, 4])
        ln = int(0.04 * SR)
        seg = np.sin(2 * np.pi * f * np.arange(ln) / SR) * env(ln, 0.0005, 0.025, 5)
        y[s0:s0 + ln] += seg[: n - s0] * rng.uniform(0.05, 0.2)
    return norm(y * np.linspace(1, 0.4, n), 0.4)


def chime():
    """Glass chime for the big number."""
    dur = 1.6
    x = t(dur)
    n = len(x)
    y = sum(a * np.sin(2 * np.pi * f * x) * env(n, 0.002, dur * d, 3.5) for f, a, d in ((1760, 1, 1), (2637, 0.5, 0.7), (3520, 0.25, 0.4)))
    return norm(y, 0.5)


def select():
    """Two-tone UI select blip."""
    y = np.concatenate([marimba(1046.5, 0.09), marimba(1567.98, 0.25)])
    return norm(y, 0.5)


def success():
    """Rising major arpeggio for 'Equipped'."""
    notes = [523.25, 659.25, 783.99, 1046.5]
    out = np.zeros(int(0.9 * SR))
    for i, f in enumerate(notes):
        s0 = int(i * 0.06 * SR)
        m = marimba(f, 0.6)
        out[s0:s0 + len(m)] += m[: len(out) - s0] * (0.8 + 0.1 * i)
    return norm(out, 0.55)


def tick_var(freq):
    n = int(0.04 * SR)
    x = t(0.04)
    y = np.sin(2 * np.pi * freq * x) * env(n, 0.0003, 0.01, 6) + hp(noise(n), 4000) * env(n, 0.0002, 0.004, 6) * 0.3
    return norm(y, 0.5)


def music(drop_frame=585, gap_frame=570, total_frames=TOTAL_FRAMES, soft=False):
    """Bed: tension build (hook→stats), silence on 'АБО...', drop, outro."""
    TOTAL = total_frames
    total = TOTAL / FPS + 1.5
    n = int(total * SR)
    L = np.zeros(n)
    R = np.zeros(n)

    def add(sig, at, gain=1.0, pan=0.0):
        s = int(at * SR)
        if s >= n:
            return
        e = min(n, s + len(sig))
        seg = sig[: e - s] * gain
        L[s:e] += seg * (1 - max(pan, 0))
        R[s:e] += seg * (1 + min(pan, 0))

    f2s = lambda f: f / FPS
    DROP = f2s(drop_frame)
    GAP = (f2s(gap_frame), DROP)
    END = f2s(TOTAL)

    # Chords (A minor, dark): Am – F – C – G, one per bar.
    roots = [55.0, 43.65, 65.41, 49.0]
    chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]

    # Pad (detuned saws, low-passed), whole piece except the gap.
    bar = BEAT * 4
    b = 0
    while b * bar < END:
        st = b * bar
        ch = chords[b % 4]
        x = t(bar + 0.3)
        sig = np.zeros(len(x))
        for f in ch:
            for det in (-0.12, 0.0, 0.12):
                ph = 2 * np.pi * f * (1 + det / 100) * x
                sig += 2 * ((ph / (2 * np.pi)) % 1) - 1
        sig = lp(sig, 900 if st < DROP else 1600) / 9
        fade = np.minimum(1, np.minimum(x / 0.25, (bar + 0.3 - x) / 0.3))
        add(sig * fade, st, 0.22 if st < DROP else 0.3)
        b += 1

    # Low drone during the intro build.
    x = t(DROP)
    drone = np.sin(2 * np.pi * 55 * x) + 0.3 * np.sin(2 * np.pi * 110.3 * x)
    drone *= np.minimum(1, x / 1.5)
    add(lp(drone, 300), 0, 0.25)

    k = kick(0.45)
    k808 = kick(1.1, 120, 48, 0.3)
    hat = hp(noise(int(0.05 * SR)), 7000) * env(int(0.05 * SR), 0.0005, 0.03, 5)
    ohat = hp(noise(int(0.2 * SR)), 6000) * env(int(0.2 * SR), 0.001, 0.15, 4)
    clapn = int(0.25 * SR)
    clap = bp(noise(clapn), 900, 6000) * (env(clapn, 0.001, 0.02, 5) + np.roll(env(clapn, 0.001, 0.02, 5), 480) * 0.8 + np.roll(env(clapn, 0.001, 0.18, 4), 960) * 0.7)
    snare_roll_hit = bp(noise(int(0.12 * SR)), 1200, 8000) * env(int(0.12 * SR), 0.001, 0.08, 5)

    beats = int(END / BEAT) + 2
    for i in range(beats):
        tb = i * BEAT
        if GAP[0] <= tb < GAP[1]:
            continue
        pre = tb < GAP[0]
        # Heartbeat intro (first 3 s): kicks only on 1 and the "and" of 1.
        if tb < 3.0:
            if i % 2 == 0:
                add(k, tb, 0.55)
                add(k, tb + BEAT * 0.4, 0.35)
            continue
        if pre:
            add(k, tb, 0.6)
            add(hat, tb + BEAT / 2, 0.22, 0.3)
            if tb > 8.0:
                add(hat, tb, 0.14, -0.3)
                add(hat, tb + BEAT * 0.75, 0.1, 0.4)
            if tb > 8.0 and i % 4 == 2:
                add(clap, tb, 0.35)
            # Bass pluck from the stats section on.
            if tb > 8.0:
                r = roots[int(tb / bar) % 4]
                bx = t(BEAT * 0.9)
                bass = np.sin(2 * np.pi * r * 2 * bx) * env(len(bx), 0.003, 0.35, 3)
                add(bass, tb, 0.35)
        else:
            # Drop: trap-ish half-time with 808 slides.
            if i % 4 == 0:
                r = roots[int(tb / bar) % 4]
                bx = t(BEAT * 2)
                f = r * (1 + 0.6 * np.exp(-bx * 30))
                s808 = np.tanh((1.2 if soft else 2.5) * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(bx), 0.002, BEAT * 2, 2.2)
                add(s808, tb, 0.45 if soft else 0.55)
                add(k, tb, 0.7)
            if i % 4 == 2:
                add(clap, tb, 0.55)
                add(k, tb + BEAT * 0.5, 0.4)
            for sub in range(4 if (i % 8) < 6 else 6):
                step = BEAT / (4 if (i % 8) < 6 else 6)
                add(hat, tb + sub * step, (0.1 if sub % 2 else 0.14) if soft else (0.16 if sub % 2 else 0.22), 0.35 if sub % 2 else -0.35)
            if i % 8 == 7:
                add(ohat, tb + BEAT / 2, 0.25)

    # Snare roll into the gap (last beat before 'АБО').
    for j in range(8):
        add(snare_roll_hit, GAP[0] - BEAT * 2 + j * BEAT / 4, 0.12 + j * 0.04)

    # Final fade-out.
    fade_st = int((END - 1.2) * SR)
    fade = np.ones(n)
    fade[fade_st:] = np.linspace(1, 0, n - fade_st) ** 1.5
    L *= fade
    R *= fade
    mix = np.stack([L, R], axis=1)
    return norm(mix, 0.8)


if __name__ == "__main__":
    print("Synthesizing SFX →", OUT)
    save("impact", impact())
    save("slam", slam())
    save("whoosh", stereo(whoosh(), 0.012))
    save("whoosh_down", stereo(whoosh(0.5, up=False), 0.012))
    save("reverse", stereo(reverse_whoosh(), 0.015))
    save("tick", tick())
    save("fail", fail())
    save("ding", stereo(ding(), 0.018))
    save("glitch", glitch())
    save("pop", pop())
    save("pop_hi", pop(1400))
    save("riser", stereo(riser(), 0.02))
    save("coins", stereo(coin_roll(), 0.01))
    save("cash", cash())
    save("music", music())
    save("click", click())
    save("swish", stereo(soft_whoosh(), 0.01))
    save("music_light", music(drop_frame=510, gap_frame=482, total_frames=780, soft=True))
    for i, f in enumerate(PENTA):
        save(f"note_{i}", marimba(f))
    for i, f in enumerate([520, 600, 680, 760, 860, 960]):
        save(f"bubble_{i}", bubble(f))
    for i, f in enumerate([2300, 2500, 2700, 2900]):
        save(f"tick_{i}", tick_var(f))
    save("knock", knock())
    save("thud", thud())
    save("latch", latch())
    save("scribble", scribble())
    save("rain", stereo(rain(), 0.012))
    save("chime", stereo(chime(), 0.015))
    save("select", select())
    save("success", stereo(success(), 0.01))
