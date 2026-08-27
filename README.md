# Intelligent Flow — Canonical Demo Console

The pre-sales demo application for **Avenga Intelligent Flow**, the governed,
AI-native engineering operating system. Built to PRD v5 (`v1.2-PRD-Sovereign-Audit`).

This is a **canned demo**: every state transition executes live on screen, with no
video playback and no backend dependency. It is designed to be driven by a
pre-sales engineer in front of a client, with the presenter holding full control
over pace and narrative.

---

## Running it

```bash
npm install
npm run demo        # opens http://localhost:5173
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck and production bundle to `dist/` |
| `npm run preview` | Serve the production bundle |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run simulate` | Headless state engine — writes a signed Evidence Pack to disk |

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

**Colour.** The Trust Accent Spectrum is defined once in `tailwind.config.js` and
consumed through `src/components/ui/tone.ts`; no component hand-picks a hex.
Chart marks are stepped one notch from the UI chrome hexes so they clear the
contrast and colour-vision-deficiency thresholds against the dark chart surface —
see the note in `src/components/ui/chartTokens.ts`.

---

## Terminology

The demo uses the canonical vocabulary throughout: **Audit Vulnerability** (never
"exposure"), **Mandate**, **Evidence Pack**, **RBAC Personas**.
