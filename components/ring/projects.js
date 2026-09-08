// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..12 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// Adding or removing a row is enough on its own: params.count reads the length
// and the atlas sizes its sheet from it. The one thing to keep is the
// alternation of ground below — light beige, blue, dark — because neighbouring
// cards bleed into each other in the goo and two of the same read as one.
//
// `product` is the line above the name in the lockup, and it is what the six
// colourways carry that the other six do not: two of them are called Black and
// the finish is the only thing telling them apart. Where it is absent the
// lockup falls back to `type`, so a card is never captioned with a blank.
export const PROJECTS = [
  // The seed. This is the card the entry animation is born on, so it is the
  // first thing the piece shows — and it is a frame of the film now rather than
  // the family shot it was: the ring square to camera with the wordmark lit
  // inside it, lifted at 26.00s of PhenomeTech Ring.mp4 and cropped 3:2 off the
  // 16:9 centre. Renamed with it; "Ring Family" described three rings and a
  // case, and there is one ring in it.
  { file: "1.webp", name: "PhenomeTech Ring", type: "Film still", year: "2026" },
  { file: "2.webp", name: "Sensor Array", type: "Macro", year: "2026" },
  { file: "6.webp", name: "Light Reveal", type: "Art Direction", year: "2026" },

  // -- THE SIX THE SCROLL VISITS, adjacent on purpose and in journey order.
  //    See the note under FOCUS. Ceramic first because the page below puts
  //    Ceramic first, and within each finish the colours are in the order the
  //    storefront copy lists them.
  { file: "7.webp", product: "PhenomeTech Ceramic Ring", name: "Pink",   type: "Colourway", year: "2026" }, // prettier-ignore
  { file: "9.webp", product: "PhenomeTech Ceramic Ring", name: "Black",  type: "Colourway", year: "2026" }, // prettier-ignore
  { file: "5.webp", product: "PhenomeTech Ceramic Ring", name: "White",  type: "Colourway", year: "2026" }, // prettier-ignore
  { file: "3.webp", product: "PhenomeTech Ring", name: "Gold",   type: "Colourway", year: "2026" }, // prettier-ignore
  { file: "4.webp", product: "PhenomeTech Ring", name: "Black",  type: "Colourway", year: "2026" }, // prettier-ignore
  { file: "8.webp", product: "PhenomeTech Ring", name: "Silver", type: "Colourway", year: "2026" }, // prettier-ignore

  { file: "10.webp", name: "Morning Ritual", type: "Lifestyle", year: "2026" },
  { file: "11.webp", name: "Charging Case", type: "Hardware", year: "2026" },
  { file: "12.webp", name: "Training Day", type: "Lifestyle", year: "2025" },
];

// THE SIX THE SCROLL VISITS. The ring keeps all twelve — the arc is what the
// piece IS, and six cards on it is a ring with gaps rather than a ring — but
// the journey the host drives stops at the six product frames and no more.
// These are the colourways: what the page is actually selling, and the only
// cards a reader is asked to choose between.
//
// TWO FINISHES, THREE COLOURS EACH, and the split is at the halfway mark
// rather than anywhere the host has to be told about: the first three are
// Ceramic and the last three are Titanium, so the host derives which finish
// is showing with a divide and never carries a second list that could drift
// out of step with this one.
//
// ADJACENT, and the list above is ordered for it. Art is dealt by ring slot,
// and cellOf(slot) counts BACKWARDS: (imageOffset - slot) mod count. So six
// cells that step UP by one — 3 to 8 — are six slots that step DOWN by one,
// and each turn of the journey is a single slot rather than a sweep across it.
//
// THE DIRECTION IS THE POINT, not just the adjacency. Cells 8..3 and cells
// 3..8 are the same six cards and the same one-slot steps; what differs is
// which way the ring turns between them, and so which side a card enters from.
// The arrangement that reads wrong turns the ring so that scrolling DOWN
// brings the next card up from below — the page goes one way and the picture
// goes the other. This one turns it the other way: scroll down, the ring rolls
// forward, the next card comes over the top. The rows above are ordered for
// that, which is why FOCUS is plainly ascending and needs no reversing.
//
// The cost, stated because the list's own header warns about it: the run is
// six long now and four of the six sit on blue grounds, so the alternation
// that keeps neighbouring cards from bleeding into one another in the goo is
// broken across most of it. It reads as one continuous studio behind the
// colourways, which for a colourway sequence is the right accident — and the
// two titanium frames that are not blue fall at the end, where the finish
// changes anyway.
export const FOCUS = [3, 4, 5, 6, 7, 8];

// How many colourways each finish has. The host reads the same split off its
// own step index; stated here so the two cannot disagree about where Ceramic
// ends and Titanium begins.
export const PER_FINISH = 3;

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
