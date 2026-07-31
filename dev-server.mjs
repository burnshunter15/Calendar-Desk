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

const bodies = {
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
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ ok: true, submissionId: "dev-" + Date.now(), receipt: "dev-receipt" }));
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
