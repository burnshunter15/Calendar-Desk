# Calendar Desk

**Retired 2026-07-31.** The site has been taken down. Calendar requests go to Nadine over Discord.

This repo is kept as the record of what was built. It is not maintained and nothing here is running.

## What's here

- `src/page.js` — the frontend, as last deployed plus the confirm screen that never shipped.
- `dev-server.mjs` — a local harness for driving each API state by hand, including the failure
  modes. `node dev-server.mjs`, then open `http://localhost:8787`. Set `MOCK=` to `404`,
  `processing`, `needs_attention`, `completed`, `ready`, `ready_past` or `ready_xss`, and `CONFIRM=`
  to `ok`, `duplicate`, `draft_changed` or `unavailable`.
- `docs/DECISIONS.md` — what was decided and why, and what went wrong. The useful part.

## History

Read the commit log in order. Each commit explains the defect it fixes and how it was verified, and
several are worth more than the code:

- `3ccfb24` — a waiting card visible on every page load, because an author style quietly defeated
  the `hidden` attribute; and dead requests retrying forever instead of failing.
- `1c94a2d` — the receipt capability moved out of the URL, where it had been landing in logs.
- `a3495c4` — submissions as JSON, so uploads could be refused before any body was parsed.
- `c60ecb0` — the draft review and confirm screen. Built, tested, never deployed.

## Not in this repo

Personal data, internal paths, service-token names and the Pi's service layout are deliberately
absent. The full plan and the security reviews are archived privately on the owner's machine.

## If anyone picks this up again

Read `docs/DECISIONS.md` first, particularly *What went wrong*. The two failures worth avoiding are
rebuilding comprehension that already exists elsewhere, and debugging a visual bug by describing it
instead of looking at it.
