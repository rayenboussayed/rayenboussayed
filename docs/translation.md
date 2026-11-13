# Translation pipeline

Client-side, one-way **English → target language** translation of the site's own
content. English is the source of truth (`src/lib/content.ts`); non-English
visitors get a translated copy in React state only. Nothing is translated
server-side, no user input is sent anywhere, and no language-specific static
copy exists.

Relevant files:

| Concern | File |
| --- | --- |
| Chain, breaker, output guard | `src/lib/translation/chain.ts` |
| On-device Chrome tier | `src/lib/translation/backends/chrome.ts` |
| On-device bergamot tier | `src/lib/translation/backends/bergamot.ts` |
| Free remote tiers | `src/lib/translation/backends/remote.ts` |
| bergamot engine + integrity | `src/lib/translation/bergamot.ts` |
| Model catalog | `src/lib/translation/bergamot-catalog.ts` |
| Persistent cache | `src/lib/translation/cache.ts` |
| Degenerate-output guard | `src/lib/translation/guard.ts` |
| Language registry | `src/lib/translation/languages.ts` |
| Key/string exclusions | `src/lib/translation/translatable.ts` |
| Content walker | `src/lib/translation/translate-content.ts` |
| UI state, cache gate | `src/context/TranslationContext.tsx` |
| Worker + comlink client | `src/workers/translation.worker.ts`, `src/lib/translation/client.ts` |

## 1. Overview and chain order

`TranslationContext` checks IndexedDB first. On a miss it calls
`chain.init(lang)` (warm up the first usable on-device tier), then walks the
English content object with `translateContent`, which:

1. walks every translatable string, skipping excluded keys/values
   (`translatable.ts`) and de-duplicating identical strings,
2. sends **chunks of 16 unique strings** to `chain.translate`,
3. re-applies translations by exact-string map, keeping object shape and key
   order, and substitutes the source string for any degenerate result.

`TranslationChainService` tries the tiers in a fixed order. A tier may return
`null` for individual slots (the slot moves on), or throw (the whole batch for
that tier failed).

```
 English content (src/lib/content.ts)
            │
            ▼
 ┌──────────────────────┐
 │ [0] IndexedDB cache  │  key: lang:v5:hash(EnglishContent)
 └──────────┬───────────┘
            │ miss
            ▼
 ┌──────────────────────┐
 │ [1] chrome           │  on-device, main thread
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [2] bergamot         │  on-device, dedicated Worker
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [3] remote-google    │  translate_a/t, client=dict-chrome-ex
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [4] remote-mozhi-1   │  mozhi.aryak.me
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [5] remote-mozhi-2   │  translate.projectsegfau.lt
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [6] remote-mymemory  │  api.mymemory.translated.net
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐
 │ [7] English merge    │  unresolved slots keep source text
 └──────────────────────┘
```

The cache is outside the chain: it is read and written by
`TranslationContext`, and a hit bypasses every tier.

Chain contract:

- `isAvailable(lang)` must resolve `false`, never throw. Results are cached per
  `backendId:lang`: positive verdicts for the session, negative verdicts for
  60 s, rejected probes not at all (map capped at 64 entries).
- `translate(texts, lang)` must return exactly `texts.length` entries in the same
  order; `null` means "leave this slot for the next tier"; a throw means the
  batch failed.
- Circuit breaker, per backend: 3 consecutive batch failures open it for 60 s,
  then a single half-open probe is allowed. A success resets the counter. A batch
  in which every string is rejected/skipped counts as a failure too, so a
  silently-dead backend opens instead of being retried forever. Availability
  checks and chain skips are not failures. A backend call has a 20 s timeout;
  remote tiers are skipped entirely when `navigator.onLine === false`.
- Output acceptance per slot (`isAcceptableTranslation` in `guard.ts`):
  non-empty, no `<` or `>`, not degenerate per the same module. Identical
  strings are accepted only for short whitespace-free tokens (brands like
  "RYNBSD"); a backend that echoes a long sentence is treated as failed.
- `init()` calls are serialized — concurrent warmups for two languages cannot
  double-download a model in one session. Failure of one warmable backend falls
  through to the next.
- `degraded` is counted run-wide by `translateContent` and returned as
  `{ content, degraded }` — never by the last chunk alone. The context gates
  the cache write on it (see §5).
- Everything above runs on the main thread. Chrome's Translator API is not
  exposed in Web Workers; only bergamot runs off-thread.

