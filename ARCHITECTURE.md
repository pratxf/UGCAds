# UGCAds — Architecture & Pipeline

End-to-end map of how the app is wired: tech stack, directory layout, auth, database, generation pipeline, admin panel, deployment. Read this top-to-bottom and you'll know where to make any change.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript |
| UI | Tailwind v4 + shadcn/ui + FontAwesome + Lucide |
| Auth (users) | Supabase Auth (email + OAuth) |
| Auth (admin) | Password cookie (HMAC-signed, 7-day) |
| DB | PostgreSQL (Supabase) via Prisma |
| Storage | Cloudflare R2 (S3-compatible) |
| Background jobs | Inngest |
| AI providers | fal.ai (Flux Kontext, Kling 2.5, ElevenLabs, LatentSync) |
| Payments | Dodo / Cashfree / Razorpay (provider-agnostic schema) |
| Hosting | Vercel |

---

## 2. Top-level directory layout

```
src/
├── app/
│   ├── (admin)/                  # Admin panel route group
│   │   ├── _components/AdminShell.tsx
│   │   ├── layout.tsx            # passthrough — auth handled by middleware
│   │   └── admin/
│   │       ├── login/page.tsx    # password-only login
│   │       └── (protected)/      # everything below requires admin cookie
│   │           ├── layout.tsx    # wraps in AdminShell (sidebar + topbar)
│   │           ├── page.tsx      # overview
│   │           ├── users/
│   │           ├── generations/
│   │           ├── avatars/      # avatar library CRUD + categories
│   │           ├── photoshoot-templates/ # template CRUD + hidden prompts
│   │           ├── revenue/
│   │           └── settings/
│   ├── (app)/                    # User dashboard
│   │   ├── layout.tsx            # auth gate, mounts Sidebar + TopBar
│   │   ├── dashboard/
│   │   ├── create/
│   │   │   ├── ugc/              # UGC Ad wizard (4 steps)
│   │   │   ├── product-ad/       # Product Ad wizard (4 steps)
│   │   │   └── ai-photoshoot/    # Photoshoot generator (single page)
│   │   ├── history/
│   │   ├── credits/
│   │   ├── billing/
│   │   ├── profile/
│   │   └── support/
│   ├── (auth)/                   # /login, /signup
│   ├── (marketing)/              # public landing pages
│   ├── api/                      # see Section 6
│   ├── auth/                     # supabase OAuth callback
│   └── layout.tsx                # root layout
│
├── components/
│   ├── app/                      # Sidebar, TopBar
│   ├── landing/
│   └── ui/                       # shadcn primitives
│
├── lib/
│   ├── auth.ts                   # getCurrentUser / requireUser / requireAdmin (role)
│   ├── admin-auth.ts             # cookie-based admin gate (password)
│   ├── prisma.ts                 # singleton client
│   ├── r2.ts                     # uploadToR2 / uploadToR2FromUrl
│   ├── fal.ts                    # AI provider wrappers
│   ├── inngest.ts                # client
│   ├── credits.ts                # COSTS, formatting (tenths-encoded)
│   ├── hooks/use-library.ts      # useAvatars / usePhotoshootTemplates
│   ├── stores/mobile-nav.ts      # zustand: mobile sidebar drawer
│   └── supabase/                 # ssr + middleware helpers
│
├── inngest/
│   └── generate-video.ts         # the entire AI pipeline
│
├── middleware.ts                 # Supabase session refresh + admin cookie gate
└── ...

prisma/
├── schema.prisma                 # source of truth for the DB
└── migrations/
```

---

## 3. Authentication

### Users — Supabase Auth

- Email/password and OAuth flows handled by Supabase.
- Server-side session reads via `@/lib/supabase/server`.
- Middleware refreshes the Supabase cookie on every navigation (`updateSession`).
- `getCurrentUser()` reads Supabase user, then upserts a row into the local Prisma `User` table on first call, returning the Prisma record (with `credits`, `role`, etc.).
- `requireUser()` throws if not signed in — used in API routes to gate user actions.
- The `(app)/layout.tsx` calls `getCurrentUser()` and `redirect("/login")` on miss.

### Admin — password cookie

- **Single shared password** in `ADMIN_PASSWORD` env var. No per-user admin accounts.
- `POST /api/admin/login` checks the password, sets an HTTP-only cookie `ugcads_admin = "<issuedAt>.<HMAC-SHA256(issuedAt)>"`, max-age 7 days.
- `src/middleware.ts` redirects any `/admin/*` path (except `/admin/login`) to the login page when the cookie is absent. If the cookie is present on `/admin/login`, it bounces to `/admin`.
- `requireAdmin()` in `lib/admin-auth.ts` re-verifies the HMAC on every admin API call (defense in depth — middleware only checks presence).
- Logout: `DELETE /api/admin/login` clears the cookie.

