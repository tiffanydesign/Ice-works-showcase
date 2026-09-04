import * as THREE from "three";

export const ASCII_GLYPHS = ".:+x*#@";

/**
 * A tiny alpha atlas for the particle effects. Keeping the glyphs in a texture
 * makes them actual ASCII characters instead of geometric approximations in
 * the fragment shader, while still letting the whole effect live in the
 * ring's existing WebGL pass.
 */
export function createAsciiTexture() {
  const cell = 128;
  const canvas = document.createElement("canvas");
  canvas.width = cell * ASCII_GLYPHS.length;
  canvas.height = cell;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 84px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < ASCII_GLYPHS.length; i++) {
    ctx.fillText(ASCII_GLYPHS[i], i * cell + cell * 0.5, cell * 0.51);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
