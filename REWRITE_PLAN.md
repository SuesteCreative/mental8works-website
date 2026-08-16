# Mental8Works — Frontend Rewrite + Custom Backoffice

## Context

The site (`SuesteCreative/mental8works-website`, hosted on Cloudflare Pages) works, but its architecture is fragile and its backoffice is a poor fit for a non-technical client.

**What prompted this:** The client (Alexandre) could not log into `/admin` because Decap CMS requires each editor to have a GitHub account with write access to the repo. That access has been restored (re-invited as collaborator), but it exposed the deeper problem: a psychology association's staff should never need GitHub accounts to edit a paragraph.

**Underlying problems the rewrite fixes:**
1. **Backoffice UX** — Decap's GitHub-OAuth login is opaque and breaks for non-devs.
2. **Fragile build** — [scripts/build.js](scripts/build.js) does regex string-replacement *into the committed HTML in place*, so source and build output are the same files. Any markup change can silently break an anchor-based `replace()`.
3. **Double rendering** — build-time regex injection AND a runtime script ([assets/js/cms-bridge.js](assets/js/cms-bridge.js)) both render the same `data/*.json`, fighting each other and causing content flashes.
4. **Cruft** — ~20 one-off `scripts/fix-*.js`, duplicate blog structures (`posts/x.html` + `posts/x/index.html`), committed `.psd`/`.txt` files.

**Intended outcome:** Same visual design, rebuilt on a clean component-based static architecture (Astro), with a purpose-built backoffice where the client logs in with a simple password and never touches GitHub. Content stays git-based; deploy stays `git push` → Cloudflare Pages.

## Decisions (confirmed with user)

- **Scope:** Rebuild the frontend architecture, keep the current look. New backoffice. No visual redesign.
- **Stack:** **Astro** static site generator. Kills the regex build + the runtime double-render. Vanilla CSS preserved. Deploys static to Cloudflare Pages.
- **Backoffice:** Custom admin — own login UI with **multiple admin accounts**. Admins invite other admins by email, each with their own hashed password, plus full password management (forgot / reset / change). A single server-held GitHub token commits content on every admin's behalf, so no admin ever needs a GitHub account.
- **Auth storage:** Cloudflare **D1** (SQLite) for the admin-user layer only — accounts, invites, reset tokens, sessions. **Content stays git-based** (unchanged); the DB never holds site content.
- **Email:** **Resend** for invites + password resets (decided). New Resend account to create and wire — verify `mental8works.pt` as sending domain (SPF/DKIM DNS records), generate `RESEND_API_KEY`. The admin UI also shows the generated link inline as a copy-paste fallback if a mail ever fails.
- **Constraints (unchanged):** Cloudflare Pages hosting, GitHub repo, no Netlify, no Tailwind. See [PROJECT_RULES.md](PROJECT_RULES.md) (update it to reflect the new build once done).

> **Timeline note:** the user-management system (invites, hashed passwords, reset flow, D1, email) adds ~3–4 days over a shared-password admin. Two weeks becomes tight. If needed, ship Week 1 (frontend) + a single-admin login first, then layer multi-user/invite/reset as a fast-follow — the DB schema below is designed for that so nothing is thrown away.

## Target Architecture

```
src/
  layouts/Layout.astro          ← single navbar+footer (replaces syncNavbar/syncFooter regex)
  pages/                        ← one .astro per route, reads from content collections
    index.astro, sobre-nos.astro, equipa.astro, socios.astro,
    agendamentos.astro, contactos.astro, blog/index.astro, blog/[slug].astro
  content/
    blog/*.md                   ← post body as real markdown + frontmatter
    authors/*.json, equipa/*.json
    config.ts                   ← zod schemas (typed, validated content)
  data/ (singletons)            home.json, about.json, appointments.json, socios.json, settings.json
  styles/                       ← port assets/css/styles.css, faqs.css unchanged
functions/api/admin/            ← Cloudflare Pages Functions (backoffice API)
  auth: login.js, logout.js, session.js
  users: invite.js, accept-invite.js, list.js, remove.js
  password: forgot.js, reset.js, change.js
  content: load.js, save.js, upload.js
  _lib/                         ← shared: jwt.js, hash.js, db.js, email.js, guard.js
public/admin/                   ← custom admin SPA (static, gated by login)
```

**Auth data model (Cloudflare D1):**
```sql
admins(       id, email UNIQUE, name, password_hash, role,        -- role: 'owner' | 'admin'
              status,           -- 'active' | 'invited' | 'disabled'
              created_at, last_login_at)
invites(      id, email, token_hash, invited_by, expires_at, accepted_at)   -- token expires ~72h
password_resets( id, admin_id, token_hash, expires_at, used_at)             -- token expires ~1h
sessions(     id, admin_id, token_hash, expires_at, created_at)             -- or stateless JWT; table lets us revoke
```
Passwords hashed with **PBKDF2-SHA256** via Web Crypto (`crypto.subtle`, available in the Workers runtime; per-user random salt, high iteration count). Invite/reset tokens are random, emailed in plaintext, stored only as a hash. First admin (owner) seeded via a one-off script/migration.

