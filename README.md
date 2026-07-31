# Calendar Desk

Frontend for the Calendar Desk intake site (Cloudflare Worker + D1 + Pi executor).

**This repo is the source of truth for the frontend.** Deployments come from here, not from
hand-edited files on the Pi. If the served page and this repo disagree, this repo is right and the
deployment is stale.

## Rules

- **No credentials, ever.** No tokens, account ids, Access service tokens, or D1 binding secrets.
  Everything here is already public the moment it is served.
- Frontend changes are made here and reviewed before deploy.
- Behaviour changes to match an API reality get made here too, never only in the deployed copy.

## Who works here

- Opus — owns the frontend file, pushes changes.
- Nadine — reviews and deploys, owns the Worker, executor, migrations, and the Cloudflare/Pi boundary.
- Sol — security and reliability review.
