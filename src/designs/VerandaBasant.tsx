import { useEffect, useRef, useState } from 'react';
import { experience, projects } from '../data';
import '../styles/veranda-basant.css';
import { GeometryMark, GeometricBand, LahoreSkyline } from './LahoreArchitecture';
import BasantSky from './RandomBasantSky';

const chapters = ['home', 'projects', 'books', 'experience', 'thoughts'] as const;
type Chapter = (typeof chapters)[number];
const chapterNames = ['home', 'work', 'books', 'experience', 'thoughts'];

function AlternatingName({ paused, capture }: { paused: boolean; capture: boolean }) {
  const [urdu, setUrdu] = useState(false);
  useEffect(() => {
    if (paused || capture) {
      setUrdu(false);
      return;
    }
    const timer = window.setInterval(() => setUrdu((v) => !v), 5500);
    return () => clearInterval(timer);
  }, [paused, capture]);
  return (
    <h1
      className="h-serif v-alternating-name"
      id="v-name"
      aria-label="Abdullah"
      data-language={urdu ? 'ur' : 'en'}
    >
      <span className="v-name-english" lang="en" aria-hidden="true">
        abdullah<span>.</span>
      </span>
      <span className="v-name-urdu" lang="ur" dir="rtl" aria-hidden="true">
        عبداللہ
      </span>
    </h1>
  );
}

function Flower({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1">
        <path d="M32 56V25M32 45C12 45 11 32 15 31c8-1 14 8 17 14ZM32 39c20 0 21-13 17-14-8-1-14 8-17 14Z" />
        <path d="M32 28C8 22 20 8 25 14c-2-16 16-16 14 0 5-6 17 8-7 14Z" />
        <path d="M28 24c-7-8-1-14 4-16 5 2 11 8 4 16" />
      </g>
      <circle cx="32" cy="27" r="3" fill="currentColor" />
    </svg>
  );
}

