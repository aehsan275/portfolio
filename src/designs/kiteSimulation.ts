export type Point = { x: number; y: number };
export type Bounds = { left: number; right: number; top: number; bottom: number };
export type Flight = Point & {
  id: number;
  vx: number;
  vy: number;
  angle: number;
  aim: Point;
  origin: Point;
  turnAt: number;
  speed: number;
  aggression: number;
  maneuver: 'glide' | 'loop' | 'swoop' | 'falling';
  maneuverTime: number;
  direction: number;
  cut: boolean;
  cutBy: number | 'player' | 'wind' | null;
  tension: number;
  strength: number;
  exposure: number;
  attackAt: number;
  attackUntil: number;
  spawnAge: number;
  opacity: number;
};
type RandomState = { random: number };
export type Sky = RandomState & {
  kites: Flight[];
  time: number;
  nextEvent: number;
  eventIndex: number;
  bounds: Bounds;
};
export type Round = RandomState & {
  player: Point;
  bots: Flight[];
  bounds: Bounds;
  tension: number;
  strength: number;
  exposure: number;
  score: number;
  time: number;
  pulling: boolean;
  contact: boolean;
  danger: boolean;
  nextEvent: number;
};
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const anchor = { x: 500, y: 760 };
export const botAnchor = (index: number, count: number) =>
  70 + (index * 860) / Math.max(1, count - 1);