## 2. Tier semantics

| id | Source | Runs in | Availability rule | Timeout | What leaves the device |
| --- | --- | --- | --- | --- | --- |
| `cache` (stage 0) | IndexedDB `rynbsd-translation` / `translations` | window (main thread) | key `${lang}:v5:${hashContent(EnglishContent)}` exists and entry `lang`/`hash` match | none (IndexedDB await) | nothing |
| `chrome` | Browser built-in Translator API (Chrome ≥138, Edge ≥148) | window only, main thread | `Translator` object exists **and** `Translator.availability({sourceLanguage:'en', targetLanguage})` ∈ `available` \| `downloadable` \| `downloading`; `null`/`unavailable`/throw → false | none in code; awaits UA session creation | nothing |
| `bergamot` | Mozilla Firefox Translations models via `@mkljczk/bergamot-translator` | dedicated module Worker (comlink) | static: `BERGAMOT_PAIRS` contains the language | none; `downloadTimeout: 0`, model fetch awaited | no site text; only model-file requests to `huggingface.co` |
| `remote-google` | `translate.googleapis.com/translate_a/t` | window (`fetch`) | always (`Promise.resolve(true)`) | 8 s per POST (20 strings) | site copy ≈3 KB + target code |
| `remote-mozhi-1` | `mozhi.aryak.me/api/translate` | window (`fetch`) | always | 8 s per string, 20 s wall per batch, concurrency 5 | site copy ≈3 KB + target code |
| `remote-mozhi-2` | `translate.projectsegfau.lt/api/translate` | window (`fetch`) | always | 8 s per string, 20 s wall per batch, concurrency 5 | site copy ≈3 KB + target code |
| `remote-mymemory` | `api.mymemory.translated.net/get` | window (`fetch`) | always | 10 s per request, 20 s wall per batch, concurrency 4 | site copy ≈3 KB + target code; strings > 450 bytes are skipped locally |
| English (stage 7) | source strings | window (main thread) | always | none | nothing |

Remote batching details: Google sends one form-encoded POST per 20 strings;
Mozhi sends one POST per string; MyMemory sends one GET per string and does not
send strings over 450 bytes. Mozhi/MyMemory throw for the whole tier when at
least 3 strings were attempted and a strict majority came back empty, so the
breaker can open on a dead host.

## 3. Excluded tiers

Each was rejected for a concrete, verified reason, not taste:

- **Lingva** — dead at verification time (2026-11): no public instance tested
  was reachable; a keyless chain cannot depend on it.
- **LibreTranslate** — public instances require an API key or reject anonymous
  requests; the project allows no keys anywhere.
- **hostux** — truncates longer inputs, so the returned text cannot be aligned
  string-for-string with the request.
- **Google `client=gtx`** — returns 429 from datacenter IPs; `dict-chrome-ex` is
  used instead (`remote.ts:130`).
- **Google `/translate_a/single`** — deliberately unused: nested response shape
  tied to the rate-limited `gtx` client (`remote.ts:15`).
- **Apertium** — narrow en→X pair coverage, not the 19-language set the site
  advertises; a tier that silently misses most languages is worse than none.

## 4. Integrity and security

- **Model integrity, fail closed.** Every catalog file carries a sha256. After
  download, `bergamot.ts` requires `crypto.subtle` (throws if absent), hashes the
  gzip bytes, and rejects a mismatch. Unverified bytes are never handed to the
  engine.
- **Content-type guards.** Every remote response must be `application/json`
  (`IntegrityFailure` otherwise), and HTTP non-2xx throws. Google's response must
  be an array (length mapped to the request); MyMemory checks
  `String(responseStatus) === '200'` and rejects `quotaFinished`, because it
  returns HTTP 200 with error payloads.
- **Markup rejection.** `isAcceptableTranslation` rejects any candidate
  containing `<` or `>`, on top of the degenerate-output checks. A hostile or
  compromised endpoint cannot inject markup into the DOM.
- **JSON-LD escaping.** `Seo.tsx` serializes the profile JSON-LD with
  `.replace(/</g, '\\u003c')`, so a translated role/location cannot close the
  `<script type="application/ld+json">` block. `translatable.ts` also filters
  out non-content keys and value patterns, so URLs, e-mails, ids, dates, routes
  and proper names are never sent.
