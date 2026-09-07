# AGENTS.md

Working notes for this repo. Read this before changing anything under
`components/` — most of the code is one WebGL machine and a lot of it is
non-obvious in ways that look like bugs.

## What this is

A single-page portfolio carousel. Twelve project cards sit on a ring that is
mostly off-screen to the left; you see an arc of it. Scroll, drag or swipe
turns the ring, and it snaps so a card faces front. The cards are not DOM
elements or textured quads — the whole ring is **one full-screen fragment
shader** drawing signed distance fields, which is what lets neighbouring cards
melt into each other ("goo") and string honey-like threads as they separate.

Everything visible is either that one shader pass or a handful of absolutely
positioned DOM labels over the top of it.

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # also the fastest correctness check
npm run lint     # eslint
npx prettier --check "components/**/*.{js,jsx}" "app/**/*.{js,jsx}"
```

There are **no tests**. `npm run build` plus `npm run lint` is the whole safety
net. GLSL is compiled at runtime, not at build time, so a shader typo builds
fine and fails in the browser console — check shader edits by loading the page.

## Layout

```
app/
  page.js              renders <Carousel />, nothing else
  layout.js            root layout + metadata
  globals.css          Tailwind v4 import, @font-face, page background

components/
  Carousel.jsx        the component. renderer, resize/fit, input, spin
                       physics, the per-frame layout loop, the entry timeline
  ring/
    projects.js        the twelve projects, in ring order
    params.js          every tunable, as a factory
    utils.js           TAU/DEG, easings, signedOffset, chase
    atlas.js           packs all art into one texture, incrementally
    meta.js            the two type lockups and their morph
    splitText.js       the intro heading ("Works '26")
    tag.js             the "View" tag that rides the cursor
    gui.js             lil-gui dev panel, dynamically imported
  shaders/
    planeShaders.js    the ring: SDFs, goo, glass lip, tag. ~430 lines of GLSL
    textShaders.js     the per-glyph reveal for the intro heading
```

`Carousel.jsx` is ~1400 lines and deliberately so. The fit logic, pointer
handling, layout loop and timeline share about twenty closure variables. They
have been left together because threading a context object through them reads
as tidier in a file tree and is harder to follow in an editor.

## The three coordinate ideas

Get these wrong and nothing else makes sense.

**World px.** Origin at screen centre, **Y up**. This is the space the shader
evaluates in, so pointer coordinates are converted into it once, on the way in,
and never again. Page Y is down, hence sign flips whenever the two meet.

**Ring slot vs plane index.** Planes are numbered in _fan order_ — the seed
first, then alternating either side of it, so index 0,1,2,3,4 sits at slot
0,+1,−1,+2,−2. `signedOffset(i)` converts. **Consecutive indices are on
opposite sides of the ring.** Anything derived from index rather than slot will
be subtly wrong; art used to be dealt by index and made the project column step
two names per slot.

**`g`, the stage scale.** Every plane-pixel measurement is multiplied by `g`,
so the ring resizes as one piece and the goo keeps its proportions. `g` folds
in both the entry's `endScale` and the window fit. If you add a measurement in
px, decide whether it goes through `g` — most do.

## Responsive model

Params are authored against a **reference window** (`refWidth: 1512`, a 14"
MacBook Pro at default scaling) and scaled by `fit = viewW / refWidth`, clamped
to `[minScale, maxScale]`. Width alone drives it by default, which keeps the
composition exactly self-similar: the ring's centre is placed as a fraction of
the viewport, so scaling its radius by the same fraction lands the front card
on the same relative spot at any width.

On top of that are two **bands**, computed in `refit()` and applied as
multipliers, not replacements:

|          | `narrowAt` ≤ 1024 | `tightAt` ≤ 640         |
| -------- | ----------------- | ----------------------- |
| plane    | ×1.25             | —                       |
| radius   | ×1.3              | ×0.82 (stacks → ×1.066) |
| text     | ×1.5              | name ×1.5 again         |
| posX     | −2.5              | −3.5                    |
| endScale | 4.22              | —                       |
| layout   | all four labels   | name only, bottom-right |

Two rules when touching this:

- **`refit()` runs on resize only.** The layout loop reads `fit`/`planeK`/
  `radiusK`/`textK` thousands of times a second and must not be recomputing
  them.
- **Band _flags_ are stored, not resolved values,** so anything picked off them
  (`posX`, `endScale`) still responds to the dev panel between resizes.

If you tune on a machine that isn't 1512 wide, set `refWidth` to your window
first — the **fit** folder has a button that reads it off the live one.
Otherwise you are tuning against a scale factor that isn't 1 and everything
will be wrong everywhere else.

## Non-obvious things that will bite you

**`uScale` is a packed vec4.** `xy` is the birth scale, `z` is brightness (for
the side-card dim), `w` is which atlas cell the plane wears. They ride together
because GLSL ES allocates a full vec4 row per uniform-array element whatever
you declare, so `.zw` were already being paid for. Adding a separate `float[32]`
would cost 32 more rows against a guaranteed budget of 224.

**`ASCII_GLYPHS` is a density ramp as well as a string.** All three particle
fields index it by weight — cell 0 at the faint outer edge, the last cell
against the card — so the order is a distance mapping, not a word anyone reads
off the screen. It is `PHENOMELONGEVITY`, the brand spelled out, and that is a
decision rather than an oversight: the letters are **not** in ascending weight
and are not meant to be. Letters span barely a twofold spread where the marks
they replaced spanned ninefold, so `ascii.js` solves a per-glyph point size at
startup — measured against whatever monospace face the platform gives it — and
that solve is what makes an arbitrary order viable at all. Change the letters
and the sizes re-solve themselves; change the count and the shader follows,
because `GLYPHS`/`GLYPH_LAST` are interpolated from `ASCII_GLYPHS.length` and
the three tuned expressions all speak in a normalised `RAMP_SPAN`.

**The tail of the ramp is what you see.** Particles bunch up at the near-card
end of every falloff, so the last three or four cells carry most of the picture
and the first few are almost invisible. Brand order puts `V I T Y` in that band
and the field reads as thin vertical strokes; an ink-sorted set puts `G O M N`
there and reads as a much busier alphabet. Both were built and compared, and
the brand spelling won on the strength of the spelling. Do not re-sort it on
the theory that the ramp is broken — check the visible band first.

**Mirrored fields need `uprightUV`, not `fract`.** The assembly diamond and the
seed-card field both mirror their tiling with `abs()` for four-way symmetry,
which runs the in-cell coordinate backwards on the negative side of each axis.
That was invisible when the glyphs were `.:+x*#@`; with letters it renders half
the field in a mirror alphabet.

