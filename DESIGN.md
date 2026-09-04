---
name: Viscose
description: "Editorial WebGL portfolio carousel built around an off-screen viscous photographic ring."
colors:
  ink: "#0a0a0a"
  paper: "#fafafa"
typography:
  display:
    fontFamily: '"PP Neue Montreal", ui-sans-serif, system-ui, sans-serif'
    fontSize: "41px"
    fontWeight: 400
    letterSpacing: "0em"
  title:
    fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.6666666667vw"
    fontWeight: 500
    letterSpacing: "-0.01em"
  body:
    fontFamily: '"Satoshi", ui-sans-serif, system-ui, sans-serif'
    fontSize: "0.9vw"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
  label:
    fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif'
    fontSize: "1.1111111111vw"
    fontWeight: 400
    letterSpacing: "-0.01em"
  cursor-tag:
    fontFamily: '"PP Neue Montreal", ui-sans-serif, system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 500
rounded:
  card: "6px"
  pill: "20px"
spacing:
  meta-edge: "5.5vw"
  meta-gap-left: "4.7vw"
  meta-gap-right: "3.6vw"
  tight-edge: "16px"
components:
  photo-card:
    rounded: "{rounded.card}"
    width: "90px"
    height: "60px"
  intro-heading:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
  metadata-name:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  metadata-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  project-list:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  load-counter:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  cursor-tag:
    typography: "{typography.cursor-tag}"
    rounded: "{rounded.pill}"
    width: "104px"
    height: "40px"
---

# Design System: Viscose

## Overview

**Creative North Star: "The Viscous Ring"**

Viscose is an experience-led, full-viewport portfolio surface. A single photographic ring is the artifact and the interface: most of the circle remains off-screen to the left while one arc crosses the viewport, so the visible card, its neighbours, and their liquid connections carry the composition.

The surrounding UI is restrained and editorial. A near-white field, black typography, and large areas of open space let the photographic atlas supply all variable color. DOM labels stay sparse and fixed while the shader provides movement, occlusion, refraction, goo, and responsive geometry.

**Key Characteristics:**

- Near-white full-viewport field with black interface typography.
- One shader-rendered ring of 18 clipped photographic cards.
- Off-screen, asymmetrical staging with a single front-facing card.
- Liquid joins, honey-like threads, glass-edge refraction, and image crossfades.
- A particle-to-image opening where a mirrored ASCII diamond becomes the first artwork, followed by a temporary particle field behind the single seed card.
- A reversible, loosely dispersed hover-only ASCII shadow behind one card at a time; the ring and bridges never carry particles.
- Responsive wide, narrow, and tight compositions rather than a uniformly scaled desktop layout.
- Strict type roles for project names, numbers, editorial display text, and the cursor tag.

## Colors

The interface is deliberately two-color; photographic content owns the chromatic range.

### Primary