export function random(state: RandomState, min = 0, max = 1) {
  state.random = (Math.imul(state.random, 1664525) + 1013904223) >>> 0;
  return min + (state.random / 4294967296) * (max - min);
}
export function skyBounds(width: number, height: number): Bounds {
  return {
    left: (34 / width) * 1000,
    right: 1000 - (34 / width) * 1000,
    top: (((width < 768 ? 144 : 106) + 35) / height) * 650,
    bottom: Math.max(300, Math.min(440, ((height - 190) / height) * 650)),
  };
}
function destination(state: RandomState, bounds: Bounds): Point {
  return {
    x: random(state, bounds.left, bounds.right),
    y: random(state, bounds.top, bounds.bottom),
  };
}
function flight(id: number, p: Point, state: RandomState, bounds: Bounds): Flight {
  return {
    ...p,
    id,
    vx: 0,
    vy: 0,
    angle: 0,
    aim: destination(state, bounds),
    origin: { ...p },
    turnAt: random(state, 3, 8),
    speed: random(state, 20, 42),
    aggression: random(state, 0.35, 0.95),
    maneuver: 'glide',
    maneuverTime: 0,
    direction: random(state) < 0.5 ? -1 : 1,
    cut: false,
    cutBy: null,
    tension: random(state, 12, 35),
    strength: 100,
    exposure: 0,
    attackAt: random(state, 2, 5),
    attackUntil: 0,
    spawnAge: 2,
    opacity: 1,
  };
}
export function createSky(count: number, seed: number, width = 1440, height = 900): Sky {
  const sky: Sky = {
    kites: [],
    time: 0,
    nextEvent: 7,
    eventIndex: 0,
    random: seed >>> 0,
    bounds: skyBounds(width, height),
  };
  // Best-candidate sampling keeps a random sky evenly spaced in physical pixels.
  for (let id = 0; id < count; id++) {
    let point = destination(sky, sky.bounds),
      best = -1;
    for (let attempt = 0; attempt < 35; attempt++) {
      const candidate = destination(sky, sky.bounds);
      const distance = Math.min(
        ...sky.kites.map((k) =>
          Math.hypot(((candidate.x - k.x) * width) / 1000, ((candidate.y - k.y) * height) / 650),
        ),
      );
      if (distance > best) {
        best = distance;
        point = candidate;
      }
    }
    sky.kites.push(flight(id, point, sky, sky.bounds));
  }
  sky.nextEvent = random(sky, 4, 7);
  return sky;
}
export function createRound(
  kites: Flight[],
  selected: number,
  bounds: Bounds,
  seed: number,
): Round {
  const player = kites.find((k) => k.id === selected)!;
  const round: Round = {
    player: { x: player.x, y: player.y },
    bots: [],
    bounds: { ...bounds },
    random: seed >>> 0,
    tension: 22,
    strength: 100,
    exposure: 0,
    score: 0,
    time: 0,
    pulling: false,
    contact: false,
    danger: false,
    nextEvent: 7,
  };
  round.bots = kites
    .filter((k) => k.id !== selected)
    .map((k) => (k.cut ? structuredClone(k) : flight(k.id, k, round, bounds)));
  return round;
}
export function crosses(a: Point, b: Point, c: Point, d: Point) {
  const turn = (p: Point, q: Point, r: Point) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0;
}
export function beginManeuver(kite: Flight, kind: Flight['maneuver']) {
  kite.maneuver = kind;
  kite.maneuverTime = 0;
  kite.origin = { x: kite.x, y: kite.y };
}
function eliminate(kite: Flight, by: Flight['cutBy']) {
  if (kite.cut) return;
  kite.cut = true;
  kite.cutBy = by;
  kite.strength = 0;
  beginManeuver(kite, 'falling');
}
function fly(
  kite: Flight,
  state: RandomState,
  bounds: Bounds,
  time: number,
  dt: number,
  reduced: boolean,
) {
  kite.maneuverTime += dt;
  if (kite.cut) {
    if (reduced) {
      kite.y = 800;
      kite.opacity = 0;
      return;
    }
    kite.vy += dt * 45;
    kite.y += Math.max(45, kite.vy) * dt;
    kite.x += kite.direction * dt * 28;
    kite.angle += kite.direction * dt * 40;
    kite.opacity = clamp(1 - (kite.y - bounds.bottom - 80) / 220, 0, 1);
    return;
  }
  kite.spawnAge += dt;
  kite.opacity = clamp(kite.spawnAge / 1.6, 0, 1);
  if (!reduced && (kite.maneuver === 'loop' || kite.maneuver === 'swoop')) {
    const progress = Math.min(1, kite.maneuverTime / (kite.maneuver === 'loop' ? 4.8 : 4.2));
    const theta = progress * Math.PI * 2;
    kite.x = clamp(
      kite.origin.x + Math.sin(theta) * 50 * kite.direction,
      bounds.left,
      bounds.right,
    );
    kite.y = clamp(
      kite.origin.y +
        (kite.maneuver === 'loop'
          ? (1 - Math.cos(theta)) * -28
          : Math.sin(progress * Math.PI) * 80),
      bounds.top,
      bounds.bottom,
    );
    kite.angle = kite.maneuver === 'loop' ? progress * 360 * kite.direction : Math.sin(theta) * 38;
    if (progress === 1) {
      kite.maneuver = 'glide';
      kite.angle = 0;
    }
    return;
  }
  if (time >= kite.turnAt) {
    kite.aim = destination(state, bounds);
    kite.turnAt = time + random(state, 5, 10);
  }
  const speed = reduced ? 0.45 : 1;
  kite.vx += ((kite.aim.x - kite.x) * 0.7 - kite.vx * 1.4) * dt;
  kite.vy += ((kite.aim.y - kite.y) * 0.8 - kite.vy * 1.6) * dt;
  kite.vx = clamp(kite.vx, -kite.speed, kite.speed);
  kite.vy = clamp(kite.vy, -kite.speed * 0.65, kite.speed * 0.65);
  kite.x = clamp(kite.x + kite.vx * dt * speed, bounds.left, bounds.right);
  kite.y = clamp(kite.y + kite.vy * dt * speed, bounds.top, bounds.bottom);
  kite.angle += (clamp(kite.vx * 0.22, -25, 25) - kite.angle) * Math.min(1, dt * 3);
}
export function stepSky(sky: Sky, dt: number) {
  sky.time += dt;
  for (const kite of sky.kites) {
    fly(kite, sky, sky.bounds, sky.time, dt, false);
    if (kite.cut && kite.y > 760) {
      const p = destination(sky, sky.bounds);
      p.x = random(sky) < 0.5 ? sky.bounds.left : sky.bounds.right;
      Object.assign(kite, flight(kite.id, p, sky, sky.bounds));
      kite.spawnAge = 0;
      kite.opacity = 0;
    }
  }
  if (sky.time >= sky.nextEvent) {
    const available = sky.kites.filter((k) => !k.cut && k.maneuver === 'glide');
    const kite = available[Math.floor(random(sky, 0, available.length))];
    if (kite) {
      const event = sky.eventIndex++ % 3;
      if (event !== 1) beginManeuver(kite, event === 0 ? 'loop' : 'swoop');
      else {
        const rival = available.find((k) => k.id !== kite.id);
        eliminate(kite, rival?.id ?? 'wind');
      }
    }
    sky.nextEvent = sky.time + random(sky, 8, 14);
  }
}
export function outcome(round: Round): 'playing' | 'won' | 'lost' {
  if (round.strength <= 0) return 'lost';
  return round.bots.every((k) => k.cut) ? 'won' : 'playing';
}
export function stepRound(
  round: Round,
  dt: number,
  target: Point,
  pulling: boolean,
  reduced = false,
) {
  if (outcome(round) !== 'playing') return;
  round.time += dt;
  round.player.x +=
    (clamp(target.x, round.bounds.left, round.bounds.right) - round.player.x) * Math.min(1, dt * 9);
  round.player.y +=
    (clamp(target.y, round.bounds.top, round.bounds.bottom) - round.player.y) * Math.min(1, dt * 9);
  round.pulling = pulling;
  round.tension = clamp(round.tension + dt * (pulling ? 38 : -53), 0, 100);
  round.contact = false;
  round.danger = false;
  const incoming = new Map<number | 'player', { damage: number; by: number | 'player' }>();
  const hit = (victim: number | 'player', damage: number, by: number | 'player') => {
    if (damage > (incoming.get(victim)?.damage ?? 0)) incoming.set(victim, { damage, by });
  };
  const power = (tension: number, held: boolean) =>
    held && tension >= 25 && tension <= 78 ? 1 : 0;
  for (const bot of round.bots) {
    const turning = round.time >= bot.turnAt;
    fly(bot, round, round.bounds, round.time, dt, reduced);
    if (bot.cut) continue;
    if (turning && random(round) < bot.aggression * 0.55) {
      const rivals = round.bots.filter((k) => !k.cut && k.id !== bot.id);
      const rival =
        random(round) < 0.35
          ? round.player
          : (rivals[Math.floor(random(round, 0, rivals.length))] ?? round.player);
      bot.aim = {
        x: clamp(rival.x + random(round, -130, 130), round.bounds.left, round.bounds.right),
        y: clamp(rival.y + random(round, -80, 80), round.bounds.top, round.bounds.bottom),
      };
    }
    if (round.time >= bot.attackAt) {
      bot.attackUntil = round.time + random(round, 1.3, 2.1);
      bot.attackAt = bot.attackUntil + random(round, 0.8, 2.4);
    }
    if (bot.tension >= 76 && round.time < bot.attackUntil) {
      bot.attackUntil = round.time;
      bot.attackAt = round.time + random(round, 0.8, 1.6);
    }
    const attacking = round.time < bot.attackUntil && bot.tension < 80;
    bot.tension = clamp(bot.tension + dt * (attacking ? 38 : -53), 0, 100);
  }
  const fighters = round.bots
    .map((bot, index) => ({ bot, anchor: { x: botAnchor(index, round.bots.length), y: 760 } }))
    .filter((f) => !f.bot.cut);
  for (let i = 0; i < fighters.length; i++) {
    const { bot, anchor: base } = fighters[i];
    const botPower = power(bot.tension, round.time < bot.attackUntil);
    if (crosses(anchor, round.player, base, bot)) {
      round.contact = true;
      const playerPower = power(round.tension, pulling);
      if (playerPower) hit(bot.id, 65, 'player');
      if (botPower) hit('player', pulling ? 48 : 30, bot.id);
    }
    for (let j = i + 1; j < fighters.length; j++) {
      const other = fighters[j];
      if (!crosses(base, bot, other.anchor, other.bot)) continue;
      if (botPower) hit(other.bot.id, 55 + bot.aggression * 15, bot.id);
      if (power(other.bot.tension, round.time < other.bot.attackUntil))
        hit(bot.id, 55 + other.bot.aggression * 15, other.bot.id);
    }
  }
  const threat = incoming.get('player');
  round.exposure = threat ? round.exposure + dt : Math.max(0, round.exposure - dt * 2);
  round.danger = !!threat || round.exposure > 0.15;
  if (threat && round.exposure > 0.65)
    round.strength = Math.max(0, round.strength - dt * threat.damage);
  if (round.tension > 90) round.strength = Math.max(0, round.strength - dt * 13);
  if (!pulling && round.tension < 40 && !threat)
    round.strength = Math.min(100, round.strength + dt * 2);
  for (const bot of round.bots) {
    if (bot.cut) continue;
    const attack = incoming.get(bot.id);
    bot.exposure = attack ? bot.exposure + dt : Math.max(0, bot.exposure - dt * 0.25);
    if (attack && bot.exposure > 0.45)
      bot.strength = Math.max(0, bot.strength - dt * attack.damage);
    if (bot.strength <= 0) {
      eliminate(bot, attack?.by ?? 'wind');
      if (bot.cutBy === 'player') round.score++;
    }
  }
  if (!reduced && round.time >= round.nextEvent) {
    const available = round.bots.filter((b) => !b.cut && b.maneuver === 'glide');
    const kite = available[Math.floor(random(round, 0, available.length))];
    if (kite) beginManeuver(kite, random(round) < 0.5 ? 'loop' : 'swoop');
    round.nextEvent = round.time + random(round, 6, 12);
  }
}
