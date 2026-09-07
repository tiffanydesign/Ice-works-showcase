import * as THREE from "three";

// PHENOME LONGEVITY, letter by letter, and that spelling is the order the
// atlas is packed in. Deliberately, so leave it alone.
//
// The shader indexes this set by density — cell 0 at the faint outer edge of a
// particle field, the last cell up against the card — so the order decides
// which letter sits at which distance. It does not spell anything readable on
// screen: P is the faintest speck out at the edge, Y the boldest mark against
// the card, and everything in between is scattered by distance. Repeated
// letters cost nothing, since the three Es land on three different ramp steps
// and are drawn at three different sizes.
//
// Any order works, because the ramp is carried by the size solve below rather
// than by the letters themselves. What the order does change is which letters
// you actually see. Particles crowd the near-card end of the falloff, so the
// last few cells dominate the picture — here V I T Y, thin letters blown up to
// most of a cell. Sorting by ink instead would put G O M N there and read as a
// richer alphabet; that was tried and this was chosen over it. If the field
// ever looks too much like tally marks, the knob is this string, not the
// shader.
export const ASCII_GLYPHS = "PHENOMELONGEVITY";

// What the ramp has to span. The marks this set replaced ran from a full stop
// to an `at` sign — about a ninefold spread in coverage — and all three
// particle fields had their falloff tuned against it. Letters on their own span
// barely twofold, and in brand order they are not even in the right sequence:
// the thin ones (V I T Y) land in the heaviest slots. So the spread is carried
// entirely by drawing each glyph at its own size, solved to land on whatever
// coverage its slot is supposed to have.
const COVER_MIN = 0.0122;
const COVER_MAX = 0.1155;

// Roomy enough for the top of the ramp: brand order pushes the last few cells
// to around 0.96 of the cell, where ink order needed only 0.75.
const CELL = 160;

// Everything below is quoted against the cell so the atlas can be resized
// without re-deriving any of it.
const BASE = CELL * 0.525;
const MIN_PX = CELL * 0.15;
const MAX_PX = CELL * 1.15;

// Sizes are solved against the font actually in use rather than baked in as
// constants: this stack resolves to Consolas on Windows and SF Mono on macOS,
// and those two do not carry the same weight at the same pixel size.
const font = (px) =>
  `700 ${px}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;

const setup = (ctx) => {
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
};

/** Fraction of a cell the glyph inks, 0..1. */
function coverage(ctx, ch, px) {
  ctx.clearRect(0, 0, CELL, CELL);
  ctx.font = font(px);
  ctx.fillText(ch, CELL * 0.5, CELL * 0.51);

  const data = ctx.getImageData(0, 0, CELL, CELL).data;
  let sum = 0;
  for (let i = 3; i < data.length; i += 4) sum += data[i];
  return sum / (255 * CELL * CELL);
}

/**
 * The size each slot wants. Coverage goes roughly with the square of the point
 * size, so the correction is a square root. Geometric rather than linear steps
 * because the ramp is read as apparent weight and the eye takes that
 * logarithmically — evenly spaced coverage would spend most of the ramp on
 * marks that all look equally dark.
 */
function sizes(ctx, glyphs) {
  const ratio =
    glyphs.length > 1
      ? (COVER_MAX / COVER_MIN) ** (1 / (glyphs.length - 1))
      : 1;

  return [...glyphs].map((ch, i) => {
    const measured = coverage(ctx, ch, BASE);
    if (measured <= 0) return BASE; // glyph missing from the font; leave it be

    const target = COVER_MIN * ratio ** i;
    // MAX_PX clears the cell edges even at the top of the ramp. There are no
    // mipmaps and the sampler is linear, so a glyph reaching the boundary
    // bleeds into the neighbouring letter. A monospace face spends about 0.55
    // em on the advance and 0.64 on the cap, which is what leaves the headroom.
    const solved = BASE * Math.sqrt(target / measured);
    return Math.min(Math.max(solved, MIN_PX), MAX_PX);
  });
}

/**
 * A tiny alpha atlas for the particle effects. Keeping the glyphs in a texture
 * makes them actual characters instead of geometric approximations in the
 * fragment shader, while still letting the whole effect live in the ring's
 * existing WebGL pass.
 */
export function createAsciiTexture() {
  // Measured on its own canvas, so a cell can be cleared and re-inked without
  // disturbing the sheet being assembled.
  const scratch = document.createElement("canvas");
  scratch.width = CELL;
  scratch.height = CELL;
  const scratchCtx = scratch.getContext("2d", { willReadFrequently: true });
  setup(scratchCtx);
  const px = sizes(scratchCtx, ASCII_GLYPHS);

  const canvas = document.createElement("canvas");
  canvas.width = CELL * ASCII_GLYPHS.length;
  canvas.height = CELL;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setup(ctx);

  for (let i = 0; i < ASCII_GLYPHS.length; i++) {
    ctx.font = font(px[i]);
    ctx.fillText(ASCII_GLYPHS[i], i * CELL + CELL * 0.5, CELL * 0.51);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
