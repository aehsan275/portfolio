import { useEffect, useRef } from 'react';
import type { Theme } from '../useTheme';

const CELL = { width: 8, height: 10 };
const HOVER_RADIUS = 96;
const TRAIL_RADIUS = 56;
const TRAIL_TIME = 280;
const TRAIL_LENGTH = 170;
const READING_FADE = 64;
type Point = { x: number; y: number };
type TrailPoint = Point & { time: number };
type Bounds = { left: number; right: number; top: number; bottom: number };

function smoothstep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function DotBackground({
  reduced,
  pageKey,
  theme,
}: {
  reduced: boolean;
  pageKey: string;
  theme: Theme;
}) {
  const surface = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = surface.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const gridInk = token('--grid-ink');
    const bannerInk = token('--ornament-gold');
    const font = token('--font-mono');
    const fontRequest = `10px ${font}`;
    const desktop = matchMedia('(min-width: 1024px)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    let cache: HTMLCanvasElement | null = null;
    const tile = document.createElement('canvas');
    const tileContext = tile.getContext('2d')!;
    let fontReady = document.fonts.check(fontRequest);
    let active = true;
    let scale = 0;
    let cellWidth = CELL.width;
    let cellHeight = CELL.height;
    let dotX = 0;
    let dotY = 0;
    let dotRadius = 0;
    let pageX = 0;
    let pageY = 0;
    let fieldOpacity = 0;
    let textOpacity = 0;
    let pattern: CanvasPattern | null = null;
    let bannerDots: { row: number; first: number; last: number } | null = null;
    let regions: Bounds[] = [];
    let pointer: Point | null = null;
    let trail: TrailPoint[] = [];
    let painted: Bounds | null = null;
    let frame = 0;
    let layoutFrame = 0;

    const canHover = () => desktop.matches && mouse.matches && !reduced;

    const readingFade = (x: number, y: number) => {
      let nearest = Infinity;
      for (const region of regions) {
        const dx = Math.max(region.left - x, x - region.right, 0);
        const dy = Math.max(region.top - y, y - region.bottom, 0);
        nearest = Math.min(nearest, Math.hypot(dx, dy));
      }
      return smoothstep(nearest / READING_FADE);
    };

    const updateTile = () => {
      cellWidth = Math.max(1, Math.round(CELL.width * scale));
      cellHeight = Math.max(1, Math.round(CELL.height * scale));
      tile.width = cellWidth;
      tile.height = cellHeight;
      tileContext.font = `${Math.max(1, Math.round(10 * scale))}px ${font}`;
      tileContext.textAlign = 'center';
      tileContext.fillStyle = gridInk;
      tileContext.fillText('.', Math.floor(cellWidth / 2), Math.round(cellHeight * 0.8));
      const pixels = tileContext.getImageData(0, 0, cellWidth, cellHeight).data;
      let mass = 0;
      let xMass = 0;
      let yMass = 0;
      for (let y = 0; y < cellHeight; y++) {
        for (let x = 0; x < cellWidth; x++) {
          const alpha = pixels[(y * cellWidth + x) * 4 + 3];
          mass += alpha;
          xMass += (x + 0.5) * alpha;
          yMass += (y + 0.5) * alpha;
        }
      }
      dotX = mass ? xMass / mass : cellWidth / 2;
      dotY = mass ? yMass / mass : cellHeight * 0.7;
      dotRadius = mass ? Math.sqrt(mass / (255 * Math.PI)) : 0.7 * scale;
      pattern = ctx.createPattern(tile, 'repeat');
      canvas.dataset.cellWidth = String(cellWidth / scale);
      canvas.dataset.cellHeight = String(cellHeight / scale);
    };

    const restore = () => {
      if (!painted || !cache) return;
      const { left, right, top, bottom } = painted;
      const width = right - left;
      const height = bottom - top;
      ctx.clearRect(left, top, width, height);
      ctx.drawImage(cache, left, top, width, height, left, top, width, height);
      painted = null;
    };

    const drawHover = (now = performance.now()) => {
      frame = 0;
      canvas.dataset.running = 'false';
      restore();
      canvas.dataset.hoverCells = '0';
      if (!pointer || !canHover() || document.hidden || !pattern) return;

      trail = trail.filter((point) => now - point.time < TRAIL_TIME);
      const toCanvas = (point: Point, radius: number, strength: number) => ({
        x: (point.x + scrollX - pageX) * scale,
        y: (point.y + scrollY - pageY) * scale,
        radius: radius * scale,
        strength,
      });
      const sources = trail.map((point) =>
        toCanvas(point, TRAIL_RADIUS, 0.68 * smoothstep(1 - (now - point.time) / TRAIL_TIME)),
      );
      sources.push(toCanvas(pointer, HOVER_RADIUS, 1));
      const firstCol = Math.max(
        0,
        Math.floor(Math.min(...sources.map((source) => source.x - source.radius)) / cellWidth),
      );
      const firstRow = Math.max(
        0,
        Math.floor(Math.min(...sources.map((source) => source.y - source.radius)) / cellHeight),
      );
      const lastCol = Math.min(
        Math.ceil(canvas.width / cellWidth),
        Math.ceil(Math.max(...sources.map((source) => source.x + source.radius)) / cellWidth),
      );
      const lastRow = Math.min(
        Math.ceil(canvas.height / cellHeight),
        Math.ceil(Math.max(...sources.map((source) => source.y + source.radius)) / cellHeight),
      );
      let count = 0;

      ctx.fillStyle = gridInk;
      for (let row = firstRow; row < lastRow; row++) {
        for (let col = firstCol; col < lastCol; col++) {
          if (bannerDots?.row === row && col >= bannerDots.first && col <= bannerDots.last)
            continue;
          const left = col * cellWidth;
          const top = row * cellHeight;
          const centerX = left + dotX;
          const centerY = top + dotY;
          const reading = readingFade(centerX / scale, centerY / scale);
          let strongest = 0;
          for (const source of sources) {
            const distance = Math.hypot(centerX - source.x, centerY - source.y);
            strongest = Math.max(
              strongest,
              source.strength * smoothstep(1 - distance / source.radius),
            );
          }
          const strength = strongest * reading;
          if (strength < 0.015) continue;

          const opacity = textOpacity + (fieldOpacity - textOpacity) * reading;
          ctx.globalAlpha = opacity * strength * 0.78;
          ctx.beginPath();
          ctx.arc(centerX, centerY, dotRadius + 2 * scale * strength, 0, Math.PI * 2);
          ctx.fill();
          count++;
        }
      }
      ctx.globalAlpha = 1;

      if (count) {
        painted = {
          left: firstCol * cellWidth,
          right: Math.min(canvas.width, lastCol * cellWidth),
          top: firstRow * cellHeight,
          bottom: Math.min(canvas.height, lastRow * cellHeight),
        };
      }
      canvas.dataset.hoverCells = String(count);
      if (trail.length) schedule();
    };

    const schedule = () => {
      if (frame) return;
      canvas.dataset.running = 'true';
      frame = requestAnimationFrame(drawHover);
    };

    const drawBanner = (bounds: DOMRect, paint: CanvasRenderingContext2D) => {
      const banner = document.querySelector<SVGSVGElement>('.banner-inner');
      if (!banner) return;
      const rail = banner.getBoundingClientRect();
      const left = (rail.left - bounds.left) * scale;
      const right = (rail.right - bounds.left) * scale;
      const first = Math.ceil((left - dotX) / cellWidth);
      const last = Math.floor((right - dotX) / cellWidth);
      const row = Math.round(((rail.top - bounds.top + 26) * scale - dotY) / cellHeight);
      bannerDots = { row, first, last };
      const y = row * cellHeight + dotY;
      const center = (((first + last) / 2) * cellWidth + dotX) / scale;
      banner.style.setProperty(
        '--banner-shift-x',
        `${center - (rail.left - bounds.left + rail.width / 2)}px`,
      );
      banner.style.setProperty('--banner-shift-y', `${y / scale - (rail.top - bounds.top + 26)}px`);

      paint.save();
      paint.fillStyle = bannerInk;
      paint.globalAlpha = 0.95;
      for (let col = first; col <= last; col++) {
        paint.beginPath();
        paint.arc(col * cellWidth + dotX, y, Math.max(1, 1.1 * scale), 0, Math.PI * 2);
        paint.fill();
      }
      paint.restore();
    };

    const layout = () => {
      if (!fontReady) return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      pageX = bounds.left + scrollX;
      pageY = bounds.top + scrollY;
      const nextScale = window.devicePixelRatio || 1;
      const width = Math.round(bounds.width * nextScale);
      const height = Math.round(bounds.height * nextScale);
      if (canHover()) cache ??= document.createElement('canvas');
      else {
        cache = null;
        pointer = null;
        trail = [];
      }
      const paint = cache?.getContext('2d') ?? ctx;
      for (const layer of cache ? [canvas, cache] : [canvas]) {
        if (width !== layer.width || height !== layer.height) {
          layer.width = width;
          layer.height = height;
        }
      }
      if (scale !== nextScale || !pattern) {
        scale = nextScale;
        updateTile();
      }
      if (!pattern) return;

      fieldOpacity = Number(token(desktop.matches ? '--grid-opacity' : '--grid-mobile-opacity'));
      textOpacity = Number(
        token(desktop.matches ? '--grid-reading-opacity' : '--grid-mobile-reading-opacity'),
      );
      regions = Array.from(document.querySelectorAll<HTMLElement>('[data-reading]'), (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - bounds.left - 14,
          right: rect.right - bounds.left + 14,
          top: rect.top - bounds.top - 14,
          bottom: rect.bottom - bounds.top + 14,
        };
      });
      paint.globalAlpha = 1;
      paint.clearRect(0, 0, width, height);
      paint.fillStyle = pattern;
      paint.globalAlpha = fieldOpacity;
      paint.fillRect(0, 0, width, height);

      // Blur one union of the reading regions so overlapping text areas don't stack the fade.
      paint.save();
      paint.globalCompositeOperation = 'destination-out';
      paint.globalAlpha = fieldOpacity ? 1 - textOpacity / fieldOpacity : 0;
      paint.fillStyle = '#000';
      paint.filter = `blur(${36 * scale}px)`;
      paint.beginPath();
      for (const region of regions) {
        paint.rect(
          region.left * scale,
          region.top * scale,
          (region.right - region.left) * scale,
          (region.bottom - region.top) * scale,
        );
      }
      paint.fill();
      paint.restore();
      drawBanner(bounds, paint);
      paint.globalAlpha = 1;

      cancelAnimationFrame(frame);
      painted = null;
      if (cache) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(cache, 0, 0);
      }
      canvas.dataset.renderedTheme = theme;
      drawHover();
    };

    const scheduleLayout = () => {
      if (layoutFrame) return;
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        layout();
      });
    };

    const move = (event: PointerEvent) => {
      if (!canHover() || document.hidden || event.pointerType !== 'mouse') return;
      const next = { x: event.clientX, y: event.clientY };
      if (pointer) {
        const distance = Math.hypot(next.x - pointer.x, next.y - pointer.y);
        if (distance >= TRAIL_LENGTH) trail = [];
        else if (distance >= 2) {
          const time = performance.now();
          trail.push({ ...pointer, time });
          trail = trail
            .filter((point) => Math.hypot(next.x - point.x, next.y - point.y) < TRAIL_LENGTH)
            .slice(-8);
        }
      }
      pointer = next;
      schedule();
    };
    const clear = () => {
      pointer = null;
      trail = [];
      cancelAnimationFrame(frame);
      drawHover();
    };
    const scroll = () => {
      if (pointer) {
        trail = [];
        schedule();
      }
    };
    const visibility = () => {
      document.documentElement.dataset.pageHidden = String(document.hidden);
      clear();
    };
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(canvas);
    document.querySelectorAll('[data-reading]').forEach((element) => observer.observe(element));

    const listeners = new AbortController();
    const { signal } = listeners;
    window.addEventListener('pointermove', move, { passive: true, signal });
    window.addEventListener('scroll', scroll, { passive: true, signal });
    window.addEventListener('blur', clear, { signal });
    document.documentElement.addEventListener('pointerleave', clear, { signal });
    document.addEventListener('visibilitychange', visibility, { signal });
    desktop.addEventListener('change', scheduleLayout, { signal });
    mouse.addEventListener('change', scheduleLayout, { signal });
    window.addEventListener('resize', scheduleLayout, { signal });
    window.visualViewport?.addEventListener('resize', scheduleLayout, { signal });

    let densityQuery: MediaQueryList;
    const densityChanged = () => {
      scheduleLayout();
      watchDensity();
    };
    const watchDensity = () => {
      densityQuery?.removeEventListener('change', densityChanged);
      densityQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      densityQuery.addEventListener('change', densityChanged);
    };
    watchDensity();
    visibility();
    layout();
    if (!fontReady) {
      const refreshFont = () => {
        if (!active) return;
        fontReady = true;
        layout();
      };
      document.fonts.load(fontRequest).then(refreshFont, refreshFont);
    }

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(layoutFrame);
      observer.disconnect();
      listeners.abort();
      densityQuery.removeEventListener('change', densityChanged);
      delete document.documentElement.dataset.pageHidden;
    };
  }, [reduced, pageKey, theme]);

  return <canvas ref={surface} className="ascii-sky" aria-hidden="true" />;
}
