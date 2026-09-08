import gsap from "gsap";
import { PROJECTS } from "./projects";

/**
 * The lockup of type beside the ring: [number . name], on the left. It reads
 * whatever card is facing front.
 *
 * Changing card melts one set of words into the next. Two copies are stacked,
 * one blurred out as the other blurs in, and the pair run through an alpha
 * threshold that forces every pixel above a cut solid and drops the rest. Two
 * soft edges drifting past each other cross that cut as one shape, which is
 * what makes the words run together and pull apart instead of crossfading.
 * None of it is per-glyph.
 *
 * A word that is not actually changing — the same year twice running — is
 * held instead of melted. Holding it in place is not enough on its own: the
 * threshold has to span both layers for them to fuse, so anything inside it
 * gets thresholded whether it moves or not and a held word visibly thickens.
 * So each group carries a third row outside the filtered subtree and paints
 * carried-over words from there.
 *
 * All three rows always hold both words, painted or not. The row is what
 * positions the other word, and a missing one would move it.
 */

// LEFT ONLY, 2026-09-07. The right lockup was [type . year] and on a deck of
// three colourways it said "Colourway 2026" three times running — a caption
// that never changes is not a caption, it is furniture. Removed by name here
// rather than hidden in CSS, so the DOM, the morph timelines and the goo
// filter it drives all go with it.
const SIDES = ["left"];

/* TWO SLOTS: [product] above, [colour] under it.

   It was [number] [name] on one line. The number is gone — the tab bar under
   the ring counts the deck now, with a dot per colourway and a ring on the one
   showing, so a numeral beside the picture was the same fact said twice and the
   quieter of the two ways of saying it.

   What replaced it is the product, and that is not decoration: two of the six
   colours are called Black, so the colour alone stopped identifying the card —
   "Black" over a ceramic frame and "Black" over a titanium one are different
   rings. The finish is what tells them apart and it has to be on screen.

   The colour keeps the big half and the morph, because it is what changes on
   every step and it is what the reader is choosing. The product line changes
   twice in the whole journey and rides the same morph for free. */
const SLOTS = 2;

const slotsOf = (row) => row?.firstElementChild?.children;

// One word's share of a morph. f = 1 present, 0 gone. Opacity falls away far
// slower than the blur climbs, so the word still carries alpha well into its
// smear — without that there is nothing for the threshold to weld the other
// one to. Applied per word, not per row, so a held word can be left alone.
function fade(el, f, blur) {
  if (!el) return;
  if (f >= 1) {
    el.style.filter = "none";
    el.style.opacity = "1";
  } else if (f <= 0) {
    // Cleared as well as hidden, so a spent word is not left holding a 100px
    // blur the compositor has to keep around.
    el.style.filter = "none";
    el.style.opacity = "0";
  } else {
    el.style.filter = `blur(${Math.min(blur / f - blur, 100)}px)`;
    el.style.opacity = `${Math.pow(f, 0.4)}`;
  }
}

function createGroup(side, groups, params) {
  const m = { t: 1 };
  // What is on screen, and which of it the morph in flight is moving. Both
  // rows are rewritten on every change rather than trading places: a word can
  // move between the filtered rows and the steady one from change to change,
  // and alternating would leave whichever row it left holding something stale.
  let prev = Array(SLOTS).fill("");
  let moving = Array(SLOTS).fill(false);

  const draw = () => {
    const g = groups[side];
    if (!g) return;
    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    const t = m.t;

    for (let j = 0; j < SLOTS; j++) {
      if (moving[j]) {
        fade(out?.[j], 1 - t, params.nameBlur);
        fade(into?.[j], t, params.nameBlur);
        if (held?.[j]) held[j].style.opacity = "0";
      } else {
        if (out?.[j]) out[j].style.opacity = "0";
        if (into?.[j]) into[j].style.opacity = "0";
        if (held?.[j]) held[j].style.opacity = "1";
      }
    }

    // Only worth its cost while two words are in play. At rest the threshold
    // hardens glyph edges, and at this size that is the difference between
    // type that is set and type that is stamped.
    if (g.goo) {
      g.goo.style.filter =
        t >= 1 ? "none" : `url(#name-goo) blur(${params.nameSoften}px)`;
    }
  };

  // parts[0] the number, parts[1] the product, parts[2] the colour. Which of
  // them is the big half, and which line each sits on, is decided in style().
  const set = (parts) => {
    const g = groups[side];
    if (!g?.layers[0] || !g.layers[1] || !g.plain) return;
    gsap.killTweensOf(m);

    // A change landing mid-morph finishes the one in flight first, so the next
    // pair has something settled to melt out of. Also what makes the
    // comparison below honest: it is against what is actually on screen.
    m.t = 1;
    draw();

    const next = Array.from({ length: SLOTS }, (_, j) => parts[j] ?? "");
    moving = next.map((w, j) => w !== prev[j]);

    const out = slotsOf(g.layers[0]);
    const into = slotsOf(g.layers[1]);
    const held = slotsOf(g.plain);
    for (let j = 0; j < SLOTS; j++) {
      if (out?.[j]) out[j].textContent = prev[j];
      if (into?.[j]) into[j].textContent = next[j];
      if (held?.[j]) held[j].textContent = next[j];
    }
    prev = next;

    // Card changed but this group did not. Nothing to melt, and no reason to
    // switch the threshold on.
    if (!moving.some(Boolean)) {
      m.t = 1;
      draw();
      return;
    }

    m.t = 0;
    draw();
    gsap.to(m, {
      t: 1,
      duration: params.nameMorphTime,
      ease: params.nameEase,
      onUpdate: draw,
    });
  };

  return { m, set };
}

