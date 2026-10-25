import assert from 'node:assert/strict';
import {
  createSky,
  createRound,
  stepSky,
  stepRound,
  beginManeuver,
  outcome,
} from '../src/designs/kiteSimulation.ts';
const sky = createSky(12, 2026, 1280, 720);
assert.deepEqual(sky, createSky(12, 2026, 1280, 720));
assert.notDeepEqual(
  sky.kites.map((k) => [k.x, k.y]),
  createSky(12, 2027, 1280, 720).kites.map((k) => [k.x, k.y]),
);
for (const k of sky.kites)
  assert(
    k.x >= sky.bounds.left &&
      k.x <= sky.bounds.right &&
      k.y >= sky.bounds.top &&
      k.y <= sky.bounds.bottom,
  );
const events = new Set();
for (let i = 0; i < 8000; i++) {
  stepSky(sky, 0.025);
  sky.kites.forEach((k) => {
    events.add(k.maneuver);
    assert(Number.isFinite(k.x + k.y + k.angle));
  });
}
assert(events.has('loop') && events.has('swoop') && events.has('falling'));
const falling = sky.kites[0];
falling.cut = true;
falling.cutBy = 'wind';
beginManeuver(falling, 'falling');
for (let i = 0; i < 400 && falling.cut; i++) stepSky(sky, 0.025);
assert(!falling.cut && falling.id === 0, 'ambient kite returns with same identity');
assert.equal(falling.opacity, 0, 'replacement starts invisible after the fall');
for (let i = 0; i < 24; i++) stepSky(sky, 0.025);
assert(falling.opacity > 0 && falling.opacity < 1, 'replacement fades in gradually');
for (let i = 0; i < 48; i++) stepSky(sky, 0.025);
assert.equal(falling.opacity, 1, 'replacement completes its fade');
const bounds = { left: 30, right: 970, top: 65, bottom: 710 };
function arena(count = 3) {
  const s = createSky(count, 64);
  const r = createRound(s.kites, count - 1, bounds, 77);
  r.player = { x: 500, y: 700 };
  r.bots.forEach((b, i) => {
    Object.assign(b, {
      x: i === 0 ? 800 : 200,
      y: 200,
      vx: 0,
      vy: 0,
      speed: 0,
      turnAt: Infinity,
      attackAt: 0,
      attackUntil: 0,
      tension: 50,
    });
  });
  return r;
}
const bots = arena();
for (let i = 0; i < 2400 && outcome(bots) === 'playing'; i++)
  stepRound(bots, 0.025, bots.player, false, true);
assert(
  bots.bots.some((b) => b.cut && typeof b.cutBy === 'number'),
  'bots eliminate each other with attribution',
);
assert.equal(bots.score, 0, 'bot cuts never count as personal cuts');
assert.equal(outcome(bots), 'playing', 'a surviving opponent keeps the round active');
bots.bots.forEach((b) => {
  b.cut = true;
});
assert.equal(outcome(bots), 'won');
const frozen = structuredClone(bots);
stepRound(bots, 0.025, { x: 0, y: 0 }, true);
assert.deepEqual(bots, frozen, 'finished simulation freezes');
const warning = arena(2);
warning.player = { x: 500, y: 150 };
for (let i = 0; i < 12; i++) stepRound(warning, 0.025, warning.player, false, true);
assert(warning.danger && warning.strength === 100, 'warning precedes combat damage');
for (let i = 0; i < 4000 && outcome(warning) === 'playing'; i++)
  stepRound(warning, 0.025, warning.player, false, true);
assert.equal(outcome(warning), 'lost', 'opponent can cut player');
const player = arena(2);
player.player = { x: 500, y: 150 };
player.bots[0].attackUntil = 0;
player.bots[0].attackAt = Infinity;
let pull = true;
for (let i = 0; i < 700 && outcome(player) === 'playing'; i++) {
  if (player.tension > 65) pull = false;
  else if (player.tension < 30) pull = true;
  stepRound(player, 0.025, player.player, pull, true);
}
assert.equal(outcome(player), 'won', 'controlled pulls eliminate the final opponent');
assert.equal(player.bots[0].cutBy, 'player');
assert.equal(player.score, 1);
player.strength = 0;
assert.equal(outcome(player), 'lost', 'simultaneous elimination favors player loss');
const naturalSky = createSky(12, 42, 1280, 720);
const naturalRound = createRound(naturalSky.kites, 0, naturalSky.bounds, 43);
let naturalPull = false;
for (let i = 0; i < 10800 && outcome(naturalRound) === 'playing'; i++) {
  if (naturalRound.tension > 65 || naturalRound.danger) naturalPull = false;
  else if (naturalRound.contact && naturalRound.tension < 30) naturalPull = true;
  stepRound(naturalRound, 1 / 60, { x: 500, y: 155 }, naturalPull);
}
assert.equal(outcome(naturalRound), 'won', 'a natural full-population round is winnable');
assert(
  naturalRound.bots.some((b) => typeof b.cutBy === 'number'),
  'natural flight creates bot-versus-bot eliminations',
);
console.log(
  'PASS seeded placement, varied ambient flight, falls/re-entry, bot battles, player combat, warnings, attribution, terminal states and tie precedence',
);
