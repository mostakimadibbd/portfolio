# Mostakim Adib — Portfolio

A production-grade full-stack portfolio for an AI/ML and software engineer. Server-rendered
Express backend, a zero-framework frontend, a small JSON API, a searchable project catalogue
and individual project case studies.

Built for speed: server-side rendered HTML, no client framework, ~12 KB gzipped for the home
page, and a strict CSP with no third-party scripts.

---

## Highlights

| | |
|---|---|
| **Rendering** | Server-side rendered (SSR) — content is in the HTML, crawlable and instant to paint |
| **Frontend** | Vanilla ES modules, CSS custom properties, light/dark themes, no framework |
| **Backend** | Express 4, layered routes/services/middleware, Zod validation, Helmet CSP |
| **API** | Versioned REST (`/api/v1`) with a consistent JSON envelope and pagination |
| **Contact** | Validated + rate-limited + honeypot-protected; local file storage on a persistent single-server volume, mail-relay-backed on serverless |
| **Quality** | Automated integration tests (`node:test`), structured logging, graceful shutdown |
| **A11y** | Semantic landmarks, labelled controls, visible focus rings, `prefers-reduced-motion` support |

---

## Quick start

```bash
npm install
cp .env.example .env      # optional — sensible defaults are built in
npm run dev                # http://localhost:3000
```

Production:

```bash
NODE_ENV=production npm start
```

Requires **Node.js 18.17+** (Node 20 or 22 recommended).

---

## Project structure

```
portfolio/
├── server/
│   ├── index.js                 # Entry point: listen + graceful shutdown
│   ├── app.js                   # Express app factory (middleware chain)
│   ├── config/index.js          # Environment-driven configuration
│   ├── data/                    # Content source of truth (profile, projects, skills…)
│   ├── middleware/              # security, rate limit, validation, logging, errors
│   ├── routes/                  # Route definitions (thin — no business logic)
│   ├── services/                # Business logic (projects query, contact, mail)
│   ├── store/messageStore.js    # Atomic JSON persistence
│   ├── utils/                   # ApiError, logger, async wrapper, responses
│   └── views/                   # Home, project index and case-study templates
├── public/                      # Static assets: CSS, JS, SVG, robots.txt
├── tests/api.test.js            # Integration tests
└── var/messages.json            # Runtime storage (git-ignored)
```

---

## API

All responses use a consistent envelope.

```jsonc
// success
{ "success": true, "data": { }, "meta": { } }

// failure
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "…", "details": [ ] } }
```

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Liveness, uptime and environment |
| `GET` | `/api/v1/site` | Aggregate payload: profile, skills, experience, credentials, tags |
| `GET` | `/api/v1/profile` | Profile details |
| `GET` | `/api/v1/profile/skills` | Skill groups with proficiency levels |
| `GET` | `/api/v1/profile/experience` | Experience timeline |
| `GET` | `/api/v1/profile/credentials` | Education, certifications, speaking |
| `GET` | `/api/v1/projects` | Paginated list — `?featured`, `?tag`, `?search`, `?page`, `?limit` |
| `GET` | `/api/v1/projects/tags` | Tag list with usage counts |
| `GET` | `/api/v1/projects/stats` | Catalogue statistics |
| `GET` | `/api/v1/projects/:slug` | Single project |
| `POST` | `/api/v1/contact` | Submit an enquiry (rate limited, honeypot protected) |
| `GET` | `/projects` | Server-rendered, searchable project catalogue |
| `GET` | `/projects/:slug` | Server-rendered project case study |

Example:

```bash
curl "http://localhost:3000/api/v1/projects?tag=PyTorch&limit=5"
curl -X POST http://localhost:3000/api/v1/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"Hello there, I would like to talk."}'
```

---

## Customising the content

Everything the visitor reads lives in `server/data/`. No frontend edits required.