- **Ink** (#0a0a0a): Used for all visible interface type, the intro heading, and the untextured ring silhouette.

### Neutral

- **Paper** (#fafafa): Fills the entire page and is also the shader's known page color for translucent cursor-tag rendering.

### Named Rules

**The Two-Color Interface Rule.** Keep interface chrome to Ink and Paper; do not pull accent colors from the current artwork into labels or controls.

## Typography

**Display Font:** PP Neue Montreal (with UI sans-serif and system fallbacks)

**Body and Project Font:** Satoshi (with UI sans-serif and system fallbacks)
**Label Font:** Geist (with UI sans-serif and system fallbacks)

**Character:** Satoshi carries project identity with a clean, restrained weight; Geist keeps numbers and years visibly distinct; PP Neue Montreal is reserved for the intro heading and cursor tag. The separation of roles is more important than decorative variation.

### Hierarchy

- **Display** (400, 41px at the reference window, 0em tracking): The rasterized `ICE WORKS` entry heading. It scales with the window fit, gains the narrow text multiplier, and is reduced by the tight heading multiplier.
- **Title** (500, 1.6666666667vw in the wide band, -0.01em tracking): Project names and disciplines in the two primary metadata positions. It becomes 1.5 times larger in the narrow band; the lone tight-band name gains a second 1.5 multiplier.
- **Body** (400, 0.9vw in the wide band, 1.4 line-height, 0.01em tracking): The 18-item project column. It follows the narrow text multiplier and disappears in the tight band.
- **Label** (400, 1.1111111111vw in the wide band, -0.01em tracking): Project numbers, years, and the loading counter. It follows the narrow text multiplier.
- **Cursor Tag** (500 requested, 14px): The rasterized `View` label paired with a 14px arrow. The installed PP Neue Montreal face is the Book/400 cut, so new roles must not depend on additional weights being present.

### Named Rules

**The Type Role Rule.** Keep Satoshi on project language, Geist on numbers and years, and PP Neue Montreal on the entry heading and cursor tag.

## Layout

The surface is fixed to the viewport, hides overflow, and has no page scroll. The renderer evaluates in world pixels with the origin at screen center and Y pointing upward; DOM labels remain in page coordinates. Cards are radially oriented on a ring whose center stages beyond the left edge, leaving the front card near the visual center and neighbouring cards clipped by the top and bottom of the viewport.

The authored reference window is 1512 × 870. Width drives the base fit, clamped from 0.5 to 1.75. At the authored scale, a card is 90 × 60, the ring radius is 340, and the final wide ring scale is 4.46. The wide ring center uses a horizontal stage position of -2 half-view widths. The metadata lockups are vertically centered at equal 5.5vw edge insets; the left number/name gap is 4.7vw and the right discipline/year gap is 3.6vw. The project column sits 12vw from the right and 2.4vh from the top.

| Band | Trigger | Implemented changes |
| --- | --- | --- |
| Wide | Above 1024px | Full four-part metadata, project column, and desktop cursor tag. |
| Narrow | 1024px and below | Card scale ×1.25, ring radius ×1.3, type ×1.5, stage position -2.5 half-view widths, final ring scale 4.22. |
| Tight | 640px and below | Stacks on Narrow: ring radius ×0.82, stage position -3.5 half-view widths, entry heading ×0.8, project name ×1.5 again. The project column, right lockup, and left index disappear; the name alone moves to the bottom-right at 16px insets inside a 70vw filter box. |

### Named Rules

**The Width-Led Fit Rule.** Scale the composition from the 1512px reference width first, then apply the narrow and tight multipliers as stacked bands.

**The Ring-Slot Rule.** Place and deal artwork by signed ring slot, not by plane index; consecutive plane indices alternate sides of the seed.

## Elevation & Depth

The system uses no CSS shadows and no stacked panel surfaces. Depth comes from shader geometry: cards occlude the entry heading, side cards can dim by up to 0.15 around a hovered card, and the top and bottom 8% viewport bands bend the field like a glass lip. The glass uses 60px refraction, 5px ripple, 1.5px chromatic fringe, and 0.05 sheen. The cursor tag uses 0.16 frost, a 0.02 light/dark rim gain, and 39.5px refraction.

### Named Rules

**The Optical Depth Rule.** Use occlusion, refraction, brightness, and field deformation for depth. Particle depth belongs only to two bounded states: the single-card entry beat and the card currently under the pointer. The ring and bridges remain particle-free; do not add conventional drop shadows to the ring or metadata.

## Shapes

Cards are 3:2 rounded rectangles. Artwork cover-fits a 512 × 341 atlas cell, clips overflow, and never stretches. The authored 6px corner radius scales through the same stage factor as the card so the silhouette stays proportionally consistent.

The ring is not a set of isolated cards: signed-distance-field blending rounds overlaps into one surface, then tapered bridges pinch, sag, and dissolve into honey-like threads as neighbours separate. The cursor tag is a 104 × 40 pill with a 20px radius. Top and bottom glass lips are edge bands, not bordered containers.

### Named Rules

**The Scaled Corner Rule.** Scale card dimensions, corner radius, goo, and blend together through the stage scale so the material does not change across viewport sizes.

## Components

### Viscous Ring

- **Render model:** One full-screen transparent WebGL shader pass draws every card, image transition, bridge, the bounded card particle fields, cursor tag, and glass edge.
- **Structure:** 18 cards sit in ring order; fan order starts at the seed and alternates positive and negative signed slots.
- **Interaction:** Wheel, drag, and swipe add rotational momentum; the ring decelerates and snaps to a front-facing slot. Clicking a non-front card centers it.
- **Pointer response:** The nearest card leans and swells, neighbouring cards push aside and dim, the field softens, a capillary wake can follow pointer speed, and a loose ASCII shadow streams in behind that card. On leave, the same irregular field reverses and exits before detaching from its latched card.

### Photographic Cards

- **Shape:** 3:2 rounded rectangle, authored at 90 × 60 with a 6px radius before responsive and stage scaling.
- **Crop:** Centered cover crop from the atlas; edge pixels clamp so goo carries edge color rather than repeating.
- **Orientation:** Long edge points radially outward.
- **Color transition:** The two nearest images crossfade across a 14px authored blend region wherever their fields meet.
- **Hover particle depth:** Only the card under the desktop pointer receives particles. The glyph field is cut out beneath the photograph, disperses naturally from the rounded-card distance field without a geometric clip or mirrored symmetry, and follows the card's position, scale, and rotation while it enters or exits.

### Metadata Lockups

- **Left:** Two-digit project number followed by the project name, baseline-aligned.
- **Right:** Project discipline followed by year, baseline-aligned and right-justified.
- **Morph:** Changed words blur and threshold together over 1.2s with `circ.out`; unchanged words stay on a third, unfiltered row.
- **Tight treatment:** Keep only the project name and move it to the bottom-right.

### Project Column

- **Placement:** Fixed at the upper-right in wide and narrow bands; hidden at 640px and below.
- **State:** The current project is fully opaque; all other names use 0.2 opacity.
- **Transition:** State changes immediately when the ring crosses the halfway point between slots; there is deliberately no opacity transition.
- **Input:** The column does not receive pointer events.

### Entry Heading and Loader

- **Loader:** A centered three-digit counter runs from `001` to `100` at 1vh from the bottom. Reaching `100` is the sole gate that releases the ring entry.
- **Particle assembly:** On desktop, the first atlas image begins as a 3.8× expanded, four-way mirrored ASCII diamond. The diamond contracts symmetrically, morphs into a rectangle, and gradually adopts the image's colour and luminance over 1.55s before crossfading into a centre card at 2.6× authored scale. A second mirrored field streams inward behind the isolated card, breathes while it holds, reverses through the diamond tips as the card launches, and is fully gone before the ring fans open. Reduced motion skips this spatial assembly.
- **Heading:** `ICE WORKS` reveals per glyph, wiping upward for 0.95s with `power4.out` and 0.015s stagger, then fades before the ring lands.
- **Layering:** The heading is rendered inside the scene so cards can sweep over it.

### Cursor Tag

- **Availability:** Mouse-only and only when the viewport is wider than 1024px.
- **Shape and content:** 104 × 40 pill, `View` label, 14px north-east arrow, and 6px internal gap.
- **Surface:** Refracts the pixels beneath it; glyph color flips per pixel between black and white according to local luminance.
- **Motion:** Horizontal and vertical axes form on separate elastic tweens; dismissal flattens the tag into a bead.

### Named Rules

**The One-Pass Ring Rule.** Keep the visible ring, liquid bridges, and cursor tag in the shared shader field so they can merge, refract, and invert against the same pixels.

## Do's and Don'ts

### Do:

- **Do** keep the interface field near-white and all persistent UI typography black.
- **Do** let the photographic atlas supply the composition's variable color.
- **Do** use 3:2 centered cover crops with rounded corners that scale with the cards.
- **Do** preserve the wide, narrow, and tight band multipliers as stacked responsive rules.
- **Do** keep project labels synchronized to the atlas cell facing front.
- **Do** keep Satoshi, Geist, and PP Neue Montreal within their implemented roles.

### Don't:

- **Don't** convert the ring into independent DOM cards or textured quads; the shared signed-distance field is the visual system.
- **Don't** center the full ring in the viewport or expose the entire circle.
- **Don't** add drop shadows, bordered panels, colored interface accents, or decorative gradients around the photography.
- **Don't** show the project column, right metadata lockup, or project index in the tight band.
- **Don't** derive artwork order from plane index; fan order alternates sides of the ring.
- **Don't** replace the shader cursor tag with a flat DOM badge that cannot refract or invert against the artwork.
