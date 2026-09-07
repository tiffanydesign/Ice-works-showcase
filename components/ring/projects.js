// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..NN as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// Adding or removing a row is enough on its own: params.count reads the length
// and the atlas sizes its sheet from it.
//
// THREE, 2026-09-07. This deck used to carry twelve — the full campaign set,
// macro shots and lifestyle frames alongside the colourways — and the piece
// was a portfolio carousel where that was the right number. It is a product
// showcase now, embedded on the ring's own page, and it has one job: show the
// finishes you can actually buy. Three cards, three colourways, and the ring
// closes in three steps rather than twelve.
//
// The alternation the old list kept — light beige, blue, dark, because
// neighbouring cards bleed into each other in the goo and two of the same read
// as one — still holds and is why these three are in this order: white, then
// gold, then black.
export const PROJECTS = [
  { file: "5.webp", name: "Arctic White", type: "Colourway", year: "2026" },
  { file: "3.webp", name: "Champagne Gold", type: "Colourway", year: "2026" },
  { file: "9.webp", name: "Midnight Black", type: "Colourway", year: "2026" },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