/**
 * refs: { groups, list, loader, cut, live } — DOM handed over from the
 * component. `groups` is the shape the JSX populates, one entry per side.
 */
export function createMeta(refs, params) {
  const { groups, list, cut, live } = refs;
  const left = createGroup("left", groups, params);

  // Only the alpha row does any work; colour passes straight through.
  const setThreshold = () => {
    cut?.setAttribute(
      "values",
      `1 0 0 0 0
       0 1 0 0 0
       0 0 1 0 0
       0 0 0 ${params.nameEdge} ${-params.nameEdge * params.nameCut}`,
    );
  };

  // layout: { textK, tight, viewW } — the band state, passed in rather than
  // read, so this stays a pure function of the window it is told about.
  const style = ({ textK, tight, viewW }) => {
    // Everything downstream is derived from this one figure: the box height,
    // so the filter region, so where the corner offset has to drop the box to.
    const bigVw = params.nameSize * textK * (tight ? params.tightName : 1);
    const big = `${bigVw}vw`;
    const small = `${params.idxSize * textK}vw`;
    const bigFace = `"${params.nameFont}", ui-sans-serif, system-ui, sans-serif`;
    const smallFace = `"${params.idxFont}", ui-sans-serif, system-ui, sans-serif`;
    const bigWeight = `${params.nameWeight}`;
    const smallWeight = `${params.idxWeight}`;
    // Roomy, because this box is what the filter region is measured off and
    // the blur needs somewhere to go.
    const h = bigVw * 3;

    for (const side of SIDES) {
      const g = groups[side];
      if (!g?.box) continue;
      const isRight = side === "right";

      // In the tight band the ring is most of the screen and there is nowhere
      // for two lockups to sit, so three of the four labels go and the name
      // alone moves to the bottom-right corner.
      const corner = tight && !isRight;
      if (tight && isRight) {
        g.box.style.display = "none";
        continue;
      }
      g.box.style.display = "";

      g.box.style.width = `${corner ? params.tightMetaWidth : params.metaWidth}vw`; // prettier-ignore
      g.box.style.height = `${h}vw`;

      if (corner) {
        // The box is three times the type's height, so placing it at the
        // offset asked for would sit the words half a box too high. Drop it by
        // the difference and the type lands where the number says.
        const boxPx = (h * viewW) / 100;
        const emPx = (bigVw * viewW) / 100;
        g.box.style.top = "auto";
        g.box.style.left = "auto";
        g.box.style.right = `${params.tightNameRight}px`;
        g.box.style.bottom = `${params.tightNameBottom + emPx * 0.5 - boxPx * 0.5}px`;
        g.box.style.transform = "none";
      } else {
        // Cleared rather than set, so the class on the element takes it back.
        g.box.style.top = "";
        g.box.style.bottom = "";
        g.box.style.transform = "";
        // Anchored to its own edge, so the fixed-width half of each pair — the
        // number, the year — is the one against the margin. That is also what
        // stops a morph shifting anything: rows are sized by their own words
        // but justified to the same edge, so the words line up across rows.
        g.box.style.left = isRight ? "auto" : `${params.metaLeft}vw`;
        g.box.style.right = isRight ? `${params.metaRight}vw` : "auto";
      }

      // All three rows, the steady one included. They have to agree exactly or
      // a word would jump as it moved between them.
      for (const layer of [...g.layers, g.plain]) {
        if (!layer) continue;
        layer.style.justifyContent =
          corner || isRight ? "flex-end" : "flex-start";
        const row = layer.firstElementChild;
        // Only the row gap does any work now that the lockup is one word per
        // line. A fifth of the big size rather than a figure of its own: the
        // leading has to grow with the type or the lockup comes apart across a
        // breakpoint.
        row.style.columnGap = `${isRight ? params.metaGapR : params.metaGapL}vw`;
        row.style.rowGap = `${bigVw * 0.22}vw`;
        row.style.justifyContent = corner || isRight ? "flex-end" : "flex-start";
        const [lead, trail] = row.children;
        // The product is what goes in the corner layout — there the ring is
        // most of the screen and only the colour fits. Its morph carries on
        // underneath, so nothing needs resyncing on the way out. It sets small,
        // and never empty: show() falls back to the card's type.
        lead.style.display = corner ? "none" : "";
        lead.style.fontFamily = smallFace;
        lead.style.fontSize = small;
        lead.style.fontWeight = smallWeight;
        // Its own line, always: basis 100% is what breaks the wrap under the
        // product rather than trailing it along one baseline.
        trail.style.flexBasis = "100%";
        trail.style.fontFamily = isRight ? smallFace : bigFace;
        trail.style.fontSize = isRight ? small : big;
        trail.style.fontWeight = isRight ? smallWeight : bigWeight;
      }
    }

    // The column is set from here too, so all the type moves as one piece
    // across a breakpoint instead of half of it growing. The load counter used
    // to be sized here as well and no longer exists.
    if (list) list.style.fontSize = `${params.listSize * textK}vw`;

    setThreshold();
  };

  // Both slots in one call, so the finish can never drift from the colour it
  // is labelling.
  const show = (i) => {
    const p = PROJECTS[i];
    if (!p) return;
    // The six colourways carry a product; the other six fall back to their
    // type, which keeps the line populated and — unlike the [type . year]
    // caption this replaced — changing from card to card.
    left.set([p.product || p.type, p.name]);
    // The group is hidden from the accessibility tree, so the card is
    // announced once, in full, from the live region instead of twice.
    if (live) {
      live.textContent = p.product
        ? `${p.product}, ${p.name}. ${p.type}, ${p.year}.`
        : `${p.name}. ${p.type}, ${p.year}.`;
    }
  };

  const dispose = () => {
    gsap.killTweensOf(left.m);
  };

  return { show, style, setThreshold, dispose };
}