**Content flow (new):** Astro reads collections/data at build → renders static HTML. No runtime JSON fetch, no in-place mutation. `astro:assets` (sharp) handles image optimization at build, replacing [scripts/optimize-all-images.js](scripts/optimize-all-images.js).

**Backoffice flow:**
1. Client opens `/admin` → custom login form → `POST /api/admin/login` looks up the admin in D1, verifies the PBKDF2 hash, updates `last_login_at`, issues a signed (HMAC) JWT session cookie.
2. Admin UI reads current content via `GET /api/admin/load` (GitHub Contents API) and renders form editors per collection.
3. On save, `POST /api/admin/save` verifies the session, then uses **one** GitHub fine-grained PAT (env secret) to commit the updated `.json`/`.md` to the repo — commit message attributes the acting admin's name/email for audit. Image uploads (`/api/admin/upload`) commit raw files; Astro optimizes them on the next build.
4. Commit → Cloudflare Pages auto-rebuilds (Astro) → live in ~2–3 min. Same publish model the client already knows.

**User-management flows:**
- **Invite:** an admin submits an email → `invite.js` creates an `invites` row (hashed token, 72h expiry) and emails a signed accept link → invitee opens it → `accept-invite.js` validates the token, they set name + password → new `admins` row (`active`).
- **Forgot password:** submit email → `forgot.js` creates a `password_resets` row (hashed token, 1h expiry) and emails a reset link (always responds "email sent" to avoid account enumeration) → `reset.js` validates token, sets new hash, invalidates the token + existing sessions.
- **Change password:** logged-in admin submits old + new → `change.js` verifies old hash, writes new hash.
- **Manage:** owner-role admins can list/disable/remove other admins (`list.js`, `remove.js`); an admin can't remove the last owner.

Existing OAuth functions ([functions/api/auth.js](functions/api/auth.js), [functions/api/callback.js](functions/api/callback.js)) are deleted along with [admin/config.yml](admin/config.yml) and [admin/index.html](admin/index.html).

## Phased Plan (~2 weeks)

### Phase 0 — Prerequisite: Resend (do first, runs in parallel with Week 1)
Set this up before any email-dependent feature, and early enough that DNS propagates in time:
1. Create the Resend account.
2. Add `mental8works.pt` as a sending domain; publish the SPF + DKIM DNS records (Cloudflare DNS).
3. Wait for domain verification, generate `RESEND_API_KEY`, send a test email to confirm delivery (inbox, not spam).
4. Store `RESEND_API_KEY` as an encrypted Cloudflare env var.

Everything that sends mail (invites, password resets — Week 2 steps 10) is gated on this being green.

### Week 1 — Frontend on Astro (parity, same look)
1. **Scaffold** Astro project, wire Cloudflare Pages build (`astro build`, output `dist/`). Configure `build.format: 'file'` so URLs stay `…/x.html` where needed.
2. **Port CSS** verbatim ([assets/css/styles.css](assets/css/styles.css), [assets/css/faqs.css](assets/css/faqs.css)) and static assets into `public/`.
3. **Layout** — build `Layout.astro` with the current navbar/footer markup (from [scripts/build.js](scripts/build.js) `syncNavbar`/`syncFooter`), fed by `settings.json`.
4. **Content model** — define zod schemas in `content/config.ts`; migrate `data/*.json`:
   - Blog: convert each `data/blog/*.json` (`body` markdown string) → `src/content/blog/*.md` with frontmatter.
   - `authors/`, `equipa/` → data collections.
   - Singletons (home/about/appointments/socios/settings) → `src/data/*.json`.
5. **Rebuild pages** one-to-one from the current HTML, reading from collections. Reuse existing markup so the look is identical. Delete `cms-bridge.js` behavior (now build-time only).
6. **SEO parity** — preserve every JSON-LD block, meta, hreflang, `robots.txt`, `_headers`. Generate `sitemap.xml` (`@astrojs/sitemap`). **Add `_redirects`** mapping any changed URLs (esp. blog post paths) to preserve rankings.
7. Deploy to a **preview branch**, diff against production visually + Lighthouse. Do not touch `/admin` yet.

