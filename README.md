# DecodeLabs Full Stack Project 4 — Frontend & Backend Integration

A working full-stack **Intern Management System** that demonstrates everything in
the Project 4 brief: fetch-based frontend↔backend integration, async/await,
dynamic DOM rendering, JSON serialization, CORS, HTTP status code handling, and
defensive error handling (try/catch/finally + fallback UI).

## Structure

```
project4/
├── backend/
│   ├── server.js       # REST API (pure Node http module, zero dependencies)
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js        # fetch() calls, async/await, DOM injection, error handling
```

## How to run

### 1. Start the backend
```bash
cd backend
npm start
# or: node server.js
```
You should see: `✅ Project 4 backend running at http://localhost:5000`

No `npm install` is required — the server uses only Node's built-in `http`
module, so it runs on any machine with Node.js installed (v14+).

### 2. Open the frontend
Just open `frontend/index.html` directly in your browser (double-click it, or
use a tool like VS Code's "Live Server" extension). It will call the API at
`http://localhost:5000`.

> The backend sends CORS headers (`Access-Control-Allow-Origin: *`), so it's
> fine that the frontend is opened from a `file://` URL or a different port.

## API Reference

| Method | Endpoint            | Purpose                    | Success | Errors    |
|--------|----------------------|-----------------------------|---------|-----------|
| GET    | `/api/interns`       | List all interns            | 200     | 500       |
| GET    | `/api/interns/:id`   | Get one intern               | 200     | 404       |
| POST   | `/api/interns`       | Create an intern             | 201     | 400       |
| PUT    | `/api/interns/:id`   | Replace an intern (full)     | 200     | 400, 404  |
| PATCH  | `/api/interns/:id`   | Update an intern (partial)   | 200     | 404       |
| DELETE | `/api/interns/:id`   | Remove an intern             | 204     | 404       |

## What this demonstrates (mapped to the brief)

- **Send requests from frontend to backend** — `script.js` uses `fetch()`
  wrapped in `async`/`await` for every CRUD operation.
- **Display dynamic data on UI** — `renderInterns()` builds DOM nodes with
  `document.createElement` + `textContent` (never `innerHTML` with
  server/user data, to avoid XSS) and injects them into the list.
- **Handle basic errors and responses** — `parseResponseOrThrow()` checks
  `response.ok` and surfaces the server's error message; every network call
  is wrapped in `try/catch/finally`, with a loading spinner, an error banner,
  and a non-blank fallback UI (never a frozen or blank screen).
- **REST correctness** — nouns-not-verbs routes (`/api/interns`, not
  `/getInterns`), and the right idempotent/non-idempotent verbs (GET/PUT/DELETE
  are idempotent; POST/PATCH are not).

## Extending it

- Swap the in-memory `interns` array for a real database (e.g. from Projects
  2/3) — the routes are already structured to make that a drop-in change.
- Add authentication headers to `fetch()` calls if you add a login system.
- Add a "Promise.all" example (e.g. bulk-fetching several interns' details in
  parallel) per the deck's anti-pattern lesson.
