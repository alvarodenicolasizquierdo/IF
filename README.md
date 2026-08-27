# Intelligent Flow — Canonical Demo Console

The pre-sales demo application for **Avenga Intelligent Flow**, the governed,
AI-native engineering operating system. Built to PRD v5 (`v1.2-PRD-Sovereign-Audit`).

This is a **canned demo**: every state transition executes live on screen, with no
video playback and no backend dependency. It is designed to be driven by a
pre-sales engineer in front of a client, with the presenter holding full control
over pace and narrative.

---

## Running it

Three ways, depending on how much you want to install.

**1 — Hosted.** CI typechecks, builds, verifies the Evidence Pack signer and
drives the full presenter walkthrough on every pull request; a push to `main`
then deploys to GitHub Pages. The site also serves
`intelligent-flow-console.html`, a single self-contained file you can download
and keep.

> First time only: in the repository, **Settings → Pages → Build and deployment
> → Source**, choose **GitHub Actions**. The workflow does the rest.

### Putting it on your own domain, safely

Use a **subdomain**. It leaves the apex record — and whatever site already
answers there — completely untouched.

1. **DNS**, at whoever hosts the zone: add one `CNAME` record.

   | Type | Name | Value |
   |---|---|---|
   | `CNAME` | `flow` | `<your-github-user>.github.io.` |

   That creates `flow.yourdomain.com`. Do **not** add or change `A`, `ALIAS`
   or `ANAME` records on the apex — those are what serve your existing site,
   and repointing them is what takes a site down.

2. **Repository → Settings → Pages → Custom domain**: enter the same
   `flow.yourdomain.com` and save, then tick **Enforce HTTPS**. Save it even
   if the DNS check complains — see the note below.

3. Nothing. The workflow writes the `CNAME` file into every build already —
   it defaults to `flow.alvarodenicolas.com`. To publish under a different
   domain, set the repository variable `PAGES_CUSTOM_DOMAIN`
   (**Settings → Secrets and variables → Actions → Variables**) to that
   hostname; set it to `none` to stay on `github.io`.

That third step used to be manual and was easy to miss, which broke the domain
on the first deploy: with Actions-based Pages the published artifact replaces
the site wholesale, so a domain entered only in Settings is dropped the moment
a build ships without a `CNAME` in it.

**If the Pages settings page says `InvalidDNSError`:** check whether the record
actually resolves before touching it — `dig +short flow.yourdomain.com` should
answer `<user>.github.io.` followed by the four `185.199.x.153` addresses. When
it does, the banner is GitHub's own check lagging behind a freshly-added record
and it clears on its own; changing DNS at that point only makes things worse.
The banner does not block the deploy.

**2 — One file, no install.** Download `intelligent-flow-console.html` from the
Pages site (or build it with `npm run build:standalone`) and open it in any
browser. Everything — JS, CSS, fonts, brand marks — is inlined, so it runs from
a USB stick on a plane. `npm run test:standalone` proves it makes zero network
requests.

**3 — From source.**

```bash
npm install
npm run demo        # opens http://localhost:5173
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck and production bundle to `dist/` |
| `npm run build:standalone` | Single self-contained `dist-standalone/index.html` |
| `npm run preview` | Serve the production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run simulate` | Headless state engine — writes a signed Evidence Pack to disk |
| `npm run test:hash` | Verify the Evidence Pack signer against `node:crypto` |
| `npm run test:smoke` | Playwright walkthrough of the presenter narrative |
| `npm run test:layout` | Measure every screen and overlay at 1280×720, 1440×790 and 1680×1000 |
| `npm run test:standalone` | Prove the single-file build runs with the network cut off |

Fonts are self-hosted, so the console runs correctly offline or behind a client
guest network that blocks CDNs.

### Container

```bash
docker build -t intelligent-flow-demo .
docker run --rm -p 5173:5173 intelligent-flow-demo
```

---

## Driving the demo

### The presenter "God Mode" panel

