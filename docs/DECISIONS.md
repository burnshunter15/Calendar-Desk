# Calendar Desk — decision record

Retired 2026-07-31. This is the sanitised record of what was built, what was decided, and what went
wrong. Operational detail and personal data are deliberately not in this repo.

Built by Hunter (owner), Opus (product/UI), Nadine (integration), Sol (security review).

---

## What it was for

A private site where approved family members could type or photograph event details and have them
land on a shared calendar. Cloudflare Access at the front, a Worker and D1 in the middle, and a
Raspberry Pi as the only machine holding calendar credentials, polling outward for work.

## The bug that started it

Someone submitted event details twice and the page said nothing. Both requests had reached the
database, been picked up, and been correctly refused as ambiguous — the parser understood ISO dates
but not `August 3rd, 5th, 10th, 12th`. The outcome was recorded the entire time. The browser simply
never read it back.

That reframed the work: **the system already knew. It just never said.**

## What shipped

- Per-person ownership binding on every submission, with reads failing closed.
- A one-time opaque receipt as a capability, stored hashed, sent as a header — never in a URL.
- A status endpoint and an honest client: real states, real explanations, and a terminal outcome
  instead of an indefinite wait.
- Idempotency on submit, with a conflict error rather than silently returning a stale receipt.
- Lease hardening on the executor: token plus expiry required to complete work.
- Uploads rejected on `Content-Type` before any body is read or parsed.
- Rate limits per identity and per address, separately for submit, read, poll and confirm.
- Origin and `Sec-Fetch-Site` checks on state-changing requests.
- A draft review and confirm screen, built and tested but never deployed — the writer never learned
  to act only on confirmed rows.

## Decisions worth keeping

**Receipt is conflated with success.** A 200 on submit meant "we stored your text," and the UI read
it as "done." Any design where acknowledgement and outcome share a signal will reproduce this.

**Authorization is the control, not parser stupidity.** Considerable effort went into keeping the
parser narrow, in the belief that narrowness was a safety property. It wasn't. Nothing reaches the
calendar without a human approving a specific row — that is the control. Given it, the interpreter
can be as capable as you like, because being wrong produces a proposal that gets declined.

**Human confirmation defends against absurd output, not plausible output.** A person will refuse
"delete everything." They will not catch `11:30 AM` read as `11:30 PM`. The compensating control is
field-level provenance: show which words each value came from, and fail closed when a value has no
source.

**Exactly-once cannot come from queue state.** If the process crashes between the calendar
accepting a write and the local record being updated, only a per-event effect ledger with a stable
key prevents a duplicate on retry. "Committed" must never be set because a request was *sent*.

**Locality improves privacy, not decoder safety.** Reading images on your own hardware keeps
photographs away from a vendor. It also moves hostile image decoding onto the machine holding your
credentials. The protection is containment — unprivileged identity, disposable decode process,
canonical re-encode, hard resource bounds — not the fact that it runs at home.

**Separate the credential domains.** The component reading untrusted input must never hold the
authority to write to the calendar. This was very nearly got wrong twice: once by a shared access
token across parse and commit, and once by a decoder process inheriting its parent's credentials.

## What went wrong

**We rebuilt a capability we already had.** Days went into hand-writing a date grammar while an
agent that understands `August 3rd, 5th, 10th, 12th, 6–7:30 PM` was running on the same hardware.
The drift started for a good reason — routing untrusted text into an agent holding tools was
correctly ruled out — but when the tool-less substitute fell through, the work backed into writing a
parser instead of finding another route to comprehension without capability. **Hunter spotted this;
the people building it did not.**

**Scope grew far past the complaint.** "The button does nothing" became sandboxing, root installs,
release manifests and threat modelling. Some was genuinely necessary — the writer would have created
unapproved events. But the small fix the owner actually wanted got buried, and the project was
retired as too complicated. That judgement was correct.

**Two rounds of blind bug-fixing failed because nobody could see the page.** The frontend author
couldn't open it (behind Access), and the deploying agent couldn't render it either, so visual bugs
were described rather than observed. Putting the file in a repo and loading it in a browser found
the real defect in minutes: an author style, `display:flex`, silently defeating the `hidden`
attribute, so a status card was visible on every page load for every visitor.

**If a visual bug survives one round of description, stop describing it and get it in front of you.**

## Where it ended

Nothing half-deployed, nothing hazardous. Uploads shut, receipts out of URLs, limits and origin
checks in place, image storage empty, and a root installer that was reviewed, rejected, and never
run. The site was soft-stopped rather than deleted, and the submitted history retained as private
data for the owner to dispose of deliberately.

Calendar requests now go to Nadine directly over Discord, which worked the whole time.