| File | Controls |
|---|---|
| `server/data/profile.js` | Name, role, summary, contact details, socials, stats, highlights |
| `server/data/projects.js` | Project cards, tags, metrics, links |
| `server/data/skills.js` | Skill groups and proficiency percentages |
| `server/data/experience.js` | Employment timeline |
| `server/data/certifications.js` | Education, certifications, talks |

Then restart the server — the home page re-renders automatically (memoised for 60 s).

Two placeholders need attention before going live:

- `profile.resumeUrl` — points at `/assets/resume.pdf`; drop the real file in `public/assets/`.
- `profile.email` / `profile.phone` — currently example values.

---

## Configuration

Every value has a working default; `.env` is optional. See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | `production` enables JSON logging, HSTS and asset caching |
| `SITE_URL` | `http://localhost:3000` | Public origin used by canonical URLs and the sitemap |
| `CORS_ORIGINS` | `*` | Comma-separated allowlist |
| `RATE_LIMIT_MAX` | `300` | API requests per window per IP |
| `CONTACT_RATE_LIMIT_MAX` | `5` | Contact submissions per window per IP |
| `MAIL_ENDPOINT` | — | HTTP mail relay for contact delivery |
| `MAIL_API_KEY` | — | Bearer token for the relay |
| `MAIL_TO` | — | Recipient address |
| `MESSAGES_FILE` | `./var/messages.json` | Where enquiries are stored |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |

Without `MAIL_ENDPOINT` a traditional server persists messages locally and logs them. That file
store needs a persistent writable volume and is intended for a single server process. Serverless
deployments must configure a mail relay: function filesystems are ephemeral, so the contact
endpoint returns `503` rather than claiming that an enquiry was durably stored.

---

## Performance

- **SSR** — one HTML round trip, no client-side data waterfall.
- **Project pages** — server-rendered catalogue and individual case studies with a generated sitemap.
- **~12 KB** gzipped for the home page (67 KB raw).
- **Zero dependencies** in the browser bundle — no framework, no polyfills.
- **Compression** via `compression` middleware; immutable caching for static assets.
- **IntersectionObserver** for reveal animations, meters and counters — no scroll handlers
  on the hot path.
- **Passive listeners** and `requestAnimationFrame`-batched count-ups.

## Security

- Helmet CSP with no inline scripts; `frame-ancestors 'none'`, `object-src 'none'`.
- Zod validation on every input with field-level error messages.
- Two-tier rate limiting (global + strict on the contact endpoint).
- Rate limits use the process-local default store; multi-instance/serverless deployments should
  also enforce shared limits at the platform edge or configure a shared rate-limit store.
- Honeypot field plus server-side absorption of bot submissions.
- 32 KB body limit, strict CORS allowlist, `x-powered-by` disabled.
- Stack traces are never exposed in production.

## Accessibility

- Semantic landmarks, single `<h1>`, ordered heading levels.
- Every input has an associated `<label>`; errors use `role="alert"`.
- Visible focus rings, `skip-link`, and `aria-live` regions for status messages.
- Full keyboard support, including the mobile menu (`Esc` to close).
- `prefers-reduced-motion` disables animation and reveals content immediately.
- Print stylesheet included.

---

## Testing

```bash
npm test
```

Covers SSR output, every API endpoint, filtering, pagination validation, contact
submission (valid, invalid email, short message, honeypot) and static asset delivery.

## Deployment

Any Node host works. Set `NODE_ENV=production`, configure `SITE_URL`, and run:

```bash
npm ci --omit=dev && npm start
```

Put it behind a reverse proxy (nginx, Caddy) or a managed platform (Render, Railway, Fly.io).
For Vercel/serverless, the `api/index.js` entry point is used; set `SITE_URL` and configure
`MAIL_ENDPOINT` (and its credentials) so enquiries are delivered outside the function. For a
multi-instance server, replace local message storage and the in-memory rate-limit store with
shared services before scaling out.
The standalone server binds to `0.0.0.0` and trusts one proxy hop in production.
