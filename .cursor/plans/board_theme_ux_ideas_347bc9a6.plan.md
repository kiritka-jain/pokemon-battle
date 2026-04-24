---
name: Board theme UX ideas
overview: Design directions for board visual themes that improve readability and mood for a Quoridor-style grid, grounded in your existing `BoardArenaId` system and common patterns from abstract strategy and Pokemon-adjacent games.
todos:
  - id: pick-directions
    content: Shortlist 2–3 mood directions (e.g. Route, Gym, Night) and target arenas
    status: completed
  - id: a11y-pass
    content: Grayscale + colorblind check on fence vs tile vs valid-move tokens
    status: completed
  - id: implement-tokens
    content: "When ready: extend arenaTheme (and types if new arenas) without changing Tile API"
    status: completed
isProject: false
---

# Board theme suggestions (UX + references)

Your board already follows a solid pattern: checkerboard contrast per cell, arena-tinted chrome, consistent **legal-move** dot + ring and a **high-contrast pending** ring ([`arenaTheme.ts`](pokepath/src/lib/board/arenaTheme.ts), [`Tile.tsx`](pokepath/src/components/board/Tile.tsx)). Below are **theme directions** that build on that, plus what similar games do for clarity.

## What similar games optimize for

- **Abstract strategy (Quoridor, Chess.com, Lichess)**: The grid and walls must stay **legible at a glance**; decorative skins stay **low-frequency** (large regions, subtle texture), while **high-frequency** cues (valid squares, selection, last move) use **strong, consistent** colors unrelated to the “wood” or “marble” skin.
- **Pokemon-style tactics (e.g. mainline FE grid, Pokemon Mystery Dungeon maps)**: **Terrain reads as type** (grass vs water vs lava) but **units and paths** still pop via outlines, shadows, or UI overlays—not only tile hue.
- **Digital card / map UIs (Slay the Spire, roguelike maps)**: **Dark vignette** around the playfield and slightly **raised** center so the board feels like the “stage”; reduces eye strain and focuses attention.

## Theme directions that fit your six arenas

Each row is a **mood** you can express with the same tokens you already have (tile pair, chrome, fence P1/P2, valid dot/ring)—no need to change game rules.

| Direction | Feel | UX note |
|-----------|------|---------|
| **Route / overworld** | Sunny paths, soft sky gradients at board edges | Matches Pokemon “journey” fantasy; keep tile saturation moderate so yellow valid dots stay visible on `electric` / `ground`. |
| **Gym interior** | Polished floor + accent trim matching type | Like a small arena; **strong border** around the whole grid (you already have `getArenaBoardOuterRingClass`) reads well here. |
| **Battlefield night** | Deepened dark-mode bases + slightly brighter valid rings | Good for long sessions; ensure **fence** contrast vs background does not drop (your separate P1/P2 fence colors help). |
| **Safari / nature reserve** | Grass/water/ground as dominant; fire/electric as “rare” accent tiles | Coherent world-building; watch **checker contrast** on `grass` vs `ground` so they don’t merge for color-weak users. |
| **Sky pillar / wind temple** | `air` as mist + cool neutrals; thin grid lines if you add them later | References floating arenas in JRPGs; rely on **outline** on pieces more than busy tile art. |
| **Industrial / power plant** | `electric` + `ground` as concrete + hazard stripes (subtle) | Fits “obstacle course”; use **stripes only on chrome or outer frame**, not every cell, to avoid visual noise. |

## Additional arenas (if you expand `BOARD_ARENA_IDS` later)

- **Ice / frost**: High clarity, cool grays + cyan highlights—excellent reference from **tactical RPG snow maps** (readable grid, obvious obstacles).
- **Psychic / cosmic**: Soft violet gradients; keep valid-move markers **warm** (amber/yellow) so they stay the focal color (you already use a shared pending ring).
- **Ruins / cave**: Desaturated stone; **type color only on accents** (valid moves, turn chip)—similar to **dungeon maps** in Mystery Dungeon style games.

## UX principles to carry into any theme

1. **Hierarchy**: Background &lt; tiles &lt; fences &lt; **interaction layer** (dots, rings, hover). Games like **Lichess** keep the top layer visually dominant.
2. **One accent for “action”**: Prefer a single family (e.g. amber/teal) for “you can click here” across all arenas so muscle memory beats arena hue.
3. **Colorblind / low vision**: Test `electric` vs `ground` and `fire` vs `grass` in grayscale; if two arenas look identical, shift **darkness** not only hue.
4. **Motion**: Subtle pulse on pending target only; avoid animating every legal square (fatigue, common complaint in flashy mobile puzzle UIs).

## Optional implementation path (when you approve work)

- Extend [`arenaTheme.ts`](pokepath/src/lib/board/arenaTheme.ts) with optional **CSS variables** or layered backgrounds (e.g. `bg-gradient` + faint noise) per arena while keeping the same API.
- Add a **user preference** “high contrast board” that swaps `TILES` / `VALID_*` to a shared accessibility palette (pattern used by chess sites).

No code changes in this phase—this is a design menu you can pick from or mix (e.g. “Gym interior” chrome + “Route” tile softness).