**The shaders are template literals.** A backtick anywhere in a GLSL comment
ends the string and the file fails to parse, several hundred lines from the
thing you actually edited. Write `abs()` in prose, not in backticks.

**Art is dealt by ring slot, negated.** `cellOf(slot)` in the layout loop.
Negated because turning the ring forward walks the front slot _backwards_, and
scrolling down should read _down_ the project list.

**`PROJECTS` order is ring order, not filename order.** It reads shuffled
against the file numbers and that is correct. Reordering rows moves the ring,
the column and the numbering together — that is the only place to change the
sequence. Do not use `imageOffset` for this; it rotates the art without moving
the list.

**The load counter is the gate.** The entry launches on the frame the number
reads 100, and nothing else opens that gate. The counter reads
`min(load progress, birth progress)` so it cannot finish early and leave a
number sitting on 100 waiting for a condition nobody told the viewer about.

**The meta morph needs three rows per side, not two.** Two stacked copies melt
into each other through an alpha threshold. The threshold must span both layers
for them to fuse, so anything inside it gets thresholded whether it is moving
or not — a word carried over unchanged (the same year twice running) would
visibly thicken for the length of the morph. Hence a third row outside the
filtered subtree. All three rows always carry all the words, painted or not,
because the row is what positions the others.

**The side-card focus is one frame stale, deliberately.** The hit test that
decides which card is hovered runs _inside_ the layout loop, but every plane
needs an answer before the loop reaches that card. `focusPos` is latched at the
end of a frame for the next one. It is eased over ~10 frames, so the lag is not
perceptible.

**The snap can only decelerate.** It is a run-in for a throw that is nearly
spent. Click-to-centre (`pick`) therefore cannot reuse it — a pick starts from
a standstill and has to accelerate, so it tweens `state.spin` directly with the
momentum suspended (`picking`).

**Touch is not a mouse with one finger.** `pointer.inside` (is the position
worth reading — what the hit test needs) is separate from `engaged()` (should
the softening be on). On touch the latter requires a deliberate press-and-hold,
because a finger has no hover state. Also: **Safari reports `movementX` as 0
for touch**, so drag distance is measured from `clientX`/`clientY`; using
`movementX` makes every swipe look stationary and end in a tap.

