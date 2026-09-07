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
// The labels describe the shot, not a client or a campaign.
export const PROJECTS = [
  { file: "1.webp", name: "Ring Family", type: "Product", year: "2026" },
  { file: "2.webp", name: "Sensor Array", type: "Macro", year: "2026" },
  { file: "3.webp", name: "Champagne Gold", type: "Colourway", year: "2026" },
  { file: "4.webp", name: "Polished Titanium", type: "CGI", year: "2026" },
  { file: "5.webp", name: "Arctic White", type: "Colourway", year: "2026" },
  { file: "6.webp", name: "Light Reveal", type: "Art Direction", year: "2026" },
  { file: "7.webp", name: "Rose Quartz", type: "Colourway", year: "2026" },
  { file: "8.webp", name: "Brushed Silver", type: "Materials", year: "2026" },
  { file: "9.webp", name: "Midnight Black", type: "Colourway", year: "2025" },
  { file: "10.webp", name: "Morning Ritual", type: "Lifestyle", year: "2026" },
  { file: "11.webp", name: "Charging Case", type: "Hardware", year: "2026" },
  { file: "12.webp", name: "Training Day", type: "Lifestyle", year: "2025" },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
