// Ring order, not filename order. Art is dealt straight down this list, so
// entry n sits one slot along from n-1 and the column can count 01..18 as the
// carousel turns. Reordering these rows moves the ring, the column and the
// numbering together; nothing else needs touching.
//
// The labels below describe the local visual studies; they are not artwork
// titles or authorship claims. Image origins live in /public/pinterest-sources.json.
export const PROJECTS = [
  { file: "1.webp", name: "Chromed Velocity", type: "Material Study", year: "2026" },
  { file: "2.webp", name: "Veiled Luxury", type: "Art Direction", year: "2025" },
  { file: "3.webp", name: "Star Alloy", type: "CGI", year: "2026" },
  { file: "4.webp", name: "Prismatic Fold", type: "Material Study", year: "2025" },
  { file: "5.webp", name: "Molten Letterform", type: "Typography", year: "2026" },
  { file: "6.webp", name: "Alpine Interface", type: "Web Design", year: "2026" },
  { file: "7.webp", name: "Modular Index", type: "Editorial", year: "2026" },
  { file: "8.webp", name: "Open Framework", type: "Editorial", year: "2024" },
  { file: "9.webp", name: "Emerald Vessel", type: "CGI", year: "2026" },
  { file: "10.webp", name: "Liquid Chassis", type: "Material Study", year: "2026" },
  { file: "11.webp", name: "Future Type", type: "Web Design", year: "2026" },
  { file: "12.webp", name: "Dark Aperture", type: "Art Direction", year: "2024" },
  { file: "13.webp", name: "Grid Studies", type: "Editorial", year: "2025" },
  { file: "14.webp", name: "Silver Noise", type: "Texture", year: "2026" },
  { file: "15.webp", name: "Hello Max", type: "Web Design", year: "2026" },
  { file: "16.webp", name: "Chrome Stack", type: "Typography", year: "2026" },
  { file: "17.webp", name: "Midnight Glass", type: "CGI", year: "2026" },
  { file: "18.webp", name: "Rose Mercury", type: "Material Study", year: "2026" },
];

export const IMAGE_FILES = PROJECTS.map((p) => p.file);
