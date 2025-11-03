# 🗺️ PhantomSPA Roadmap

PhantomSPA is built in **phases**: each one is small, testable, and focused.
The kernel stays **minimal** while features are added in layers.

👉 This document expands on the **high-level roadmap in [README.md](./README.md)** with **detailed goals, deliverables, and acceptance criteria**.

---

## Phase 0 — Foundations (Project setup & governance)

**Goals**

* Repo structure: `/js/core`, `/js/utils`, `/js/renderers`, `/data`, `/examples`, `/docs`, `/site`.
* Tooling: ESLint, Prettier, commit lint, changelog automation.
* Docs: CONTRIBUTING.md, CODE\_OF\_CONDUCT.md, SECURITY.md.
* Versioning: SemVer.

**Acceptance**

* `npm test` runs green.
* One ADR (architectural decision record) committed.

---

## Phase 1 — MVP Kernel (v0.1)

**Deliverables**

* Config resolution (`window.SPA_CONFIG`, `data-config`, `data-*`).
* Routing (segment-based).
* HTML shell injection.
* CSS attach/detach.
* Data fetch + JSON cache.
* Renderer import + lifecycle (`render`, `unmount`).
* Link interception + `popstate`.

**Acceptance**

* Example routes render correctly on a static server.
* Back/forward navigation works.

---

## Phase 2 — Prefetch & Performance (v0.2)

**Deliverables**

* Generic prefetcher (priorities, concurrency cap, idle scheduling).
* Module warm-up + route-level CSS cleanup.
* Timing logs for measurement.

**Acceptance**

* Prefetch order respects priorities.
* Navigation remains stable under load.

---

## Phase 3 — DX & Testing (v0.3)

**Deliverables**

* Test harness: headless route runner with DOM snapshots.
* Renderer contract validator (dev-only).
* Playground `/dev/` with hot reload.
* JSON Schema validation for `app-config.json` + `nav.json`.

**Acceptance**

* CI runs unit, integration, and snapshot tests.
* Invalid config fails schema validation with clear error.

---

## Phase 4 — Lifecycle & Plugins (v0.4)

**Deliverables**

* Lifecycle events: `onInit`, `onBeforeRoute`, `onRoute`, `onAfterRoute`.
* Plugin API with ordered execution + error isolation.
* Renderer context with `{ config, route, nav, fetchJSON, applyRouteCSS, events }`.

**Acceptance**

* Example plugin (analytics) works.
* Renderer can consume context without globals.

---

## Phase 5 — Routing Extensions (v0.5)

**Deliverables**

* Hash routing toggle.
* Dynamic params (`/user/:id`) with param parsing.
* Route guards/middleware.
* Scroll restoration.
* Fallback 404 renderer.

**Acceptance**

* Examples cover dynamic params, guards, and 404 fallback.
* Scroll restore verified.

---

## Phase 6 — Multi-Root & Isolation (v0.6)

**Deliverables**

* Config supports multiple roots (`#main`, `#sidebar`).
* Optional Shadow DOM per root.
* Route-level LRU cache for DOM/data.

**Acceptance**

* Demo app with main + sidebar.
* Shadow DOM toggle works.
* Back/forward nav benefits from caching.

---

## Phase 7 — Security Hardening (v0.7)

**Deliverables**

* Trusted HTML contract documented.
* CSP guidance + safe defaults.
* Escape utilities fuzz-tested.
* Optional sandbox loaders (iframe/realm).
* Safe error messages.

**Acceptance**

* Security checklist passes.
* Bad inputs handled gracefully.

---

## Phase 8 — Telemetry & Devtools (v0.8)

**Deliverables**

* Telemetry hooks: route timings, cache hits, prefetch stats.
* In-page Dev Panel (dev-only).
* Logger with levels + `?debug`.

**Acceptance**

* Dev Panel shows live state.
* Example telemetry beacon works.

---

## Phase 9 — CLI & Scaffolding (v0.9)

**Deliverables**

* `phantom` CLI with: `init`, `add route`, `add renderer`, `check`, `test`.
* Prebuilt templates: minimal/blog/docs/marketing.
* Preflight checker: scans for missing assets/renderers/CSS.

**Acceptance**

* New project bootstrapped via CLI.
* `phantom check` reports real issues.

---

## Phase 10 — Docs & Examples (v1.0)

**Deliverables**

* Polished docs site with guides, API, recipes, FAQ.
* Example gallery: docs site, marketing site, dashboard, i18n.
* Stable APIs frozen + deprecation policy.

**Acceptance**

* A new user can build a site by following docs, with no external help.

---

## Cross-Cutting Concerns

* **Accessibility**: focus management, ARIA roles in renderers.
* **Internationalization**: locale-specific `nav.json` support.
* **Browser policy**: evergreen + selective polyfills.
* **Size budget**: monitor core size with each PR.
* **Definition of Done**: tests + docs + examples + changelog.

---

## Risks & Mitigations

* **Name collisions**: reserve npm + GitHub early.
* **Scope creep**: push features into plugins.
* **Renderer trust**: sandbox & CSP.
* **Config sprawl**: enforce schema + preflight.

---

## Success Metrics

* Time-to-first-route (TTFR).
* Navigation latency (p50/p95).
* Prefetch usefulness (% hits).
* Core size trend.
* Onboarding success (measured via docs feedback/issues).

---

## Roles

* **CTC (Central Task Controller)** — triage, sequencing, enforcement.
* **PMA (Project Management Agent)** — milestones, tasks, comms.
* **FEDA/BEDA** — core development, kernel, utils.
* **QAA** — testing, CI, schema validation.
* **DOA** — releases, deploys, changelogs.

---
