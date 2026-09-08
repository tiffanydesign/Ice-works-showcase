import { asset } from "./basePath";
import { PROJECTS } from "./projects";

export const EASES = [
  "power2.out",
  "power3.out",
  "power4.out",
  "expo.out",
  "circ.out",
  "back.out(1.1)",
  "power1.inOut",
  "power2.inOut",
  "power3.inOut",
  "expo.inOut",
  "none",
];

export const WEIGHTS = { Light: 300, Regular: 400, Medium: 500, Semibold: 600 };

/**
 * Every tunable in one place. A fresh object per mount so the dev panel cannot
 * leak edits from one mount into the next.
 *
 * Two conventions worth knowing before reading further:
 *
 *  - Every px figure is quoted at `refWidth` and scaled from there. Change the
 *    machine you tune on and `refWidth` wants changing with it (the fit folder
 *    has a button that reads it off the live window).
 *  - Below `narrowAt` and again below `tightAt` the ring is re-proportioned
 *    rather than just scaled down. Those bands multiply the fit, they do not
 *    replace it, and they stack.
 */
export function defaultParams() {
  return {
    // -- fit ------------------------------------------------------------
    // 14" MacBook Pro at default scaling: 3024x1964 native, 1512x982 points.
    refWidth: 1512,
    refHeight: 870, // viewport, i.e. screen less menu bar and browser chrome
    fitHeight: 0, // 0 = width alone drives scale, 1 = whichever axis is tighter
    minScale: 0.5, // a phone is not a small desktop; bracket the extremes
    maxScale: 1.75,

    narrowAt: 1024, // inclusive
    narrowPlane: 1.25,
    narrowRadius: 1.3, // cards grow faster than the arc, or the gaps close up
    narrowText: 1.5, // type cannot shrink like a picture can and stay readable
    narrowPosX: -2.5,
    narrowEndScale: 4.22,

    tightAt: 640, // inclusive
    tightRadius: 0.82, // multiplies narrowRadius
    tightPosX: -3.5,
    tightSplit: 0.8, // the heading, competing with the ring for centre screen
    tightName: 1.5, // the name is the only label left, so it takes the billing
    tightNameBottom: 16, // px
    tightNameRight: 16, // px
    tightMetaWidth: 70, // vw of box, and so of filter region, around it

    // -- geometry, all at the reference window ---------------------------
    // 90 -> 170. Twice, for two different reasons: x1.5 when the deck became
    // three product close-ups rather than twelve portfolio frames, and again to
    // close the margin either side. At 135 the card measured 437..1003 in a
    // 1440 frame - balanced, but with the name lockup ending near 400 the whole
    // composition sat in the left two thirds and the right read as unfinished.
    //
    // planeSize, NOT endScale and NOT posX: endScale is the whole stage with
    // the radius in it, so the ring grows with the cards and the front card
    // leaves the screen; posX brings the ring in far enough that the arc
    // crosses the middle. Both were tried. This grows the card alone, on the
    // arc it already sits on.
    // 170 was one step too far: the card reached 719px in a 1440 frame, which
    // put its left edge under the name, and the two neighbours on the arc came
    // far enough into frame to read as debris in the corners rather than as a
    // ring. 150 keeps the fuller composition without either.
    planeSize: 150, // long edge in px; aspect locked at 1.5 : 1
    count: PROJECTS.length, // one plane per project, so the deal comes out even
    ringRadius: 340,
    seed: 0, // where plane 0 sits, degrees (0 = 3 o'clock)
    radial: true, // long edge points outward; off = long edge along the ring
    radius: 6, // corner
    textured: true, // off = flat silhouette, useful for reading the goo
    blend: 14, // px over which neighbouring art crossfades in the goo
    imageOffset: 0, // rotates the whole deal; 0 lands the entry on PROJECTS[0]

    // -- loading ---------------------------------------------------------
    // The counter is the gate: the entry launches on the frame it reads 100.
    // It is no longer DRAWN — see the note in tickLoader — so what is left here
    // is the pacing of that gate and nothing about a numeral.
    // holdAfter is a beat held after 100 and wants to stay near zero.
    holdAfter: 0,
    loaderChase: 0.18,

    // -- entry timing ----------------------------------------------------
    stagger: 0.34,
    launchTime: 1.95,
    spreadEase: "power2.out",
    spreadTime: 3.6,
    // Where the ring goes once formed. stageAt is a fraction of the spread, so
    // 0.5 starts the move midway through the ring drawing.
    stageAt: 0.7,
    spinTurns: 1,
    spinTime: 2.6,
    spinEase: "power2.inOut",
    spinDelay: 0,
    // -1.72, moved right from -2. This is how far off-screen LEFT the ring's
    // centre sits, and it is what puts one card in front of the reader with the
    // rest of the arc out of frame.
    //
    // THE FLOOR IS ABOUT -1.6, found by overshooting: at -1.35 the ring came far
    // enough in that its arc crossed the middle of the screen, three cards
    // showed at once and the front one hung off the right edge. -1.72 keeps a
    // single card and one arc while moving the whole composition — card and
    // name lockup together, because the lockup is positioned off the ring —
    // about 5% of the viewport to the right.
    posX: -1.72, // fraction of half the viewport width
    posY: 0,
    endScale: 4.46,
    moveTime: 2.2,
    moveEase: "power2.inOut",
    moveDelay: 0.2,

    // -- scroll / drag / click, live once the entry finishes --------------
    scrollSpeed: 0.0022, // rad/s of angular velocity per px of wheel delta
    damping: 0.94, // velocity kept per 60fps frame
    maxSpeed: 12, // rad/s, so one flick cannot run away
    dragSpeed: 1,
    snap: true, // settle with a plane facing front
    snapTime: 0.8, // run-in, once the flick itself is spent
    snapFrom: 1, // rad/s under which the ring commits to a slot
    pickTime: 0.55, // click-to-centre: seconds for one slot, root-scaled
    pickEase: "power3.inOut",


    // -- the intro heading, in the scene ---------------------------------
    // The opening heading. `textImage` wins when set: the brand lockup rather
    // than the words, drawn as one quad with the same wipe — see splitText.
    // `text` is kept because the glyph path is still there and still correct,
    // and because clearing textImage in the dev GUI should give it back.
    textImage: asset("phenome-logo.svg"),
    textImageScale: 11, // multiples of textSize; 41 x 11 is about 450px wide
    text: "PHENOME RING",
    textSize: 41,
    textFont: "helvetica-neue-lt-pro",
    textWeight: 400,
    textTracking: 0, // em
    textColor: "#0a0a0a",
    textAt: 0.42, // fraction of the spread
    textTime: 0.95,
    textStagger: 0.015,
    textEase: "power4.out",
    textOut: true,
    textOutAt: -0.5, // seconds relative to the ring landing; negative = early
    textOutTime: 0.7,
    textOutEase: "power2.in",

    // -- the meta either side of the ring --------------------------------
    // [number . name] left, [type . year] right. Insets and gaps in vw so the
    // pairs hold their relationship as the window changes.
    // 5.5 -> 12. The lockup is inset from the SCREEN and the card is positioned
    // off the RING, so moving the ring right (posX above) opened a gap between
    // them that nothing else closes. Measured at 1440 with posX -1.72: the card
    // starts at 608 and the name ended at 300, leaving a third of the screen
    // empty between two things that read as one line. At 12vw the name ends
    // near 470.
    metaLeft: 12,
    metaRight: 5.5,
    // 4.7 -> 2.5. The number and the name are one lockup; the wide gap was
    // drawn when the name was 24px and had a screen to sit in. It is the space
    // this composition had left to give back.
    metaGapL: 2.5,
    metaGapR: 3.6,
    metaWidth: 34, // this box is the filter region
    // 24 -> 30, and the ceiling is set by the card rather than by taste. The
    // lockup is [number][gap][name] running left to right into the picture, so
    // the longest of the three names - "Champagne Gold" - is what has to clear
    // the card's left edge. Measured at 1440 with planeSize 150: the card
    // starts at 393, and at 34px that name ended at 441, printing over the
    // photograph. At 30, with the gap below tightened, it ends near 377.
    nameSize: (30 / 1440) * 100, // vw, quoted at 1440
    nameFont: "helvetica-neue-lt-pro",
    nameWeight: 500,
    idxSize: (20 / 1440) * 100, // a step lighter and smaller than the name
    idxFont: "helvetica-neue-lt-pro",
    idxWeight: 400,
    listSize: 0.9, // vw; the column's line height is unitless so rows follow

    // The morph between one card's words and the next.
    nameMorphTime: 1.2,
    nameEase: "circ.out",
    nameBlur: 8.5, // px the outgoing word smears to before it lets go
    nameEdge: 400, // alpha gain — how abruptly the threshold sets
    nameCut: 0.33, // and the alpha it sets at
    nameSoften: 0.35, // px of blur after it, standing in for antialiasing

    // -- glass lip along the top and bottom ------------------------------
    glass: true,
    bandTop: 0.08, // fraction of viewport height
    bandBottom: 0.08,
    refract: 60, // px the image is pulled in at the very edge
    squeeze: 0.05,
    ripple: 5, // px of wave along the lip
    rippleFreq: 0.02,
    fringe: 1.5, // px of chromatic split
    sheen: 0.05,

    // -- pointer ---------------------------------------------------------
    // Nothing is drawn at the cursor. It softens the field around itself,
    // leans the nearest planes toward it and strings honey back between them.
    hover: true,
    touchHold: 0.16, // seconds of near-still press before a finger counts
    touchSlop: 10, // px of travel inside that window that calls it a swipe
    lag: 0.3, // cursor smoothing, per 60fps frame
    melt: 34, // px added to the ring's own blend at the cursor
    meltReach: 260, // px the softening and the wake carry
    reach: 1.7, // lean and swell falloff, in plane long edges
    swell: 0.09,
    pull: 26, // px a plane leans toward the cursor
    grab: 0.14, // how fast a plane takes up a lean, per 60fps frame
    release: 0.06, // and how slowly it lets go — asymmetric on purpose
    web: 0.2, // hovered thread width, as a fraction of the facing edge
    webReach: 1.15,
    wave: 4, // px of capillary wake at full pointer speed
    waveFreq: 0.05,
    waveSpeed: 7,

    // How the cards either side of the hovered one get out of its way. The
    // pointer block above answers to the cursor; these answer to the card.
    sideScale: 0.035,
    sidePush: 17, // px
    sideDim: 0.15,
    sideReach: 2.4, // in plane long edges, measured from the hovered card

    // -- particles behind the hovered card -------------------------------
    // Only the card under the pointer gets this field. The ring and bridges
    // stay clean, while the same amount drives a reversible in/out flow.
    focusParticles: true,
    focusParticleFrom: 1024,
    focusParticleReach: 82,
    focusParticleCell: 15,
    focusParticleOpacity: 0.58,
    // Letters picked by column rather than by weight, so the halo spells
    // PHENOME left to right instead of drawing the tail of the density ramp.
    // Off restores the ramp, which is still what the other two fields read.
    // The cell above is the type size: seven letters want about half the reach.
    focusParticleWord: true,
    focusParticleWordFill: 0.9,
    focusParticleEnter: 0.16,
    focusParticleExit: 0.11,
    focusParticleDrift: 0.7,
    focusParticleOut: 3.2,

    // -- particle-to-image opening --------------------------------------
    // The first atlas cell begins as a four-way mirrored ASCII diamond. It
    // contracts and squares into a large centre card before the ring fires.
    assemble: true,
    assembleFrom: 1024,
    assembleTime: 1.55,
    assembleEase: "power3.inOut",
    assembleSpread: 3.8,
    // x1.5, asked for: the opening card is the first thing seen and was
    // reading as a thumbnail of the ring rather than as the product.
    assembleCardScale: 3.9,
    assembleCell: 13,
    assembleOpacity: 0.96,
    assembleHaloReach: 148,
    assembleHaloOpacity: 0.72,

    // -- the cursor tag, drawn in the same shader pass --------------------
    tagFrom: 1024, // viewport width it needs; below that there is no cursor
    tagText: "View",
    tagSize: 14,
    tagWeight: 500,
    tagArrow: 14, // px, the svg in /public
    tagGap: 6,
    // Offset off the cursor deliberately: sitting under it, the tag covers
    // the thing being pointed at. World px, so +y is up like posY.
    tagX: 64,
    tagY: -38,
    tagFrost: 0.16,
    tagRim: 0.02,
    tagRefract: 39.5,

    // -- honey between neighbouring planes --------------------------------
    thread: 1.0,
    thin: 0.4,
    pinch: 0.35,
    sag: 6,
    dissolve: 2.9,
    fillet: 14,

    // -- birth of the seed -------------------------------------------------
    wobble: 3,
    goo: 35,
  };
}
