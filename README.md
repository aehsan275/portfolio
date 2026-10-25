# Abdullah’s portfolio

An illustrated rooftop scene with daylight and moonlight, a bilingual identity, and a kite game. Click, tap, or drag any kite to claim it and start immediately. All other flying kites become bots in the same sky. Bots can eliminate each other and the player; the last kite flying wins. Keyboard users can focus a kite and press Enter or Space. Instructions, pause, results, replay, and exit live in a rounded bottom control box.

Kites begin in a fresh random arrangement and have individual wind-driven motion, occasional loops, swoops, and falls. The traditional balconies use crisp architectural illustration; buildings have no lettering, while the bilingual name remains. Desktop chapters fit one screen from 1280×720, with three project columns throughout desktop layouts.

The landing page is `/`. The top **home** navigation item always returns visitors to that landing view.

## Run

```sh
npm install
npm run dev
npm run build
```

Run `npm run qa` against the local development server on port 5173, or set `PORTFOLIO_URL` to your preview URL. The checks cover seeded flight and combat simulation, all desktop chapters at 1280×720 through 1920×1080, Minar clearance, responsive project columns, both themes, kite continuity, keyboard/touch input, elimination, replay, and leaving the game. Mobile layout refinement is deferred; readable mobile flow and touch/reduced-motion behavior remain covered. They use installed Google Chrome.

## Structure

- `src/designs/VerandaBasant.tsx` — single-page portfolio and chapter navigation
- `src/designs/LahoreArchitecture.tsx` — skyline, garden pavilion, and shopfront illustrations
- `src/designs/RandomBasantSky.tsx` — interactive kite scene
- `src/designs/kiteSimulation.ts` — seeded flight, maneuvers, and elimination combat
- `src/data.ts` — portfolio content

The wider skyline canvas holds 32 varied building facades with uniform proportions. Architecture and celestial bodies appear only on Home. The ambient sky has eight desktop/five mobile kites; kites fade over text, and fallen kites receive softly fading replacements. Game rounds retain elimination without respawning opponents.