function ExperienceList() {
  return (
    <section className="v-experience h-experience">
      <span className="h-eyebrow">experience & education</span>
      <h2 className="h-serif">the story so far.</h2>
      <ul className="v-bullet-list v-experience-list">
        {['building', 'studying', 'exploring'].map((t, i) => (
          <li key={t}>
            <span className="h-eyebrow">{t}</span>
            <h3 className="h-serif">
              {['nexaquanta', 'university of waterloo', 'independent projects'][i]}
            </h3>
            <p>
              {
                [
                  experience,
                  'Computer Science. Interested in intelligent systems and efficient computation.',
                  'Graphics, scientific machine learning, algorithms, and lower-level systems.',
                ][i]
              }
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectCollection() {
  return (
    <ul className="v-projects v-bullet-list">
      {projects.map((p) => (
        <li key={p.id}>
          <h3 className="h-serif">{p.title.toLowerCase()}</h3>
          <span className="h-eyebrow">{p.category.toLowerCase()}</span>
          <p>{p.description}</p>
          <p>{p.detail}</p>
          <div className="h-tags">
            {p.tech.map((t) => (
              <span key={t} className="d-badge d-badge-outline d-badge-sm">
                {t.toLowerCase()}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
function ReadingCollection({ writing = false }: { writing?: boolean }) {
  const titles = writing
    ? ['on making something smaller', 'what a project leaves out', 'a few things worth keeping']
    : ['the design of everyday things', 'a philosophy of software design', 'the creative act'];
  return (
    <div className="v-reading">
      <span className="h-eyebrow">
        {writing ? 'sample writing · layout preview' : 'sample bookshelf · selections to confirm'}
      </span>
      <ul className="v-bullet-list">
        {titles.map((title, i) => (
          <li key={title}>
            <h3 className="h-serif">{title}</h3>
            <span className="h-eyebrow">
              {writing
                ? 'a space for a personal note'
                : ['don norman', 'john ousterhout', 'rick rubin'][i]}
            </span>
            <p>
              {writing
                ? 'This space is reserved for Abdullah’s own writing. The title and this reading state are samples.'
                : 'A sample book selection showing how a reading note would open. Personal book choices and notes are still to be confirmed.'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VerandaBasant() {
  const scroll = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Chapter>('home');
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [paused, setPaused] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [night, setNight] = useState(() => {
    try {
      return localStorage.getItem('portfolio-night') === 'true';
    } catch {
      return false;
    }
  });
  const [changingLight, setChangingLight] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem('portfolio-night', String(night));
    } catch {
      /* Optional preference. */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', night ? '#202b33' : '#f9f8f3');
    const timer = window.setTimeout(() => setChangingLight(false), 1800);
    return () => clearTimeout(timer);
  }, [night]);
  const [capture] = useState(() => new URLSearchParams(window.location.search).has('capture'));
  useEffect(() => {
    document.title = 'abdullah / portfolio';
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const surface = scroll.current,
      wrapper = root.current;
    if (!surface || !wrapper) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const progress = Math.max(0, Math.min(1, surface.scrollTop / (surface.clientHeight * 0.72)));
      wrapper.style.setProperty('--v-color', String(1 - progress));
      const panels = Array.from(surface.querySelectorAll<HTMLElement>('.v-panel'));
      const selected = panels.reduce(
        (best, p) =>
          Math.abs(p.offsetTop - surface.scrollTop) < Math.abs(best.offsetTop - surface.scrollTop)
            ? p
            : best,
        panels[0],
      );
      const id = selected.id as Chapter;
      setActive(id);
      wrapper.dataset.chapter = id;
      window.history.replaceState(
        null,
        '',
        id === 'home' ? window.location.pathname + window.location.search : '#' + id,
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    let wheelIntent = 0,
      lastWheel = 0,
      lockedUntil = 0;
    const onWheel = (event: WheelEvent) => {
      if (wrapper.dataset.game === 'playing') {
        event.preventDefault();
        return;
      }
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const now = performance.now();
      if (now < lockedUntil) {
        event.preventDefault();
        return;
      }
      const panels = Array.from(surface.querySelectorAll<HTMLElement>('.v-panel'));
      const current = panels.reduce(
        (best, p) =>
          Math.abs(p.offsetTop - surface.scrollTop) < Math.abs(best.offsetTop - surface.scrollTop)
            ? p
            : best,
        panels[0],
      );
      const atTop = surface.scrollTop <= current.offsetTop + 3;
      const atBottom =
        surface.scrollTop + surface.clientHeight >= current.offsetTop + current.offsetHeight - 3;
      const fits = current.offsetHeight <= surface.clientHeight + 4;
      if (!fits && !(event.deltaY > 0 ? atBottom : atTop)) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = panels[panels.indexOf(current) + direction];
      if (!next) return;
      event.preventDefault();
      if (now - lastWheel > 180 || Math.sign(wheelIntent) !== direction) wheelIntent = 0;
      wheelIntent += event.deltaY;
      lastWheel = now;
      if (Math.abs(wheelIntent) < 32) return;
      wheelIntent = 0;
      lockedUntil = now + 750;
      next.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    };
    const hash = window.location.hash.slice(1);
    if (chapters.includes(hash as Chapter))
      surface.querySelector<HTMLElement>('#' + hash)?.scrollIntoView({ behavior: 'instant' });
    update();
    surface.addEventListener('scroll', onScroll, { passive: true });
    wrapper.addEventListener('wheel', onWheel, { passive: false });
    const resize = new ResizeObserver(onScroll);
    resize.observe(surface);
    return () => {
      cancelAnimationFrame(raf);
      surface.removeEventListener('scroll', onScroll);
      wrapper.removeEventListener('wheel', onWheel);
      resize.disconnect();
    };
  }, []);
  const go = (chapter: Chapter, focus = false) => {
    const panel = scroll.current?.querySelector<HTMLElement>('#' + chapter);
    panel?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    if (focus) panel?.focus({ preventScroll: true });
  };
  const returnToLanding = () => {
    window.history.replaceState(null, '', '/');
    go('home', true);
  };
  return (
    <div
      ref={root}
      className={`heritage-study h-study-18 basant-page ${capture ? 'capture' : ''}`}
      data-theme="heritage"
      data-chapter={active}
      data-night={night}
      data-light-changing={changingLight}
      data-game={gameOpen ? 'playing' : 'idle'}
    >
      <a
        className="skip-link"
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          go('home', true);
        }}
      >
        skip to content
      </a>
      <div className="v-day-sky" aria-hidden="true">
        <div className="v-stars" />
        <div className="v-sunset" />
      </div>
      <div className="v-celestial-layer" aria-hidden="true">
        <div className="v-celestial-orbit">
          <div className="v-sun" />
          <div className="v-moon" />
        </div>
      </div>
      <div className="v-decorative-scene" aria-hidden="true">
        <div className="v-city-scene">
          <LahoreSkyline />
        </div>
      </div>
      <BasantSky paused={paused} reduced={reduced} capture={capture} onActiveChange={setGameOpen} />
      <header className="v-topbar">
        <GeometricBand className="v-frieze" />
        <div className="v-toolbar">
          <a className="v-brand" href="/" aria-label="return to the landing page">
            <GeometryMark />
            <span>
              a<span className="v-brand-dot">.</span>
            </span>
          </a>
          <nav className="v-nav" aria-label="portfolio sections">
            {chapters.map((c, i) => (
              <button
                key={c}
                className="d-btn d-btn-ghost"
                aria-current={active === c ? 'page' : undefined}
                onClick={() => (c === 'home' ? returnToLanding() : go(c))}
              >
                {chapterNames[i]}
              </button>
            ))}
          </nav>
          <button
            className="d-btn d-btn-ghost v-sky-toggle"
            aria-pressed={paused || reduced}
            onClick={() => setPaused(!paused)}
            disabled={reduced}
            aria-label={reduced ? 'kite motion reduced' : paused ? 'play kites' : 'pause kites'}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
              {paused || reduced ? <path d="m6 4 9 6-9 6V4Z" /> : <path d="M7 4v12M13 4v12" />}
            </svg>
            <span>{reduced ? 'quiet sky' : paused ? 'play sky' : 'pause sky'}</span>
          </button>
          <button
            className="d-btn d-btn-ghost v-theme-toggle"
            type="button"
            aria-label={night ? 'switch to day mode' : 'switch to night mode'}
            aria-pressed={night}
            onClick={() => {
              setChangingLight(true);
              setNight(!night);
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              {night ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                </>
              ) : (
                <path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z" />
              )}
            </svg>
          </button>
        </div>
      </header>
      <main className="v-scroll" ref={scroll} aria-label="portfolio chapters" inert={gameOpen}>
        <section className="v-panel v-home-panel" id="home" tabIndex={-1} aria-labelledby="v-name">
          <div className="v-composition">
            <div className="v-intro">
              <span className="v-intro-rule" />
              <div className="v-intro-copy">
                <AlternatingName paused={paused || reduced} capture={capture} />
                <p className="v-bio">
                  computer science at waterloo. interested in intelligent systems, efficient
                  computation, and the space between them.
                </p>
                <p className="v-pull h-serif">
                  intelligent systems.
                  <br />
                  considered details.
                </p>
                <span className="h-eyebrow">waterloo / computer science</span>
              </div>
            </div>
            <ExperienceList />
          </div>
          <button className="d-btn d-btn-ghost v-scroll-cue" onClick={() => go('projects')}>
            <span>scroll to explore</span>
            <span aria-hidden="true">↓</span>
          </button>
        </section>
        <section className="v-panel" id="projects" tabIndex={-1} aria-labelledby="v-work-title">
          <div className="v-composition">
            <div className="v-lede">
              <span className="h-eyebrow">01 / selected projects</span>
              <h2 className="h-serif" id="v-work-title">
                things i’ve <br />
                put together.
              </h2>
              <p>graphics, algorithms, scientific learning, and the systems underneath.</p>
              <Flower className="v-section-flower" />
            </div>
            <ProjectCollection />
          </div>
        </section>
        <section className="v-panel" id="books" tabIndex={-1} aria-labelledby="v-books-title">
          <div className="v-composition">
            <div className="v-lede">
              <span className="h-eyebrow">02 / reading</span>
              <h2 className="h-serif" id="v-books-title">
                room for
                <br />
                another chapter.
              </h2>
              <p>books, ideas, and the notes between their pages.</p>
              <Flower className="v-section-flower" />
            </div>
            <ReadingCollection />
          </div>
        </section>
        <section
          className="v-panel"
          id="experience"
          tabIndex={-1}
          aria-labelledby="v-experience-title"
        >
          <div className="v-composition">
            <div className="v-lede">
              <span className="h-eyebrow">03 / experience</span>
              <h2 className="h-serif" id="v-experience-title">
                learning.
                <br />
                then building.
              </h2>
              <p>a few chapters in an ongoing education.</p>
              <Flower className="v-section-flower" />
            </div>
            <ExperienceList />
          </div>
        </section>
        <section className="v-panel" id="thoughts" tabIndex={-1} aria-labelledby="v-thoughts-title">
          <div className="v-composition">
            <div className="v-lede">
              <span className="h-eyebrow">04 / thoughts</span>
              <h2 className="h-serif" id="v-thoughts-title">
                a few things,
                <br />
                written down.
              </h2>
              <p>a place for small observations and longer trains of thought.</p>
              <Flower className="v-section-flower" />
            </div>
            <ReadingCollection writing />
          </div>
          <footer className="v-closing">
            <span>abdullah ehsan</span>
            <button className="d-btn d-btn-ghost" onClick={() => go('home')}>
              back to the rooftops ↑
            </button>
          </footer>
        </section>
      </main>
      <div className="v-chapter-indicator" aria-hidden="true">
        <span>0{chapters.indexOf(active) + 1}</span>
        <span className="v-indicator-line" />
        <span>05</span>
      </div>
    </div>
  );
}