> The `User.role` enum (`USER` | `ADMIN`) still exists in the DB for future role-based use, but is **not** used by the current admin gate.

---

## 4. Database (Prisma schema)

All models in `prisma/schema.prisma`. Migrations applied via `prisma db push` (Supabase's migration history is detached from local migration folder).

### Core
- **User** — Supabase-linked. Fields: `email`, `name`, `avatar`, `role`, `credits` (integer **tenths** — `10 = 1.0 credit`), `subscription`, `generations`, `transactions`.
- **Subscription** — plan + status + period bounds, links to a `PaymentProvider` (Dodo/Cashfree/Razorpay).
- **Generation** — every UGC / Product Ad / Mockup run. Holds inputs (`characterId`, `script`, `productImage`, etc.), outputs (`compositeImageUrl`, `audioUrl`, `rawVideoUrl`, `finalVideoUrl`), pipeline status, and credits used.
- **Transaction** — credit ledger. Types: `SUBSCRIPTION` / `TOPUP` / `USAGE` / `REFUND` / `RENEWAL`. Positive `credits` = grant, negative = consume.
- **AppSetting** — KV store for runtime config.

### Library (admin-managed)
- **Avatar** + **AvatarCategory** — UGC characters shown in UGC Ad / Product Ad wizards.
- **PhotoshootTemplate** + **PhotoshootCategory** — backgrounds for AI Photoshoot. Each template has a `prompt` field that is **server-only** (never selected by the public API).

### Enums
`Role`, `Plan`, `SubscriptionStatus`, `BillingCycle`, `PaymentProvider`, `GenType`, `GenStatus`, `AspectRatio`, `Quality`, `AIProvider`, `TransactionType`, `TransactionStatus`.

---

## 5. Storage — Cloudflare R2

Configured in `src/lib/r2.ts`:
- `uploadToR2(buffer, key, contentType)` — direct upload of a buffer.
- `uploadToR2FromUrl(url, key, contentType?)` — downloads a remote URL and re-uploads. Used by the Inngest pipeline to mirror fal.ai outputs into our bucket so they're permanent and on our CDN.

Key prefixes used:
- `avatars/<timestamp>-<rand>.<ext>` — admin avatar uploads
- `photoshoot-templates/<timestamp>-<rand>.<ext>` — admin template previews
- `product/<userId>/<ts>.<ext>` — user product images for Product Ads
- `photoshoot-input/<userId>/<ts>.<ext>` — user product images for AI Photoshoot
- Pipeline outputs land at fal-provided keys, then are re-uploaded under `generations/<id>/...` (see `inngest/generate-video.ts`).

ENV: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

---

## 6. API routes

### Public (read-only, anyone can call)
- `GET /api/avatars` — returns `{ avatars, categories }` for the user-facing library. Strips inactive items.
- `GET /api/photoshoot-templates` — returns `{ templates, categories }`. **Critically does not select `prompt`.**

### User (require Supabase session)
- `POST /api/generate/ugc` — JSON body, creates a UGC Ad generation, deducts credits, dispatches Inngest event.
- `POST /api/generate/product-ad` — multipart (product image + fields), same flow.
- `POST /api/generate/mockup` — multipart, looks up template prompt **server-side**, creates a MOCKUP generation.
- `GET /api/generations` — list current user's generations.
- `GET /api/generations/[id]` — poll a single generation (used by client for status updates).
- `GET /api/credits` — current credit balance.

### Admin (require admin cookie)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/admin/login` | Login (sets cookie) |
| DELETE | `/api/admin/login` | Logout |
| GET / POST | `/api/admin/avatars` | List / upload |
| PATCH / DELETE | `/api/admin/avatars/[id]` | Edit / remove |
| GET / POST | `/api/admin/avatar-categories` | List / create |
| DELETE | `/api/admin/avatar-categories/[id]` | Remove |
| GET / POST | `/api/admin/photoshoot-templates` | List (with prompt) / upload |
| PATCH / DELETE | `/api/admin/photoshoot-templates/[id]` | Edit (incl. prompt) / remove |
| GET / POST | `/api/admin/photoshoot-categories` | List / create |
| DELETE | `/api/admin/photoshoot-categories/[id]` | Remove |
| GET | `/api/admin/users` | User table |
| GET | `/api/admin/generations` | All generations |
| GET | `/api/admin/stats` | Dashboard counters |

### Webhooks
- `POST /api/webhooks/dodo` — payment provider callback (subscriptions, top-ups).
- `POST /api/webhooks/kie` — provider-specific.
- `POST /api/inngest` — Inngest function endpoint (auto-wired via Inngest SDK).

---

## 7. User dashboard

### Layout
`src/app/(app)/layout.tsx` — server component. Calls `getCurrentUser()`, redirects to `/login` if missing, then renders:
- `<Sidebar />` — fixed 252px on `lg+`. On mobile it's a slide-over drawer controlled by a zustand store (`useMobileNav`); a hamburger in the topbar toggles it; auto-closes on route change.
- `<TopBar />` — page title + credits chip + Upgrade CTA. Hides "Upgrade" label below `sm`.
- Main content padded `4 / 6 / 8` at sm/md/lg.

### Pages
| Path | Purpose |
|---|---|
| `/dashboard` | Overview: weekly chart, recent generations, popular characters (live from `/api/avatars`) |
| `/create/ugc` | 4-step wizard: pick avatar → script + voice → progress → result. Avatars from `/api/avatars`. Voices still hardcoded in `lib/data/voices.ts`. |
| `/create/product-ad` | 4-step wizard: pick avatar → script + product upload → progress → result. Product image and avatar both passed to the pipeline. |
| `/create/ai-photoshoot` | Single page: upload product, pick template (3 inline + "View N more" → modal library) **or** custom prompt, choose aspect, generate. |
| `/history` | List of past generations |
| `/credits`, `/billing` | Credit balance, top-up, subscription |
| `/profile`, `/support` | Self-explanatory |

### Library data flow

```
Admin uploads Avatar → POST /api/admin/avatars → R2 + DB
                                                     │
                          User dashboard hooks ──────┘
                          useAvatars()
                          GET /api/avatars
                          (omits inactive, omits prompt for templates)
```

`useAvatars()` and `usePhotoshootTemplates()` live in `src/lib/hooks/use-library.ts`. They each `fetch()` once on mount and return `{ items, categories, loading }`.

---

## 8. Admin panel

### Layout & gating
- `/admin/login` is the only public admin route.
- All other `/admin/*` routes live under the `(protected)` route group, which has its own layout that wraps children in `<AdminShell />` (sidebar + topbar). The login page sits **outside** `(protected)` so it doesn't render the shell.
- Middleware enforces the cookie before the request even reaches the layout.

### Pages
| Path | Purpose |
|---|---|
| `/admin` | Overview stats |
| `/admin/users` | User table |
| `/admin/generations` | All generations (filterable) |
| `/admin/avatars` | Upload avatars, assign categories, filter, delete. Modal also manages `AvatarCategory` records. |
| `/admin/photoshoot-templates` | Upload preview image + **server-only prompt**, edit, delete. Sister modal for `PhotoshootCategory`. |
| `/admin/revenue` | Revenue chart |
| `/admin/settings` | App-wide settings |

### Why prompts are server-only

`PhotoshootTemplate.prompt` is the secret sauce — the AI instruction that turns the generic template image into a real photoshoot. Exposing it would let competitors copy the recipe. Therefore:
- Public API (`GET /api/photoshoot-templates`) does `select: { id, name, imageUrl, categoryId }` — no prompt.
- The user only ever sends `templateId` to `/api/generate/mockup`.
- The route looks up the template via `prisma.photoshootTemplate.findUnique` and uses `.prompt` to build the AI request.

---

## 9. Generation pipeline

Triggered by API → Inngest event → `inngest/generate-video.ts` (a single function with a switch on `GenType`).

### Common pre-flight (in API route)
1. `requireUser()` checks the session.
2. Validate inputs (zod).
3. For Product Ad / Photoshoot: upload product image to R2.
4. Look up character or template from DB.
5. Atomic DB transaction:
   - Decrement `User.credits` (with a guard `WHERE credits >= cost` — a P2025 means insufficient credits).
   - Create `Generation` row (status `PENDING`).
   - Create `Transaction` row (negative `credits`, type `USAGE`).
6. `inngest.send({ name: "video.generate", data: { generationId } })`.
7. Return `{ id }` to client.

### Inngest function steps

**MOCKUP (AI Photoshoot)** — single fal.ai call:
1. `status: GENERATING_SCENE`
2. `generatePhotoshoot(productImage, prompt)` → composited image
3. Re-upload to R2
4. `status: COMPLETED`, write `compositeImageUrl` and `finalVideoUrl` (used as the result URL).

**UGC_AD** — character speaks the script:
1. `status: GENERATING_AUDIO` → ElevenLabs voice → R2
2. `status: GENERATING_VIDEO` → Kling 2.5 silent video from character image → R2
3. `status: SYNCING_LIPS` → LatentSync(audio + video) → R2
4. `status: COMPLETED`

**PRODUCT_AD** — same as UGC plus a scene composite:
1. `status: GENERATING_SCENE` → Flux Kontext composites product into character's hands → R2 (`compositeImageUrl`)
2. Then identical UGC path: audio → video → lipsync.

### Credit refund on failure
If any step throws, the function refunds credits via a final `tx`:
- `User.credits += cost`
- New `Transaction` row, type `REFUND`, status `COMPLETED`.
- `Generation.status = FAILED`, `errorMessage` populated.

### Client polling
Client `GET /api/generations/[id]` every ~1.5s while status isn't `COMPLETED` or `FAILED`. UI advances the visual progress checklist accordingly.

---

## 10. Credits

`src/lib/credits.ts`:
- All DB credit values are **tenths**: `10 = 1.0 credit`. Avoids float bugs.
- `COSTS` exposed in display credits, then converted via `toUnits` for DB.
- Current costs:

| Type | Credits |
|---|---|
| UGC Ad | 2.0 |
| Product Ad | 2.0 |
| AI Photoshoot | 0.1 |

- New users get a starting balance via Supabase trigger / Stripe-product mapping (see `lib/data/...` and `prisma/schema.prisma` defaults).

---

## 11. Mobile responsiveness

- Sidebar: fixed on `lg`, slide-over drawer on mobile (`useMobileNav` zustand store, hamburger in TopBar, backdrop, auto-close on navigation).
- Layout drops the `ml-[252px]` on mobile.
- AI Photoshoot stacks the two-column layout vertically; canvas aspect ratios cap by both `max-w` and `max-h` so portrait ratios fit the viewport.
- Sticky bottom action bar in UGC + Product Ad wizards.

---

## 12. Environment variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Supabase Postgres)
DATABASE_URL=                 # pgBouncer (pooler)
DIRECT_URL=                   # direct (used by Prisma migrate)

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=                # https://...r2.dev or custom domain

# AI
FAL_KEY=                      # fal.ai
ELEVENLABS_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Payments
DODO_API_KEY=
DODO_WEBHOOK_SECRET=

# Misc
NEXT_PUBLIC_APP_URL=          # used for fal.ai callbacks
ADMIN_PASSWORD=               # admin panel login
```

---

## 13. Deployment

Hosted on Vercel.

```bash
npx vercel --prod --yes
```

Env vars are managed via Vercel dashboard or CLI:
```bash
printf 'value' | npx vercel env add NAME production
```

(Use `printf` not `echo` — `echo` appends a newline that breaks signature checks.)

After a Prisma schema change:
```bash
npx prisma db push   # pushes to Supabase (no migration history)
```

---

## 14. End-to-end "what happens when…" examples

### A user clicks "Generate Photoshoot"
1. Browser → `POST /api/generate/mockup` (multipart: `productImage`, `templateId`).
2. API verifies session, uploads product to R2, looks up template (incl. **prompt**) from DB, atomically decrements credits, writes Generation + Transaction rows.
3. API enqueues `video.generate` event with the new `generationId`.
4. Inngest picks it up, calls fal.ai's photoshoot endpoint with the product URL + prompt.
5. fal returns a URL → we re-upload to R2 → update Generation row → status `COMPLETED`.
6. Client polling sees `COMPLETED` and shows the final image.

### An admin uploads a new template
1. Browser → `POST /api/admin/photoshoot-templates` (multipart: image + name + prompt + categoryId).
2. Middleware confirms `ugcads_admin` cookie is present.
3. Route handler calls `requireAdmin()` (HMAC re-verified).
4. Image uploaded to R2 under `photoshoot-templates/...`.
5. `PhotoshootTemplate` row created.
6. Admin UI re-fetches and shows the new tile.
7. **Next user** that visits AI Photoshoot triggers `useAvatars/usePhotoshootTemplates`, which `fetch()`s the public list — the new template appears with its image but **no prompt**.

### A user signs up
1. Supabase Auth creates the auth user.
2. First call to `getCurrentUser()` upserts a Prisma `User` row.
3. Default `credits` (from schema default or trigger) is set.
4. They land on `/dashboard`.

---

## 15. Things to watch out for

- **Never** add `prompt` to the public template selector. Adding `select: true` would leak it to every browser.
- **Never** trust client-supplied avatar/template IDs for image URLs — always look up server-side. Otherwise an attacker could spoof the URL.
- Credits are **tenths** in DB. `1` is not `1 credit`, it's `0.1 credit`.
- `prisma db push` skips migration history. If you ever need history, switch to `prisma migrate dev` and reconcile.
- Vercel env values must not have trailing newlines. `printf` not `echo`.
- The admin password is HMAC-keyed by the same `ADMIN_PASSWORD`. Changing the password invalidates all existing admin cookies (everyone is logged out).
