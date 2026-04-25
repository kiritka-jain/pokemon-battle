---
name: Pick Page Dual CTA
overview: Replace the single "Continue to Route" button on `/pick` with two post-selection buttons (rules + play) that appear only after both partner Pokémon are chosen, and preserve selected partner data before navigation.
todos:
  - id: update-pick-cta-props
    content: Refactor `StarterPokemonSelection` props and handlers to support separate rules/play actions using shared payload creation.
    status: completed
  - id: wire-routes-and-storage
    content: Update `/pick` page handlers to persist pick payload then route to `/tutorial` or `/play`.
    status: completed
  - id: add-tests-for-payload-persistence
    content: Add/update unit tests covering partner-pick persistence behavior used by both actions.
    status: completed
isProject: false
---

# Add Dual Post-Selection Actions on Pick Page

## Goal
After a user picks both Pokémon on `/pick`, show two actions instead of "Continue to Route":
- Ask if they want to know the rules
- Ask if they want to play

## Files to update
- [/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/components/pick/StarterPokemonSelection.tsx](/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/components/pick/StarterPokemonSelection.tsx)
- [/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/app/pick/page.tsx](/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/app/pick/page.tsx)
- [/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/lib/pokemon/partnerPickStorage.test.ts](/Users/kirtikaj/workspace/pokemon-battle/pokepath/src/lib/pokemon/partnerPickStorage.test.ts) *(or a new pick-flow unit test file if cleaner)*

## Implementation approach
1. **Expand the pick component API for two actions**
   - Replace the single `onContinue(payload)` callback with two explicit callbacks:
     - `onChooseRules(payload)`
     - `onChoosePlay(payload)`
   - Keep the same roster-complete gate (`rosterFull`) so buttons only appear after two Pokémon are selected.

2. **Replace the single CTA with two side-by-side buttons**
   - In `StarterPokemonSelection`, swap the current single button block for two styled buttons:
     - Primary/secondary labels aligned to user intent (e.g., "Know the rules" and "Let’s play").
   - Both buttons should call the same payload-building logic (species IDs + opened indices + timestamp) before invoking the relevant callback.

3. **Wire routing in `/pick` page**
   - Add two handlers in `pick/page.tsx`:
     - Rules handler: persist partner pick in session storage, then `router.push('/tutorial')`
     - Play handler: persist partner pick in session storage, then `router.push('/play')`
   - Reuse the existing safe storage behavior (`try/catch`) so both routes receive consistent persisted state.

4. **Unit test coverage for persistence behavior**
   - Add/adjust tests to verify payload serialization + session-storage persistence remains intact for the pick payload contract used by both actions.
   - If adding component tests is too heavy with current `node` test environment, keep tests at the storage/handler logic boundary consistent with existing project patterns.

## Acceptance checks
- Before choosing two Pokémon, no post-selection buttons are visible.
- After choosing two Pokémon, exactly two action buttons are visible.
- Clicking rules action navigates to `/tutorial` and preserves selected partners in session storage.
- Clicking play action navigates to `/play` and preserves selected partners in session storage.
- Existing pick payload shape remains unchanged for downstream consumers.