**`touch-action: none`** on the canvas is load-bearing. Without it the browser
claims the gesture and the `pointermove` stream dies mid-drag.

**The WebGL context must be released explicitly.** `renderer.dispose()` frees
GL resources but leaves the context alive until the canvas is collected, which
is not deterministic. The effect re-runs on every StrictMode double mount and
every hot update, so contexts pile up; past the browser's limit (~16 in
Chrome) `new THREE.WebGLRenderer()` throws before the canvas is ever appended
and the page is blank with no canvas in the DOM at all. Cleanup calls
`forceContextLoss()` for this reason — do not remove it. Symptom if it
regresses: blank after a long dev session, fine after a hard reload.

## Conventions

- **All tuning lives in `params.js`.** If you are about to hardcode a number in
  the layout loop, it probably wants to be a param with a dev-panel control.
- **Add a control when you add a param.** `ring/gui.js`, in the matching
  folder. Wire the right `onChange`: `refit` for anything the bands depend on,
  `styleMeta` for anything the DOM labels are sized from, `replay` for anything
  baked into the entry timeline at build time.
- **Comments explain why, not what.** The code says what it does. Keep them
  short; the one long doc block in the repo is on `meta.js` because that
  technique genuinely does not read off the code.
- Prettier defaults, no config file. Run it before committing.
- The dev panel is `process.env.NODE_ENV === "development"` only and both it
  and lil-gui are dynamically imported, so neither reaches production.

## Known gaps

Listed roughly by how much they matter, so an agent picking up work knows what
is missing versus what is deliberate.

1. **Clicking a card centres it but nothing opens.** The "View" tag promises a
   destination that does not exist. `pick()` returns early when the card is
   already at the front — that early return is where navigation belongs.
2. **Fonts are `.otf`/`.ttf`, ~340 KB.** Converting to `woff2` would cut that
   by roughly 60%. PP Neue Montreal is also gitignored, so the heading falls
   back on a fresh clone — see below.
3. **The art is webp and roughly right.** ~700 KB across twelve files, each
   1536x1024. The atlas still downsamples every one to a 512px cell, so there
   is headroom left, but not the order of magnitude there used to be.
4. **`prefers-reduced-motion` is unhandled.** Six seconds of animated blur with
   no escape hatch.
5. **No keyboard control.** Arrow keys should step the ring; the project column
   is `pointer-events-none` and cannot be clicked to jump.
6. **The labels are descriptive, not a record.** Every `type` and `year` in
   `projects.js` describes the shot rather than a real commission. The images
   are PhenomeTech smart ring photography supplied for this demo — not the
   author's, not covered by the repository's MIT licence, and flagged as such
   in the README and in `public/image-sources.json`. Do not present them as
   portfolio work or strip those notices.
7. **Phone widths are approximate.** The `tight` band was tuned at the 640 end
   of its range. Below ~500px `minScale` pins the ring's size while `posX`
   keeps scaling, so the front card drifts back toward centre.

## This is a public repo

Two things to respect when adding files.

**PP Neue Montreal is bundled but not licensed.** `public/ppneuemontreal-book.otf`
is a commercial Pangram Pangram face, kept in the repo so the design renders
during development. It is called out in the README and LICENSE as development
only, not for commercial use. Do not quietly widen its use, do not remove the
notices, and if you swap the heading to a free face, take the file out with it.
Satoshi (ITF Free Font Licence) and Geist (OFL) have no such restriction.

**Keep third-party attribution intact.** The simplex noise in
`planeShaders.js` carries an MIT notice that has to travel with the code. If
you pull in more shader snippets, credit them the same way and add a line to
the LICENSE and the README's Credits section.

Source is MIT. The contents of `public/` are explicitly _not_ covered — see
`LICENSE`.

Font families are looked up **by name**: the strings in `params.js`
(`nameFont`, `idxFont`, `textFont`) have to match a `@font-face` family in
`app/globals.css`, and the `textFont` dropdown in `gui.js` lists them a third
time. A name with no matching block falls back to system sans silently, which
looks like a rendering bug rather than a missing file.

## Dead files — safe to delete

- `components/TwoPlaneMorph.jsx` — an earlier experiment, nothing imports it.
- `shader` (repo root, no extension) — a 13 KB paste of somebody's component
  library docs. Not code, not referenced.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