- **Cache honesty gate.** `translateContent` returns the run-wide count of
  strings that fell back to English; `TranslationContext` persists a run only
  when `degraded <= 2` — at most two English-fallback strings. Larger
  degradation is treated as a failed translation and not cached.
- **Provenance.** Cached entries store `providers` (backend ids that produced
  at least one accepted string, e.g. `["bergamot"]`) and `degraded` for
  diagnostics; older entries without them remain valid.
- **Privacy at the edge.** Remote fetches use `credentials: 'omit'` and
  `referrerPolicy: 'no-referrer'`. bergamot model fetches use
  `credentials: 'omit'`. There are no API keys, accounts, cookies or telemetry in
  any tier; remote tiers receive only the site's public copy (~3 KB), never user
  input.
- **No user data path.** The site has no free-text forms that feed translation;
  translation input is the static content module.

## 5. Cache

`src/lib/translation/cache.ts`, database `rynbsd-translation`, object store
`translations`, `keyPath: 'key'`.

- `CACHE_VERSION = 5`. Keys are `${lang}:v${CACHE_VERSION}:${hash}`, where
  `hash` is a DJB2-style 32-bit hash of `JSON.stringify(EnglishContent)`,
  base-36 encoded. Reads also compare the stored `lang` and `hash` fields.
- A cache read failure (private mode, blocked IDB) returns `null`; a write
  failure is swallowed. Translation proceeds normally.
- A **poisoned** entry is a cached payload that was written while most strings
  had silently fallen back to English. It would replay forever as if it were a
  translation, because a cache hit never invokes the chain. The
  `degraded <= 2` gate exists to stop new poisoning; bumping `CACHE_VERSION`
  makes existing entries unreachable.
- Invalidation policy: bump `CACHE_VERSION` whenever the pipeline output could
  change — decoder/model options, the output guard, the content schema, the
  translation direction, cache payload shape. On open, `getDb()` purges keys
  whose embedded version differs from the current `CACHE_VERSION`
  (fire-and-forget, best effort), so stale generations never accumulate.
- Content edits invalidate naturally: a changed `EnglishContent` yields a new
  hash and therefore a new key.
- A warm cache hit performs no availability probes, no model download and no
  network request; it deserializes the stored `SiteContent`. The owner-reported
  local measurement for a warm-cache reload is ~2 s, dominated by app startup
  and render, not translation — treat that as an observation, not a tested
  bound.

## 6. Failure UX

- Tier failure is silent by design. The pipeline always terminates with English
  text in unresolved slots; it never rejects for backend failure.
- One aggregated warning is emitted per `chain.translate` call, and only when
  some strings actually remain English:
  `[translation] N string(s) served in English (declined/failed: <ids>)`.
  Per-string remote failures do not log individually.
- The language selector remains enabled during every status (`detecting`,
  `downloading`, `translating`). It shows `Translating… <n>%` in an
  `aria-live="polite"` span and can be changed mid-run; `runIdRef` discards
  results from superseded runs (their chunk callback returns `null` slots
  without calling the chain), and the effect cleanup increments `runIdRef` so
  even a mid-run preference change cannot apply stale results.
- Progress: `init` reports `download` fractions (Chrome download progress or
  bergamot bytes loaded/total) and then `ready`; `translateContent` reports
  `done/total` unique strings per 16-string chunk.
- A cache-hit run goes `detecting → ready` with no progress.
- If the pipeline throws unexpectedly (programming error, walker failure — never
  a backend is down), the context logs `Translation failed`, serves English, and
  sets `status: 'error'`. The selector remains usable; picking a language again
  re-runs the pipeline.

## 7. Operations / runbook

### Local testing

```bash
npm run dev          # predev copies bergamot worker files to public/bergamot/
npm run typecheck
npm run test:unit    # unit project (72 tests)
npm test             # 78 tests: 72 unit + 6 integration
npm run build        # includes scripts/prepare-bergamot.mjs in prebuild
npm run preview      # PWA/offline behavior is only valid in preview
npm run test:e2e     # Playwright boots preview on 127.0.0.1:4180 (build first)
```

Manual checks:

1. Open the dev server, pick a language in the nav selector.
2. DevTools → Network: expect a Hugging Face model fetch (bergamot) or no
   request at all (Chrome tier), then optionally the remote hosts. A warm cache
   shows none of those.
3. DevTools → Application → IndexedDB → `rynbsd-translation` → `translations`
   to inspect or delete entries. To force a full retranslation:
   `indexedDB.deleteDatabase('rynbsd-translation')`, then reload.