### Week 2 — Custom Backoffice + cutover
8. **Data + shared lib** — provision D1, run the schema migration, seed the first owner admin. Build `_lib/`: `hash.js` (PBKDF2), `jwt.js` (HMAC sign/verify), `db.js` (D1 helpers), `email.js` (Resend send — assumes Phase 0 done — with invite/reset HTML templates, returns the link so the UI can show a copy-paste fallback), `guard.js` (session + role check used by every protected route).
9. **Auth + session** — `login.js`, `logout.js`, `session.js`. Sign JWT with `ADMIN_JWT_SECRET`, set `HttpOnly; Secure; SameSite=Strict` cookie. `guard.js` rejects unauthenticated/expired requests on every admin API call.
10. **User management** — `invite.js`, `accept-invite.js`, `list.js`, `remove.js` (owner-role gated), and password flows `forgot.js` / `reset.js` / `change.js`. Rate-limit login + forgot to blunt brute force.
11. **Content API** — `load.js` (read files via GitHub Contents API), `save.js` (commit via single `GITHUB_CONTENT_TOKEN` fine-grained PAT, contents:write only, admin attributed in commit message), `upload.js` (commit images).
12. **Admin UI** (`public/admin/`) — login + forgot/reset/accept-invite screens, a **Users** panel (list, invite, remove, change-my-password), and content editors for every current field, in priority order of what the client edits:
    - Blog (markdown editor + featured image + author relation) — highest use.
    - Team/Equipa (name, role, photo, LinkedIn, bio list).
    - Pages (home/about/appointments/socios nested objects + FAQ list) and Settings.
    - Reuse a small set of widgets (text, textarea, markdown, image-upload, list, object, relation) so each collection is a config, not bespoke code.
13. **Image handling** — compress client-side (canvas) before upload to keep commits small; Astro re-optimizes at build.
14. **Test** end-to-end (see Verification), **set Cloudflare env vars/secrets + D1 binding + email API key**, remove Decap + OAuth functions, update `PROJECT_RULES.md`, cut over.

## Files removed / replaced
- Delete: [admin/](admin/), [functions/api/auth.js](functions/api/auth.js), [functions/api/callback.js](functions/api/callback.js), [assets/js/cms-bridge.js](assets/js/cms-bridge.js), all `scripts/fix-*.js`, [scripts/build.js](scripts/build.js) (replaced by Astro), duplicate/loose blog files (`.psd`, `.txt`, dual `posts/x.html`+`posts/x/index.html`).
- Replaced: `data/*.json` → Astro collections + `src/data`; hand-authored per-folder `index.html` → `src/pages/*.astro`.

## Key Risks
- **Scope vs. 2 weeks** — user management (D1 + invites + reset + email) is the schedule risk. Fallback: ship frontend + single seeded owner login first, add invite/reset as a fast-follow (schema already supports it). Decide at end of Week 1.
- **Auth security correctness** — this is now a real auth system. Non-negotiables: PBKDF2 with per-user salt + high iterations, tokens stored only as hashes with short expiry, no account enumeration on forgot-password, rate-limiting on login/forgot, session invalidation on password reset, owner can't be orphaned. Get these reviewed (`/security-review`) before cutover.
- **Admin editor parity** is the other bulk of Week 2. Nested page objects, the FAQ list, and the author-relation widget are the fiddly parts — descope rarely-edited page fields to "phase 2" if time is tight (client mainly edits blog + team + contacts).
- **URL preservation** — get `_redirects` right before cutover or lose SEO. Verify old `sitemap.xml` URLs still resolve.
- **Cloudflare Functions + Astro + D1 coexistence** — root `functions/` served by Pages alongside static Astro output, D1 bound to the Pages project; confirm on the preview deploy early.
- **Email deliverability** — verify the sending domain (SPF/DKIM) so invite/reset mails don't land in spam.
- **Secrets** — `ADMIN_JWT_SECRET`, `GITHUB_CONTENT_TOKEN`, `RESEND_API_KEY` as encrypted Cloudflare env vars, never committed. GitHub token is fine-grained, single-repo, contents-write only.

## Verification
- **Local:** `astro dev` + `astro build && astro preview`; walk every page, compare to production screenshots; run Lighthouse (match/beat current perf/SEO scores).
- **Content:** edit a blog post, a team member, and a contact setting in the new admin locally → confirm the committed file changes and the rebuilt page reflects them.
- **Backoffice on preview deploy:** log in as the seeded owner (no GitHub prompt), edit + save + upload an image, confirm a commit lands and Pages rebuilds with the change live. Confirm an unauthenticated request to `/api/admin/save` is rejected.
- **User management:** owner invites a second admin by email → invite mail arrives → accept link sets a password → second admin logs in and can edit. Run forgot-password → reset mail → set new password → old sessions rejected. Confirm expired/invalid invite + reset tokens fail, and the last owner can't be removed.
- **URLs/SEO:** crawl old sitemap URLs against the preview → all resolve (directly or via `_redirects`).
- **Cutover:** point production at the new branch, re-run the same checks on the live domain, keep the old branch for instant rollback.
