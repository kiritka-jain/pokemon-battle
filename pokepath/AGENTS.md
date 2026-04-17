<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Local play (`/play`)

The local board route uses a fixed **player1** seat only (no P1/P2 toggle). To exercise **player2** behavior, use a real multiplayer match at `/match/[matchId]` (two accounts) or a second browser / incognito session as the other player.