4. Console: tier failures are swallowed by design, so expect only the aggregated
   `[translation] … served in English …` warning; bergamot's per-string recovery
   logs `[bergamot] translate failed`. A model hash mismatch or non-JSON response
   will not name itself in the console — diagnose with the Network panel, or
   reproduce the validation in the unit tests.
5. `npm run test:e2e` also asserts the English cold-boot contract: no
   `worker`/`.onnx`/`huggingface` request, one canvas, zero page errors
   (`e2e/boot.spec.ts`). This assumes an English browser locale.

### Adding a language

1. Add a `BergamotPair` to `BERGAMOT_PAIRS` in `bergamot-catalog.ts`: `pair`
   (`en<code>`), `lang`, `tier` (`base-memory` or `tiny`), and per file
   `logical` name, `name`, byte `size`, `sha256`, and mirrored `url`. Base
   models use `model`/`lex`/`vocab`; zh/ja use `srcvocab` + `trgvocab` instead
   of `vocab`. Sizes drive the progress total; hashes are mandatory in practice
   (fail-closed verification).
2. Add a `Language` to `SUPPORTED_LANGUAGES` in `languages.ts` (`code`, `name`,
   `nativeName`, optional `rtl`). The selector and persister derive from this
   list; no component change is needed. Keep the catalog and this list in sync.
3. Verify `isAvailable` resolves true (catalog membership) and that a manual run
   produces non-degenerate output; add guard/chain tests only if the language
   exposes a new script edge case.
4. If the language has no on-device model, do not advertise it: remote tiers
   could serve it, but the documented contract is on-device-first and the chain
   would always need the network (Afrikaans is deliberately absent for this
   reason).

### Adding or replacing a remote tier

1. Implement a `TranslationBackend` in `backends/remote.ts`: stable `id`,
   `isAvailable(): Promise<boolean>` (usually always true), and
   `translate(texts, targetLang): Promise<(string|null)[]>` returning exactly
   the input length/order or throwing for batch failure.
2. Use `credentials: 'omit'`, `referrerPolicy: 'no-referrer'` and
   `AbortSignal.timeout(...)`; validate HTTP status and JSON content type;
   validate the response shape and map it positionally. Never return raw
   HTML/markup.
3. Register it in `createRemoteBackends()` in the intended order. The chain
   tries array order; keep the fastest/most reliable free tier first.
4. Update the tier table and exclusions in this document, and extend
   `backends/remote.unit.test.ts` with mapping, non-string, HTTP-error,
   non-JSON and quota/rate-limit cases (stub `fetch`; the suite never touches
   the network).
5. Consider privacy/legal exposure: the tier will receive the public site copy.
   If that is unacceptable, remove remote tiers instead; the chain then degrades
   to on-device and English.

### PWA notes

`pwa-options.ts` precaches only app-shell code/images/fonts. `globIgnores`
excludes `**/*.wasm`, `**/translate.worker*`, `**/*.pdf`, `bundle/**`; model
bytes live on Hugging Face and are downloaded lazily, never precached. Service
worker updates (`registerType: 'autoUpdate'`) do not touch the translation
IndexedDB store or the browser HTTP cache, so translations survive deploys unless
`CACHE_VERSION` changes, and models are re-fetched only if the browser evicted
them. The translation worker is a lazy Vite chunk, not part of the initial
bundle.

## 8. Known limitations

- **Chrome Translator is window-only and desktop-only.** The API is absent in
  workers (hence the main-thread chain) and unsupported on mobile browsers; the
  tier is unavailable there and the chain falls through.
- **Transient activation.** For a `downloadable` pair, `Translator.create()`
  requires a user gesture. The provider warms up on mount (no gesture), so this
  can fail with `NotAllowedError`; `init` swallows the failure and moves to the
  next tier. There is no UI prompt asking the user to click; first-visit
  translation therefore silently uses bergamot (or remotes) even on supported
  Chrome. Chrome sessions are kept to one language at a time (LRU of 1); other
  languages' sessions are destroyed.
- **Model downloads are per language and large** (≈25 MB for en→fr, larger for
  zh/ja; the `size` fields in the catalog drive the progress total). They happen
  on first use per browser profile and are not precached. A `CACHE_VERSION` bump
  does not delete models, but it forces a fresh translation run; if the HTTP
  cache no longer has the model files, bergamot re-downloads them.
