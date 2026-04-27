# 📘 Product Requirements Document: PokéPath - Route Rush

## 1. Executive Summary
**PokéPath: Route Rush** is a turn-based, 2-player tactical route duel designed for mobile-web browsers. It is not a traditional Pokémon combat simulator; Pokémon provide the nostalgic theme, trainer and Pokemon identity, and future ability hooks while the core gameplay focuses on zero-luck path racing, fence placement, and spatial strategy inspired by *Quoridor*.

---

## 2. Target Audience & Success Metrics

### Target Audience
* **Casual Gamers:** Looking for quick 5–10 minute competitive matches.
* **Pokémon Fans:** Players who enjoy nostalgic Pokémon presentation, quick duels, and strategy over RNG (Random Number Generation).
* **Abstract Strategy Players:** Players who like chess-like positional games with simple rules and high tactical depth.
* **Mobile Users:** Players who want a high-quality "app-like" experience directly in their mobile browser without downloading an app.

### Success Metrics (KPIs)
* **Session Duration:** Average match time between 4–7 minutes.
* **Retention:** Users playing more than 3 matches in a single session.
* **Engagement:** Number of registered accounts versus guest players.

---

## 3. Core Game Mechanics

### The Arena
* **Grid Dimensions:** 9x9 square tiles.
* **Visual Theme:** Type-inspired route arenas with classic Pokémon flavor.
* **Starting Positions:** Player 1 (Red) starts at the center of the bottom edge. Player 2 (Blue) starts at the center of the top edge.
* **Win Condition:** The first player to move their Trainer to any tile on the opponent's starting baseline wins instantly.

### The Action Economy
Players take turns. On a player's turn, they must take exactly **one** of the following two actions:
1.  **Move:** Shift the Trainer one square orthogonally (North, South, East, West). Diagonal movement is forbidden.
2.  **Place Obstacle:** Drop one "Sudowoodo" (fence) on the board.

### Obstacle (Fence) Rules
* **Inventory:** Each player starts with exactly 10 fences.
* **Size:** A fence covers exactly two grid edges.
* **Placement Restrictions:** Fences cannot overlap each other, and they cannot intersect another fence.
* **The "Path of Hope" Rule:** A fence cannot be placed if it completely blocks either player from reaching their respective finish lines. A valid route must always exist for both players.

### The "Face-to-Face" Jump Rules
* **Straight Jump:** If two Trainers are on adjacent squares facing each other, the active player can jump directly over the opponent, landing on the square immediately behind them.
* **Dodge Jump:** If a straight jump is blocked by a fence or the edge of the board, the active player can jump diagonally to the immediate left or right of the opponent.

---

## 4. User Experience (UX) & Interface

### Mobile-First Interaction ("Fat Finger" Protection)
Because mobile screens are small, tapping a tiny grid edge to place a fence can lead to frustrating mis-clicks.
* **Tap 1 (Preview):** Tapping a grid square or edge displays a translucent "ghost" of the Trainer or the Sudowoodo fence.
* **Tap 2 (Confirm):** A prominent "Confirm Move" button lights up at the bottom of the screen. The turn only executes when this button is pressed.

### Screen Flow Map
* **Screen 1: Landing Page.** Clearly frames Route Rush as a Pokémon-themed tactical route duel, with entry points for learning, practice, ranked play, and the global leaderboard.
* **Screen 2: Trainer Card (Profile).** Displays the user's competitive rating, total wins/losses, and preferred Trainer Sprite.
* **Screen 3: Matchmaking.** A simple waiting lobby while connecting to an opponent.
* **Screen 4: Game Board.** The active 9x9 grid, turn indicators, and fence inventory belts.
* **Screen 5: Victory/Defeat Screen.** Awards ranking points, displays match duration, and features a "Play Again" button.

---

## 5. Approved Technology Stack

*Note: All algorithms, game state logic, database schemas, and API routes will be strictly defined in the accompanying Technical Design Document (TDD).*

* **Frontend Framework:** Next.js (App Router) with React.
* **Styling:** Tailwind CSS.
* **Client State Management:** Zustand.
* **Backend, Auth & Database:** Supabase (PostgreSQL & Realtime WebSockets).

---

## 6. Monetization Strategy

To keep the game free while generating revenue, Google Ads will be integrated via a non-intrusive approach that protects the gameplay experience.

* **Banner Ads:** A static, standard mobile banner placed at the absolute bottom of the Matchmaking and Trainer Card screens.
* **Interstitial Ads:** Full-screen ads triggered *only* after a match concludes, between the Victory Screen and returning to the Main Menu. Ads will never interrupt active gameplay or be visible on the Game Board screen.

---

## 7. Version 2 (V2) Roadmap: Trainer Abilities

The MVP (V1) focuses on the classic ruleset to establish a balanced meta. V2 will introduce "Trainer Classes" to add layered, asymmetric strategy. 

* **Ghost Trainer:** Can pass through exactly one Sudowoodo fence per game.
* **Rock Trainer:** Starts with 9 fences instead of 8.
* **Electric Trainer:** Can use an action to move two spaces in a straight line once per game.
