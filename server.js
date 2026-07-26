/**
 * DecodeLabs Full Stack Project 4 - Backend
 * ------------------------------------------
 * A small REST API for managing "interns", built to demonstrate:
 *  - Proper REST verbs (GET, POST, PUT, PATCH, DELETE)
 *  - Correct HTTP status codes (200, 201, 204, 400, 404, 500)
 *  - JSON serialization over the wire
 *  - CORS enabled so a separately-served frontend can call it
 *
 * Zero external dependencies (uses Node's built-in http module only),
 * so it runs anywhere with just: node server.js
 * Server listens on http://localhost:5000
 */

const http = require("http");

const PORT = process.env.PORT || 5000;

// ---- In-memory "database" -------------------------------------------------
let interns = [
  { id: 1, name: "Alex Johnson", role: "Frontend Intern", email: "alex@decodelabs.tech", contact: "9000000001" },
  { id: 2, name: "Priya Sharma", role: "Backend Intern", email: "priya@decodelabs.tech", contact: "9000000002" },
  { id: 3, name: "Sam Lee", role: "Full Stack Intern", email: "sam@decodelabs.tech", contact: "9000000003" },
];
let nextId = 4;

// ---- Helpers ----------------------------------------------------------------

function sendJson(res, statusCode, data) {
  const body = data === undefined ? "" : JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy(); // simple guard against huge bodies
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("Malformed JSON in request body."));
      }
    });
    req.on("error", reject);
  });
}

// ---- Server / router ---------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // Handle the CORS preflight OPTIONS request (page 11: "The Preflight")
  if (method === "OPTIONS") {
    return sendJson(res, 204, undefined);
  }

  try {
    // GET /api/interns -> list all
    if (method === "GET" && path === "/api/interns") {
      // Simulate a little network latency so the frontend's loading state is visible
      await new Promise((r) => setTimeout(r, 400));
      return sendJson(res, 200, interns);
    }

    // GET /api/interns/:id -> single intern
    let match = path.match(/^\/api\/interns\/(\d+)$/);
    if (method === "GET" && match) {
      const intern = interns.find((i) => i.id === Number(match[1]));
      if (!intern) return sendJson(res, 404, { error: `Intern with id ${match[1]} not found.` });
      return sendJson(res, 200, intern);
    }

    // POST /api/interns -> create
    if (method === "POST" && path === "/api/interns") {
      const body = await readJsonBody(req);
      const { name, role, email, contact } = body;
      if (!name || !role || !email) {
        return sendJson(res, 400, { error: "name, role, and email are required fields." });
      }
      const newIntern = { id: nextId++, name, role, email, contact: contact || "" };
      interns.push(newIntern);
      return sendJson(res, 201, newIntern); // 201 Created
    }

    // PUT /api/interns/:id -> full replace
    if (method === "PUT" && match) {
      const intern = interns.find((i) => i.id === Number(match[1]));
      if (!intern) return sendJson(res, 404, { error: `Intern with id ${match[1]} not found.` });
      const body = await readJsonBody(req);
      const { name, role, email, contact } = body;
      if (!name || !role || !email) {
        return sendJson(res, 400, { error: "name, role, and email are required for a full update." });
      }
      Object.assign(intern, { name, role, email, contact: contact || "" });
      return sendJson(res, 200, intern);
    }

    // PATCH /api/interns/:id -> partial update
    if (method === "PATCH" && match) {
      const intern = interns.find((i) => i.id === Number(match[1]));
      if (!intern) return sendJson(res, 404, { error: `Intern with id ${match[1]} not found.` });
      const body = await readJsonBody(req);
      Object.assign(intern, body);
      return sendJson(res, 200, intern);
    }

    // DELETE /api/interns/:id -> remove
    if (method === "DELETE" && match) {
      const index = interns.findIndex((i) => i.id === Number(match[1]));
      if (index === -1) return sendJson(res, 404, { error: `Intern with id ${match[1]} not found.` });
      interns.splice(index, 1);
      return sendJson(res, 204, undefined); // 204 No Content
    }

    // Unknown route
    return sendJson(res, 404, { error: "Route not found." });
  } catch (err) {
    console.error(err);
    return sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Project 4 backend running at http://localhost:${PORT}`);
});
