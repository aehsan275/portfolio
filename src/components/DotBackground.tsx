import { useEffect, useRef } from 'react';
import type { Theme } from '../useTheme';

const CELL = { width: 8, height: 10 };
type Region = { left: number; right: number; top: number; bottom: number };
type InkCell = { col: number; row: number; born: number; strength: number };
const COLORS = Array.from({ length: 6 }, (_, i) => `--motif-${i}`);
function randomUnit(seed: number, item: number, salt: number) {
  let value = seed ^ Math.imul(item + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}
// Distance to a closed polygon outline, in motif-local coordinates.
function outlineDistance(x: number, y: number, vertices: number[][]) {
  let distance = Infinity;
  vertices.forEach(([ax, ay], i) => {
    const [bx, by] = vertices[(i + 1) % vertices.length];
    const dx = bx - ax,
      dy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    distance = Math.min(distance, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  });
  return distance;
}
const ROSETTE = Array.from({ length: 16 }, (_, i) => {
  const angle = (i * Math.PI) / 8;
  const radius = i % 2 ? 0.68 : 1;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
});
const OCTAGON = Array.from({ length: 8 }, (_, i) => {
  const angle = ((i + 0.5) * Math.PI) / 4;
  return [Math.cos(angle), Math.sin(angle)];
});
const DIAMOND = [
  [0, -0.5],
  [0.5, 0],
  [0, 0.5],
  [-0.5, 0],
];
const SQUARE = [
  [-0.68, -0.68],
  [0.68, -0.68],
  [0.68, 0.68],
  [-0.68, 0.68],
];
const LARGE_DIAMOND = [
  [0, -0.96],
  [0.96, 0],
  [0, 0.96],
  [-0.96, 0],
];
const BLOSSOM = Array.from({ length: 48 }, (_, i) => {
  const angle = (i * Math.PI) / 24;
  const radius = 0.29 + 0.07 * Math.cos(6 * angle);
  return [Math.cos(angle) * radius, -0.4 + Math.sin(angle) * radius];
});
const CUSPED_ARCH = Array.from({ length: 49 }, (_, i) => {
  const angle = Math.PI - (i * Math.PI) / 48;
  return [0.82 * Math.cos(angle), 0.88 - 1.75 * Math.sin(angle) + 0.045 * Math.sin(12 * angle)];
});
// Original, simplified ASCII ornaments inspired by star tilework, jali, and floral panels.
const DESIGNS = [
  [ROSETTE, OCTAGON.map(([x, y]) => [x * 0.56, y * 0.56]), DIAMOND],
  [SQUARE, LARGE_DIAMOND, SQUARE.map(([x, y]) => [x * 0.5, y * 0.5]), DIAMOND],
  [
    CUSPED_ARCH,
    BLOSSOM,
    [
      [0, -0.1],
      [0, 0.83],
    ],
    [
      [0, 0.6],
      [-0.38, 0.48],
      [-0.5, 0.16],
      [-0.15, 0.3],
    ],
    [
      [0, 0.45],
      [0.38, 0.33],
      [0.5, 0.05],
      [0.15, 0.17],
    ],
  ],
];

type MotifChoice = {
  id: number;
  side: number;
  band: number;
  y: number;
  desiredRadius: number;
  fitScale: number;
  horizontal: number;
  edge: boolean;
  variant: number;
  color: string;
  accent: string;
  accentX: number;
  accentY: number;
};
function createMotifScene() {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const choices: MotifChoice[] = [];
  const firstColor = Math.floor(randomUnit(seed, 0, 1) * COLORS.length);
  // Make the complete document-space catalogue once. Page heights only reveal or hide it.
  for (let row = 0; row < 64; row++)
    for (let band = 0; band < 8; band++)
      for (let side = 0; side < 2; side++) {
        const id = row * 16 + band * 2 + side;
        const rand = (salt: number) => randomUnit(seed, id, salt);
        let colorIndex = Math.floor(rand(1) * COLORS.length);
        if (id === 1 && colorIndex === firstColor)
          colorIndex = (colorIndex + 1 + Math.floor(rand(8) * (COLORS.length - 1))) % COLORS.length;
        choices.push({
          id,
          side,
          band,
          y: row * 900 + 160 + rand(2) * 440,
          desiredRadius: 48 + rand(0) * 72,
          fitScale: 0.55 + rand(7) * 0.45,
          horizontal: rand(3),
          edge: rand(6) < 0.35,
          variant: Math.floor(rand(4) * DESIGNS.length),
          color: COLORS[colorIndex],
          accent:
            COLORS[(colorIndex + 1 + Math.floor(rand(5) * (COLORS.length - 1))) % COLORS.length],
          accentX: -0.45 + rand(9) * 0.9,
          accentY: -0.45 + rand(10) * 0.9,
        });
      }
  return { seed, choices };
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
  const scene = useRef<ReturnType<typeof createMotifScene> | null>(null);
  if (scene.current === null) scene.current = createMotifScene();
  useEffect(() => {
    const canvas = surface.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Resolve paint colors once per theme; keep the seeded palette choices and geometry intact.
    const style = getComputedStyle(canvas);
    const token = (name: string) => style.getPropertyValue(name).trim();
    const palette = Object.fromEntries(COLORS.map((name) => [name, token(name)]));
    const gridInk = token('--grid-ink');
    const trailInk = token('--color-secondary');
    const headerInk = token('--header-dot');
    const dotOpacity = Number(token('--grid-opacity'));
    const readingOpacity = Number(token('--grid-reading-opacity'));
    const mobileOpacity = Number(token('--grid-mobile-opacity'));
    const mobileReadingOpacity = Number(token('--grid-mobile-reading-opacity'));
    const motifScene = scene.current!;
    const sceneSeed = motifScene.seed;
    const query = matchMedia('(min-width: 1024px)');
    const dots = document.createElement('canvas');
    const cache = document.createElement('canvas');
    const dotContext = dots.getContext('2d')!;
    const cacheContext = cache.getContext('2d')!;
    let width = 0,
      height = 0,
      scale = 0,
      pageLeft = 0,
      pageTop = 0,
      cellWidth = CELL.width,
      cellHeight = CELL.height;
    let dotPattern: CanvasPattern | null = null;
    let dotCenterX = 0,
      dotCenterY = 0;
    let regions: Region[] = [];
    const ink = new Map<number, InkCell>();
    let lastPointer: { x: number; y: number; time: number } | null = null;
    let frame = 0,
      lastFrame = 0;
    let inkOpacity = 1,
      inkTarget = 1;
    const readingFade = (x: number, y: number) => {
      let nearest = Infinity;
      for (const r of regions)
        nearest = Math.min(
          nearest,
          Math.hypot(Math.max(r.left - x, x - r.right, 0), Math.max(r.top - y, y - r.bottom, 0)),
        );
      const t = Math.min(1, nearest / 48);
      return t * t * (3 - 2 * t);
    };
    const enabled = () => query.matches && !reduced && !document.hidden;
    const measure = () => {
      const bounds = canvas.getBoundingClientRect();
      pageLeft = bounds.left + window.scrollX;
      pageTop = bounds.top + window.scrollY;
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      const nextScale = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(width * nextScale);
      const pixelHeight = Math.round(height * nextScale);
      if (scale !== nextScale || canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        // Height-only changes (such as the footer control settling) do not alter cell keys.
        if (scale !== nextScale || canvas.width !== pixelWidth) {
          ink.clear();
          lastPointer = null;
        }
        scale = nextScale;
        // A whole-device-pixel tile gives every dot the same rasterization phase.
        cellWidth = Math.max(1, Math.round(CELL.width * scale));
        cellHeight = Math.max(1, Math.round(CELL.height * scale));
        for (const layer of [canvas, cache]) {
          layer.width = pixelWidth;
          layer.height = pixelHeight;
        }
        dots.width = cellWidth;
        dots.height = cellHeight;
        for (const context of [ctx, dotContext, cacheContext]) {
          context.font = `${Math.max(1, Math.round(10 * scale))}px ui-monospace, Consolas, monospace`;
          context.textAlign = 'center';
        }
        dotContext.fillStyle = gridInk;
        dotContext.fillText('.', Math.floor(cellWidth / 2), Math.round(cellHeight * 0.8));
        // Locate the real glyph's ink center, not its font baseline, at this pixel density.
        const stamp = dotContext.getImageData(0, 0, cellWidth, cellHeight).data;
        let mass = 0,
          xMass = 0,
          yMass = 0;
        for (let y = 0; y < cellHeight; y++)
          for (let x = 0; x < cellWidth; x++) {
            const alpha = stamp[(y * cellWidth + x) * 4 + 3];
            mass += alpha;
            xMass += (x + 0.5) * alpha;
            yMass += (y + 0.5) * alpha;
          }
        dotCenterX = mass ? xMass / mass : cellWidth / 2;
        dotCenterY = mass ? yMass / mass : cellHeight * 0.7;
        dotPattern = cacheContext.createPattern(dots, 'repeat');
        canvas.dataset.cellWidth = String(cellWidth / scale);
        canvas.dataset.cellHeight = String(cellHeight / scale);
      }
      regions = Array.from(document.querySelectorAll<HTMLElement>('[data-reading]')).map(
        (element) => {
          const r = element.getBoundingClientRect();
          return {
            left: r.left - bounds.left - 10,
            right: r.right - bounds.left + 10,
            top: r.top - bounds.top - 10,
            bottom: r.bottom - bounds.top + 10,
          };
        },
      );
      cacheContext.clearRect(0, 0, canvas.width, canvas.height);
      if (!dotPattern) return;
      cacheContext.fillStyle = dotPattern;
      cacheContext.globalAlpha = query.matches ? dotOpacity : mobileOpacity;
      cacheContext.fillRect(0, 0, canvas.width, canvas.height);
      // Feather a union of reading areas so overlapping sections never compound the fade.
      // This only softens opacity: the dot lattice itself stays crisp and fixed in place.
      cacheContext.save();
      cacheContext.globalCompositeOperation = 'destination-out';
      const fieldOpacity = query.matches ? dotOpacity : mobileOpacity;
      const textOpacity = query.matches ? readingOpacity : mobileReadingOpacity;
      cacheContext.globalAlpha = fieldOpacity > 0 ? 1 - textOpacity / fieldOpacity : 0;
      cacheContext.fillStyle = '#000';
      cacheContext.filter = `blur(${24 * scale}px)`;
      cacheContext.beginPath();
      for (const r of regions)
        cacheContext.rect(
          r.left * scale,
          r.top * scale,
          (r.right - r.left) * scale,
          (r.bottom - r.top) * scale,
        );
      cacheContext.fill();
      cacheContext.restore();
      cacheContext.globalAlpha = 1;
      let motifCells = 0;
      const motifs: {
        id: number;
        x: number;
        y: number;
        radius: number;
        edge: 'left' | 'right' | null;
        variant: number;
        color: string;
        accent: string;
        accentX: number;
        accentY: number;
      }[] = [];
      if (query.matches) {
        const shell = document.querySelector('.site-shell')!.getBoundingClientRect();
        const contentLeft = shell.left - bounds.left;
        const contentRight = shell.right - bounds.left;
        for (const choice of motifScene.choices) {
          const { side, band } = choice;
          const margin = side === 0 ? contentLeft : width - contentRight;
          const bandStart = band * 240;
          const bandWidth = Math.min(240, margin - bandStart);
          if (bandWidth < 64) continue;
          const atEdge = band === 0 && (margin < 96 || choice.edge);
          const availableRadius = atEdge ? margin - 20 : (bandWidth - 32) / 2;
          const radius = Math.min(choice.desiredRadius, availableRadius) * choice.fitScale;
          if (radius < 16 || choice.y + radius > height - 24) continue;
          const distanceFromText =
            bandStart + radius + 20 + choice.horizontal * Math.max(0, bandWidth - radius * 2 - 32);
          const x = atEdge
            ? side === 0
              ? 0
              : width
            : side === 0
              ? contentLeft - distanceFromText
              : contentRight + distanceFromText;
          const y = choice.y;
          if (motifs.some((m) => Math.hypot(m.x - x, m.y - y) < m.radius + radius + 24)) continue;
          motifs.push({
            id: choice.id,
            x,
            y,
            radius,
            edge: atEdge ? (side === 0 ? 'left' : 'right') : null,
            variant: choice.variant,
            color: choice.color,
            accent: choice.accent,
            accentX: choice.accentX,
            accentY: choice.accentY,
          });
        }
        // Draw only each ornament's fixed-size tile bounds, rather than scanning the whole page.
        for (const motif of motifs) {
          const minCol = Math.max(0, Math.floor(((motif.x - motif.radius) * scale) / cellWidth));
          const maxCol = Math.min(
            Math.ceil(canvas.width / cellWidth),
            Math.ceil(((motif.x + motif.radius) * scale) / cellWidth),
          );
          const minRow = Math.max(0, Math.floor(((motif.y - motif.radius) * scale) / cellHeight));
          const maxRow = Math.min(
            Math.ceil(canvas.height / cellHeight),
            Math.ceil(((motif.y + motif.radius) * scale) / cellHeight),
          );
          for (let row = minRow; row < maxRow; row++)
            for (let col = minCol; col < maxCol; col++) {
              const left = col * cellWidth,
                top = row * cellHeight;
              const x = (left + Math.floor(cellWidth / 2)) / scale;
              const y = (top + Math.round(cellHeight * 0.8)) / scale;
              const mx = (x - motif.x) / motif.radius,
                my = (y - motif.y) / motif.radius;
              const distance = Math.min(
                ...DESIGNS[motif.variant].map((path) => outlineDistance(mx, my, path)),
              );
              const accent = Math.exp(
                -((mx - motif.accentX) ** 2 + (my - motif.accentY) ** 2) / 0.15,
              );
              const splash = distance > 0.055;
              if (splash && (accent < 0.5 || (col + row * 3) % 4 !== 0)) continue;
              cacheContext.clearRect(left, top, cellWidth, cellHeight);
              cacheContext.fillStyle = palette[accent > 0.4 ? motif.accent : motif.color];
              cacheContext.globalAlpha = splash ? 0.13 * accent : 0.38 + 0.17 * accent;
              cacheContext.fillText(
                splash ? ':' : distance < 0.025 ? '+' : distance < 0.04 ? '*' : ':',
                left + Math.floor(cellWidth / 2),
                top + Math.round(cellHeight * 0.8),
              );
              motifCells++;
            }
        }
      }
      const railElement = document.querySelector<SVGSVGElement>('.banner-inner');
      const rail = railElement?.getBoundingClientRect();
      if (rail) {
        const left = (rail.left - bounds.left) * scale;
        const right = (rail.right - bounds.left) * scale;
        const row = Math.round(((rail.top - bounds.top + 26) * scale - dotCenterY) / cellHeight);
        const y = row * cellHeight + dotCenterY;
        const firstCol = Math.ceil((left - dotCenterX) / cellWidth);
        const count = Math.max(0, Math.floor((right - dotCenterX) / cellWidth) - firstCol + 1);
        const dotRowCenter =
          (firstCol * cellWidth + dotCenterX + ((count - 1) * cellWidth) / 2) / scale;
        railElement!.style.setProperty(
          '--banner-shift-x',
          dotRowCenter - (rail.left - bounds.left + rail.width / 2) + 'px',
        );
        railElement!.style.setProperty(
          '--banner-shift-y',
          y / scale - (rail.top - bounds.top + 26) + 'px',
        );
        cacheContext.fillStyle = headerInk;
        cacheContext.globalAlpha = 0.95;
        for (let col = firstCol; col < firstCol + count; col++) {
          cacheContext.beginPath();
          cacheContext.arc(
            col * cellWidth + dotCenterX,
            y,
            Math.max(1, 1.1 * scale),
            0,
            Math.PI * 2,
          );
          cacheContext.fill();
        }
        canvas.dataset.headerDots = JSON.stringify({
          x: firstCol * cellWidth + dotCenterX,
          y,
          count,
          cellWidth,
          cellHeight,
          dotCenterX,
          dotCenterY,
        });
      }
      canvas.dataset.motifs = String(motifs.length);
      canvas.dataset.motifVariants = query.matches ? String(DESIGNS.length) : '0';
      canvas.dataset.motifLayout = JSON.stringify(
        motifs.map(({ id, x, y, radius, edge, color, accent, variant }) => ({
          id,
          x,
          y,
          radius,
          edge,
          color,
          accent,
          variant,
        })),
      );
      canvas.dataset.motifSizes = JSON.stringify(motifs.map((m) => Math.round(m.radius * 2)));
      canvas.dataset.motifSeed = String(sceneSeed);
      canvas.dataset.motifCells = String(motifCells);
      cacheContext.globalAlpha = 1;
    };
    const paint = () => {
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cache, 0, 0);
      const now = performance.now();
      for (const [key, cell] of ink) {
        const age = Math.max(0, (now - cell.born) / 900);
        if (age >= 1) {
          ink.delete(key);
          continue;
        }
        const x = cell.col * cellWidth,
          y = cell.row * cellHeight;
        ctx.fillStyle = trailInk;
        ctx.globalAlpha =
          0.62 * readingFade(x / scale, y / scale) * inkOpacity * cell.strength * (1 - age) ** 2;
        ctx.fillText(
          [':', '+', '*'][(cell.col + cell.row) % 3],
          x + Math.floor(cellWidth / 2),
          y + Math.round(cellHeight * 0.8),
        );
      }
      ctx.globalAlpha = 1;
      canvas.dataset.inkCells = String(ink.size);
    };
    const tick = (time: number) => {
      frame = 0;
      if (!enabled()) {
        canvas.dataset.running = 'false';
        return;
      }
      if (time - lastFrame < 1000 / 30 - 0.1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Math.min(100, Math.max(0, time - lastFrame));
      inkOpacity += (inkTarget - inkOpacity) * (1 - Math.exp(-elapsed / 100));
      canvas.dataset.inkOpacity = inkOpacity.toFixed(3);
      lastFrame = time;
      paint();
      if (ink.size) frame = requestAnimationFrame(tick);
      else canvas.dataset.running = 'false';
    };
    const move = (event: PointerEvent) => {
      if (!enabled() || event.pointerType === 'touch') return;
      const now = performance.now();
      const pointerX = event.clientX + window.scrollX - pageLeft;
      const pointerY = event.clientY + window.scrollY - pageTop;
      const distance = lastPointer
        ? Math.hypot(pointerX - lastPointer.x, pointerY - lastPointer.y)
        : 0;
      if (lastPointer && distance < 3) return;
      inkTarget = readingFade(pointerX, pointerY);
      const previous =
        lastPointer && now - lastPointer.time < 120 ? lastPointer : { x: pointerX, y: pointerY };
      const segmentLength = Math.hypot(pointerX - previous.x, pointerY - previous.y);
      const steps = Math.min(96, Math.max(1, Math.ceil(segmentLength / 6)));
      const cols = Math.ceil(canvas.width / cellWidth),
        rows = Math.ceil(canvas.height / cellHeight);
      for (let step = 0; step <= steps; step++) {
        const x = previous.x + ((pointerX - previous.x) * step) / steps;
        const y = previous.y + ((pointerY - previous.y) * step) / steps;
        const centerCol = Math.floor((x * scale) / cellWidth),
          centerRow = Math.floor((y * scale) / cellHeight);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            if (Math.abs(dx) + Math.abs(dy) > 1) continue;
            const col = centerCol + dx,
              row = centerRow + dy;
            if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
            ink.set(row * cols + col, { col, row, born: now, strength: dx || dy ? 0.5 : 1 });
          }
      }
      while (ink.size > 512) ink.delete(ink.keys().next().value!);
      lastPointer = { x: pointerX, y: pointerY, time: now };
      if (!frame) {
        lastFrame = now;
        canvas.dataset.running = 'true';
        frame = requestAnimationFrame(tick);
      }
    };
    const leave = () => {
      lastPointer = null;
      inkTarget = 1;
    };
    const layout = () => {
      measure();
      paint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ink.clear();
      lastPointer = null;
      canvas.dataset.running = 'false';
      inkOpacity = inkTarget = 1;
      canvas.dataset.inkOpacity = '1.000';
      document.documentElement.dataset.pageHidden = String(document.hidden);
      layout();
    };
    const resize = new ResizeObserver(layout);
    resize.observe(canvas);
    document
      .querySelectorAll<HTMLElement>('[data-reading]')
      .forEach((element) => resize.observe(element));
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync);
    query.addEventListener('change', sync);
    let densityQuery: MediaQueryList | null = null;
    const watchDensity = () => {
      densityQuery?.removeEventListener('change', densityChanged);
      densityQuery = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      densityQuery.addEventListener('change', densityChanged);
    };
    const densityChanged = () => {
      layout();
      watchDensity();
    };
    watchDensity();
    window.addEventListener('resize', layout, { passive: true });
    window.visualViewport?.addEventListener('resize', layout, { passive: true });
    sync();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      densityQuery?.removeEventListener('change', densityChanged);
      window.removeEventListener('resize', layout);
      window.visualViewport?.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', sync);
      query.removeEventListener('change', sync);
      delete document.documentElement.dataset.pageHidden;
    };
  }, [reduced, pageKey, theme]);
  return (
    <canvas
      ref={surface}
      className="ascii-sky"
      data-cell-width="8"
      data-cell-height="10"
      aria-hidden="true"
    />
  );
}
