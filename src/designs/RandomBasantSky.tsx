import { useEffect, useRef, useState } from 'react';
import {
  anchor,
  botAnchor,
  clamp,
  createRound,
  createSky,
  outcome,
  skyBounds,
  stepRound,
  stepSky,
} from './kiteSimulation';
import type { Point } from './kiteSimulation';
type Stage = 'closed' | 'playing' | 'paused' | 'won' | 'lost';
const palette = [
  '#bd684e',
  '#759e8b',
  '#c8a453',
  '#829cac',
  '#a85e65',
  '#718467',
  '#bc8b57',
  '#658d94',
  '#b17582',
  '#8e9c58',
  '#ce956c',
  '#7789a0',
];
const population = () => (window.innerWidth < 768 ? 5 : 8);
const freshSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
function KiteShape({ color }: { color: string }) {
  return (
    <g className="v-kite-shape" stroke="currentColor" strokeWidth="1.2">
      <path d="m0-28 22 27L0 28-22-1Z" style={{ fill: color }} />
      <path d="M0-28v56M-22-1h44M0 28c-15 20 12 27-1 45" fill="none" />
    </g>
  );
}

export default function RandomBasantSky({
  paused,
  reduced,
  capture,
  onActiveChange,
}: {
  paused: boolean;
  reduced: boolean;
  capture: boolean;
  onActiveChange: (open: boolean) => void;
}) {
  const [stage, setStage] = useState<Stage>('closed');
  const [sessionSeed] = useState(() => (capture ? 2026 : freshSeed()));
  const randomSeed = useRef(sessionSeed);
  const nextSeed = () =>
    (randomSeed.current = (Math.imul(randomSeed.current, 1664525) + 1013904223) >>> 0);
  const [initialSky] = useState(() =>
    createSky(population(), sessionSeed, innerWidth, innerHeight),
  );
  const sky = useRef(initialSky);
  const [skyView, setSkyView] = useState(initialSky);
  const [view, setView] = useState(() =>
    createRound(initialSky.kites, 0, initialSky.bounds, nextSeed()),
  );
  const round = useRef(view);
  const [count, setCount] = useState(population);
  const ambient = useRef<HTMLDivElement>(null);
  const field = useRef<SVGSVGElement>(null);
  const target = useRef<Point>({ x: 500, y: 290 });
  const input = useRef({ pointer: false, key: false, button: false, keys: new Set<string>() });
  const opener = useRef<HTMLElement | null>(null);
  const selected = useRef(0);
  const seed = useRef(view);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [overText, setOverText] = useState<Set<number>>(() => new Set());
  const open = (id: number) => {
    if (stage !== 'closed') return;
    opener.current = document.activeElement as HTMLElement;
    selected.current = id;
    const positions = sky.current.kites.map((kite) => ({ ...kite }));
    const state = createRound(positions, id, { ...sky.current.bounds }, nextSeed());
    seed.current = structuredClone(state);
    round.current = structuredClone(state);
    setView(structuredClone(state));
    target.current = { ...state.player };
    setStage('playing');
    setAnnouncement(
      'Round started. Last kite flying wins. Watch for crossed lines and release to protect your string.',
    );
  };
  const start = () => {
    round.current = createRound(
      [
        { ...sky.current.kites.find((k) => k.id === selected.current)!, ...seed.current.player },
        ...seed.current.bots,
      ],
      selected.current,
      seed.current.bounds,
      nextSeed(),
    );
    target.current = { ...seed.current.player };
    setView(structuredClone(round.current));
    setStage('playing');
    setAnnouncement(
      'Round started. Last kite flying wins. Watch for crossed lines and release to protect your string.',
    );
  };
  const close = () => {
    setStage('closed');
  };
  const clearInput = () => {
    input.current = { pointer: false, key: false, button: false, keys: new Set() };
  };

  useEffect(() => {
    if (stage !== 'closed' || !ambient.current) return;
    const soften = () => {
      const root = ambient.current?.closest('.basant-page');
      const textBoxes = Array.from(
        root?.querySelectorAll('.v-composition :is(h1,h2,h3,p,.h-eyebrow,.h-tags > span)') || [],
      ).flatMap((el) => {
        if (!el.getClientRects().length) return [];
        const range = document.createRange();
        range.selectNodeContents(el);
        return Array.from(range.getClientRects());
      });
      const intersecting = new Set<number>();
      ambient.current?.querySelectorAll<HTMLElement>('.v-kite').forEach((kite) => {
        const box = kite.getBoundingClientRect();
        const overText = textBoxes.some(
          (text) =>
            box.right > text.left &&
            box.left < text.right &&
            box.bottom > text.top &&
            box.top < text.bottom,
        );
        if (overText) intersecting.add(Number(kite.dataset.kiteId));
      });
      setOverText((previous) =>
        previous.size === intersecting.size && [...previous].every((id) => intersecting.has(id))
          ? previous
          : intersecting,
      );
    };
    soften();
    const timer = window.setInterval(soften, 100);
    return () => clearInterval(timer);
  }, [stage, count]);

  useEffect(() => {
    if (stage !== 'closed') return;
    const resize = () => {
      const next = population();
      if (sky.current.kites.length !== next)
        sky.current = createSky(next, freshSeed(), innerWidth, innerHeight);
      sky.current.bounds = skyBounds(innerWidth, innerHeight);
      sky.current.kites.forEach((k) => {
        if (!k.cut) {
          k.x = clamp(k.x, sky.current.bounds.left, sky.current.bounds.right);
          k.y = clamp(k.y, sky.current.bounds.top, sky.current.bounds.bottom);
        }
      });
      setCount(next);
      setSkyView(structuredClone(sky.current));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'closed' || paused || reduced || capture) return;
    let frame = 0,
      previous = performance.now(),
      lastPaint = 0;
    const tick = (now: number) => {
      stepSky(sky.current, Math.min((now - previous) / 1000, 0.045));
      previous = now;
      if (now - lastPaint > 32) {
        setSkyView(structuredClone(sky.current));
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage, paused, reduced, capture]);

  useEffect(() => {
    const surface = field.current;
    if (!surface) return;
    const resize = new ResizeObserver(() => {
      const box = surface.getBoundingClientRect();
      surface.style.setProperty('--kite-shape-x', String((1000 * box.height) / (650 * box.width)));
      const bounds = skyBounds(innerWidth, innerHeight);
      round.current.bounds = bounds;
      seed.current.bounds = bounds;
    });
    resize.observe(surface);
    return () => resize.disconnect();
  }, [stage]);

  useEffect(() => {
    const active = stage !== 'closed';
    onActiveChange(active);
    if (stage !== 'playing') clearInput();
    if (!active) opener.current?.focus();
    if (stage === 'playing') field.current?.focus();
  }, [stage, onActiveChange]);

  useEffect(() => {
    if (stage === 'closed') return;
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (stage !== 'playing' || e.target instanceof HTMLButtonElement) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        input.current.keys.add(e.key);
        if (e.key === ' ') input.current.key = true;
        if (e.key.toLowerCase() === 'd') {
          input.current.key = false;
          input.current.pointer = false;
          input.current.button = false;
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      input.current.keys.delete(e.key);
      if (e.key === ' ') {
        e.preventDefault();
        input.current.key = false;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [stage]);

  useEffect(() => {
    const release = () => {
      clearInput();
      setStage((s) => (s === 'playing' ? 'paused' : s));
    };
    const visibility = () => {
      if (document.hidden) release();
    };
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    let frame = 0,
      previous = performance.now(),
      lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.045);
      previous = now;
      const r = round.current;
      const keys = input.current.keys;
      target.current.x = clamp(
        target.current.x +
          ((keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)) * dt * 300,
        r.bounds.left,
        r.bounds.right,
      );
      target.current.y = clamp(
        target.current.y +
          ((keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0)) * dt * 250,
        r.bounds.top,
        r.bounds.bottom,
      );
      stepRound(
        r,
        dt,
        target.current,
        input.current.pointer || input.current.key || input.current.button,
        reduced,
      );
      const result = outcome(r);
      if (result !== 'playing') {
        setView(structuredClone(r));
        setStage(result);
        setAnnouncement(
          result === 'won'
            ? 'You are the last kite flying. Round won.'
            : 'Your line broke. Replay or leave using the controls.',
        );
        return;
      }
      if (now - lastPaint > 32) {
        setView(structuredClone(r));
        lastPaint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stage, reduced]);

  const move = (event: { clientX: number; clientY: number }) => {
    if (stage !== 'playing') return;
    target.current = {
      x: clamp(
        (event.clientX / innerWidth) * 1000,
        round.current.bounds.left,
        round.current.bounds.right,
      ),
      y: clamp(
        (event.clientY / innerHeight) * 650,
        round.current.bounds.top,
        round.current.bounds.bottom,
      ),
    };
  };
  const playing = stage === 'playing';
  const active = stage !== 'closed';
  const release = () => {
    input.current.pointer = false;
    gesture.current = null;
  };
  return (
    <>
      <div
        ref={ambient}
        className={`v-kite-layer is-simulated ${active ? 'is-game' : ''}`}
        aria-label="kite sky"
      >
        {palette.slice(0, count).map((color, id) => {
          const bot = view.bots.find((b) => b.id === id);
          const idle = skyView.kites.find((k) => k.id === id)!;
          const point = active ? (selected.current === id ? view.player : bot!) : idle;
          const flight = active ? bot : idle;
          const controlled = active && selected.current === id;
          return (
            <button
              key={id}
              type="button"
              data-kite-id={id}
              data-player={controlled}
              data-bot={active && !controlled}
              data-cut={!!flight?.cut}
              className="v-kite"
              data-flight={flight?.maneuver ?? 'glide'}
              data-strength={
                controlled ? Math.round(view.strength) : Math.round(flight?.strength ?? 100)
              }
              data-cut-by={flight?.cutBy ?? undefined}
              disabled={!controlled && !!flight?.cut}
              style={{
                left: `calc(${point.x / 10}% - 22px)`,
                top: `calc(${point.y / 6.5}% - 23.375px)`,
                animation: 'none',
                transform:
                  (controlled && stage === 'lost') ||
                  (active && (stage === 'won' || stage === 'lost') && flight?.cut)
                    ? 'translateY(140px) rotate(35deg)'
                    : 'none',
                opacity:
                  (controlled && stage === 'lost') ||
                  (active && (stage === 'won' || stage === 'lost') && flight?.cut)
                    ? 0
                    : (flight?.opacity ?? 1) * (active ? 1 : overText.has(id) ? 0.16 : 0.72),
              }}
              aria-label={
                controlled
                  ? 'your kite: drag to steer'
                  : active
                    ? 'opponent kite'
                    : `select kite ${id + 1} to play`
              }
              tabIndex={active && !controlled ? -1 : 0}
              onPointerDown={(e) => {
                if (stage === 'closed') {
                  gesture.current = { x: e.clientX, y: e.clientY, id };
                  e.currentTarget.setPointerCapture(e.pointerId);
                } else if (controlled && playing) {
                  input.current.pointer = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  field.current?.focus();
                  move(e);
                }
              }}
              onPointerMove={(e) => {
                const drag = gesture.current;
                if (
                  stage === 'closed' &&
                  drag?.id === id &&
                  Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6
                ) {
                  e.currentTarget.focus();
                  gesture.current = null;
                  open(id);
                  input.current.pointer = true;
                } else if (controlled && playing) move(e);
              }}
              onPointerUp={release}
              onPointerCancel={release}
              onClick={() => {
                if (stage === 'closed') open(id);
              }}
            >
              <svg viewBox="-32 -34 64 112" aria-hidden="true">
                <g
                  style={{
                    transform: `rotate(${controlled ? 0 : (flight?.angle ?? 0)}deg)`,
                    transformOrigin: '0px 0px',
                  }}
                >
                  <KiteShape color={color} />
                </g>
              </svg>
              {controlled && <span className="v-kite-owner">you</span>}
            </button>
          );
        })}
      </div>
      {active && (
        <>
          <svg
            ref={field}
            className="v-game-field v-inline-game-field"
            viewBox="0 0 1000 650"
            preserveAspectRatio="none"
            tabIndex={0}
            role="application"
            aria-label="kite game sky"
            aria-describedby="kite-controls"
            onPointerDown={(e) => {
              if (!playing) return;
              move(e);
              input.current.pointer = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.focus();
            }}
            onPointerMove={move}
            onPointerUp={release}
            onPointerCancel={release}
          >
            {view.bots.map(
              (bot, i) =>
                !bot.cut && (
                  <line
                    key={bot.id}
                    x1={botAnchor(i, view.bots.length)}
                    y1="760"
                    x2={bot.x}
                    y2={bot.y}
                    data-bot-id={bot.id}
                    data-warning={bot.exposure > 0.1}
                    className="v-bot-line"
                  />
                ),
            )}
            <line
              x1={anchor.x}
              y1={anchor.y}
              x2={view.player.x}
              y2={view.player.y}
              className={`v-player-line ${view.contact ? 'is-contact' : ''} ${view.danger ? 'is-danger' : ''}`}
            />
          </svg>
          <section
            className="v-game-hud"
            aria-label="kite controls"
            data-danger={view.danger || view.tension > 80}
          >
            <div className="v-game-heading">
              <strong>
                {stage === 'paused'
                  ? 'paused'
                  : stage === 'won'
                    ? 'well flown.'
                    : stage === 'lost'
                      ? 'a fresh string?'
                      : `${view.bots.filter((b) => !b.cut).length} opponents left`}
              </strong>
              <span>
                {stage === 'won'
                  ? 'Last kite flying. The sky is yours.'
                  : stage === 'lost'
                    ? 'Your line broke. Release sooner or evade a crossing.'
                    : stage === 'paused'
                      ? 'Your kite is waiting.'
                      : view.danger
                        ? 'line under attack · release or evade'
                        : view.contact
                          ? 'lines crossed · pull, then release'
                          : 'last kite flying wins'}
              </span>
              <button
                className="d-btn d-btn-ghost"
                onClick={
                  stage === 'won' || stage === 'lost'
                    ? start
                    : () => setStage(playing ? 'paused' : 'playing')
                }
              >
                {stage === 'won' || stage === 'lost' ? 'fly again' : playing ? 'pause' : 'resume'}
              </button>
              <button className="d-btn d-btn-ghost" onClick={close} aria-label="leave kite game">
                leave sky ×
              </button>
            </div>
            <div className="v-game-controls">
              <label>
                tension{' '}
                <progress
                  className="d-progress"
                  aria-label="line tension"
                  value={view.tension}
                  max="100"
                />
              </label>
              <label>
                line{' '}
                <progress
                  className="d-progress"
                  aria-label="line strength"
                  value={view.strength}
                  max="100"
                />
              </label>
              <button
                className="d-btn d-btn-outline v-pull-button"
                disabled={!playing}
                onPointerDown={(e) => {
                  input.current.button = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={() => {
                  input.current.button = false;
                }}
                onPointerCancel={() => {
                  input.current.button = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') input.current.button = true;
                }}
                onKeyUp={() => {
                  input.current.button = false;
                }}
              >
                hold to pull
              </button>
            </div>
            <p id="kite-controls" className="v-game-help">
              last kite flying wins · drag or arrows to steer · hold or Space to pull · release or D
              for slack · Esc to leave
            </p>
          </section>
        </>
      )}
      <p className="v-game-announcement" role="status">
        {announcement}
      </p>
    </>
  );
}