- **Run budget.** A backend call that never settles is abandoned after 20 s and
  counted as a failure; remote tiers are skipped entirely when the browser
  reports `navigator.onLine === false`.
- **Remote tiers are unofficial.** Google/Mozhi endpoints are undocumented and
- **Remote tiers are unofficial.** Google/Mozhi endpoints are undocumented and
  can rate-limit, block datacenter IPs, change their shape or disappear;
  MyMemory's anonymous quota is small and its 450-byte limit skips most long
  paragraphs. The unit tests cover validation, not live availability.
- **Quality heuristics are blunt.** The guard rejects empty/punctuation-only,
  runaway, implausibly short/long and collapsed output, but cannot judge
  fluency; short nav labels are the most common English fallback. Identical
  brand strings are accepted on purpose.
- **English remains the SEO surface.** `Seo.tsx` always renders
  `seo.default`: one canonical URL, one `x-default` alternate, no translated
  `hreflang` entries. Client-side translation is invisible to crawlers, and the
  canonical stays English after a language switch (only `<html lang>`/`dir`
  change).
- **Cache has no eviction.** Entries have timestamps but no TTL or size cap;
  stale versions linger until site data is cleared.
- **No retry inside a tier.** A failed batch advances immediately; recovery is
  the next user run, a 60 s breaker cooldown, or an explicit `retry()`.

## 9. Test inventory

`npm test` collects **78 tests across 10 files: 72 unit + 6 integration**, all
offline (fake backends or stubbed `fetch`). The translation pipeline has 57
unit tests (5 files):

| File | Tests | Coverage |
| --- | --- | --- |
| `src/lib/translation/chain.unit.test.ts` | 24 | 18 chain cases: input order; first tier wins and later tiers untouched; throw → next tier; per-string `null` partial success; degenerate rejection; markup rejection; identical brand passthrough (short tokens only); length-mismatch discard; all-fail → English; unavailable skip; throwing probe = unavailable; breaker opens after 3, resets on success, re-admits after 60 s (injected clock); all-null advances; empty input touches nothing; availability probed once per language; duplicate strings. Plus 6 table cases for `isAcceptableTranslation` (empty, markup, degenerate, identical, normal, punctuation). |
| `src/lib/translation/backends/remote.unit.test.ts` | 14 | Google: flat-array mapping, `client=dict-chrome-ex`, non-string → `null`, HTTP 429 → batch throw, non-JSON rejection, dropped/reordered `q` params → `IntegrityFailure`. Mozhi: hyphenated `translated-text`, empty string = failure, majority-failure throw, single request failure tolerated. MyMemory: `responseStatus` string/number, HTTP-200 quota error → majority throw, `quotaFinished` boolean/string, `"false"` accepted, >450-byte string skipped. |
| `src/lib/translation/backends/chrome.unit.test.ts` | 6 | Availability: absent API, `available`/`unavailable`/rejecting probe; per-string failure → `null`; session LRU of 1 destroys the previous language's session. |
| `src/lib/translation/guard.unit.test.ts` | 11 | Empty/whitespace, punctuation-only, runaway repetition, single-token spam, CJK character collapse (and a fluent CJK negative), implausibly short, wildly long, fluent short translations, identical proper nouns, fluent sentence, naturally repeated tokens below threshold. |
| `src/lib/translation/translate-content.unit.test.ts` | 2 | Per-entry degenerate/English fallback with run-wide `degraded` count; ids/dates/proper names untouched and object shape/key order preserved. Note: failed strings are `null` slots that fall back per entry, with the source substituted. |

Remaining unit tests are outside translation: `src/types/content.unit.test.ts`
(9 CMS schema cases), `src/test/theme-shaders.unit.test.ts` (4 snapshot/token
cases), `src/test/check-assets.unit.test.ts` (2 asset-path cases). The 6
integration tests cover SEO/markup/bubbles component behavior
(`src/components/*.integration.test.tsx`).

Playwright specs in `e2e/` are separate from the 79: `boot.spec.ts` enforces the
English-zero-traffic contract, `chain.spec.ts` verifies the fallback chain in a
real browser (Chrome-tier short-circuit with zero model/remote traffic; remote
tiers serving when bergamot is unreachable; exhausted chain → English with no
page errors; cached reload with zero translation traffic), `pwa.spec.ts` the
installable/offline shell, plus reduced-motion and scroll-persistence checks.
They run against `vite preview` on port 4180 with service workers blocked for
determinism.
