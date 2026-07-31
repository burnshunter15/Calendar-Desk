// Local dev harness. NOT deployed — lets us load the real page and drive the
// API states by hand, including the failure modes that are hard to reproduce live.
//
//   node dev-server.mjs            → status endpoint 404s (stale-receipt bug)
//   MOCK=processing node ...       → stays in flight
//   MOCK=needs_attention node ...  → ambiguous result
//   MOCK=completed node ...        → success
import http from "node:http";
import { PAGE } from "./src/page.js";

const MOCK = process.env.MOCK || "404";
const PORT = Number(process.env.PORT || 8787);

const ready = (title, offsetMin = 1440) => {
  const from = new Date(Date.now() + offsetMin * 60000);
  const to = new Date(from.getTime() + 90 * 60000);
  return {
    ok: true, can_confirm: true, state: "ready",
    headline: "Review your calendar draft",
    message: "Nothing has been changed yet.",
    draft: { revision: 1, assumptions: [], rows: [
      { rowId: "a".repeat(32), operation: "create",
        payload: { action: "create", title, from: from.toISOString(), to: to.toISOString(), timezone: "America/Chicago" } }
    ] }
  };
};

const bodies = {
  ready: ready("Dinner with Mom"),
  ready_past: ready("Dinner with Mom", -2880),
  ready_xss: ready("<img src=x onerror=alert(1)>"),
  confirmed: { ok: true, state: "processing", message: "Confirmed." },
  processing: { ok: true, state: "processing" },
  needs_attention: {
    ok: true,
    state: "needs_attention",
    message:
      "I could not tell which month the 5th belongs to. Nothing was added to the calendar.",
  },
  completed: { ok: true, state: "completed", message: "1 event added." },
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(PAGE);
    }

    if (req.method === "POST" && url.pathname === "/api/jobs") {
      const ct = req.headers["content-type"] || "";
      console.log(`[submit] content-type=${ct}`);
      if (ct.includes("multipart/form-data")) {
        console.warn("  !! multipart submission — Worker would have to parse before rejecting");
        res.writeHead(409, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: false, code: "IMAGE_UPLOADS_DISABLED" }));
      }
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true, submissionId: "dev-" + Date.now(), receipt: "dev-receipt" }));
    }

    if (url.pathname.endsWith("/confirm")) {
      const body = await new Promise(r => { let d = ""; req.on("data", c => (d += c)); req.on("end", () => r(d)); });
      console.log(`[confirm] auth=${req.headers.authorization ? "header" : "MISSING"} body=${body}`);
      const mode = process.env.CONFIRM || "ok";
      if (mode === "draft_changed") {
        res.writeHead(409, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: false, code: "DRAFT_CHANGED", message: "This draft changed. Review the newest version before confirming." }));
      }
      if (mode === "unavailable") {
        res.writeHead(409, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: false, code: "CONFIRMATION_NOT_AVAILABLE" }));
      }
      if (mode === "duplicate") {
        res.writeHead(200, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: true, state: "confirmed", duplicate: true }));
      }
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true, state: "confirmed", message: "Your confirmed request is ready to be applied." }));
    }

    if (url.pathname.startsWith("/api/v2/submissions/")) {
      const auth = req.headers.authorization || "";
      console.log(`[status] ${url.pathname}${url.search} auth=${auth ? "header" : "MISSING"} -> ${MOCK}`);
      if (url.search.includes("receipt=")) console.warn("  !! receipt found in query string");
      if (MOCK === "404") {
        res.writeHead(404, { "content-type": "application/json" });
        return res.end(JSON.stringify({ ok: false, code: "submission_not_found" }));
      }
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(bodies[MOCK] || bodies.processing));
    }

    res.writeHead(404).end();
  })
  .listen(PORT, () => console.log(`dev harness on http://localhost:${PORT}  MOCK=${MOCK}`));