Press the **backtick key (`` ` ``)** anywhere to toggle the floating presenter
panel, or click the crown in the bottom-right corner. It is hidden by default so
the client never sees it.

It gives you:

- **Phase jumper** — leap straight into any of the five phases
- **Track switcher** — Track 1 / Track 1.5 / Track 2
- **RBAC persona override** — Lead FDE, bounded AI Agent, CISO approver
- **Instant proofs** — regulatory assessment, code drift injection, sovereign model swap
- **Demolition matrix** — one click arms a competitor counter-position, shows you
  the script, then fires the live proof on screen

### The five screens

| Screen | Phase | What it proves |
|---|---|---|
| Executive Trust Dashboard | Improve / overview | A-UPI measures outcomes, and TCO per COSMIC Function Point falls €1,200 → €180 |
| Context Assembly & the Mandate | Discover → Decide | Context is governed before an agent starts; the Mandate is a cryptographic hall-pass, not a master key |
| Grounded Execution | Build | Every tool-call is intercepted and schema-validated at the MCP Gateway; the Evidence Pack compiles live |
| Aviation-style HITL Gate | Operate | Irreversible actions hard-stop until a named, OIDC-verified human signs |
| Continuous Evolution | Improve | The loop that stops post-deployment software decay |
| Regulatory Exposure Assessment | Overlay | EU AI Act Art. 14/15, DORA 8–9 and GDPR all fail on an ungoverned pipeline — until the Control Plane is enforced |

### The two commercial hooks

**The Golden Bridge.** On *Context Assembly*, run the **Context Integrity &
Classification Probe**. It surfaces a stale tax schema (freshness decayed to 62%)
and an unclassified billing extract, and the control plane refuses to issue a
Mandate against them. That refusal is the opening for Avenga Intelligence: you
cannot have safe agents writing code without a governed data foundation.

**The Regulatory Shock.** Press **Enforce regulation**. The scan always assesses
the client's *current, ungoverned* pipeline — four open audit vulnerabilities —
regardless of which track is on screen. **Enforce control plane** flips every
verdict and moves the console to Track 2.

---

## Pre-meeting customisation

Edit `src/data/scenario.ts` → `CLIENT_CONTEXT` to re-skin the demo for the client
in the room (client name, work item, SCM connector, target file). Track metrics and
Way-of-Working narratives live in `src/data/tracks.ts`.

The headless simulator reads `context-store/current-context.json`, which it
creates on first run and never overwrites — so a customised context survives
repeated runs.

---

## Architecture

```
src/
├── data/          Scenario and track mock data (PRD v5 §5, §8)
├── store/         Zustand state machine — the single narrative spine
├── lib/           Pure-JS SHA-256 for Evidence Pack signing
├── types/         Canonical domain vocabulary
└── components/
    ├── shell/     Phase banner, identity console, action tray, audit log
    ├── screens/   The four workspace screens
    ├── overlays/  HITL gate, regulatory scan, Avenga Intelligence, exploit briefings
    ├── presenter/ God Mode panel
    └── ui/        Design-system primitives and the Trust Accent Spectrum
```

**State.** One Zustand store owns `activeTrack`, `activePhase`, `activePersona`
and `presenterMode`, plus the Mandate, Evidence Pack and overlay state. Phase
transitions rebind the RBAC persona automatically under Track 2 — Build runs as a
bounded non-human identity, Operate as the CISO who can sign.

**Signing.** Evidence Packs are signed with a real SHA-256 over the pack payload.
The implementation is pure JS rather than `crypto.subtle` because a demo laptop on
a client's plain-http LAN address is not a secure context, and the signing
ceremony must never degrade mid-pitch. Verified against `node:crypto`:

```bash
node src/lib/sha256.test.mjs
```

**Colour.** Rooted in the Avenga brand book. The ground is **Premium Purple
`#2C1847`** — the brand's own colour for large solid backgrounds — with
**Visionary White**, **Trustful Beige** and **Compassionate Lavender** carrying
text and **Creative Red `#DD2C00`** carrying both the mark and the
policy-violation semantic. Emerald (passed) and Amber (HITL) are functional
additions; the brand book defines no status colours, and a governance console
cannot work without them.

Tokens live once in `tailwind.config.js` and are consumed through
`src/components/ui/tone.ts`; no component hand-picks a hex. Two plotted marks
are stepped from the chrome so they clear contrast and colour-vision-deficiency
thresholds on the purple surface — see the note in
`src/components/ui/chartTokens.ts`.

**Type.** Manrope and Instrument Serif stand in for Avenga's licensed Haffer and
Reckless. Swap both in `tailwind.config.js` and `src/main.tsx` once the web
licences are available.

The visual direction is explorable as a design canvas:
<https://claude.ai/code/artifact/d748fc67-fac1-48fd-9b78-6c694010fd6c>

---

## Terminology

The demo uses the canonical vocabulary throughout: **Audit Vulnerability** (never
"exposure"), **Mandate**, **Evidence Pack**, **RBAC Personas**.
