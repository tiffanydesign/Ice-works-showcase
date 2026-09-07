import * as THREE from "three";
import { textVertexShader, textFragmentShader } from "../shaders/textShaders";

/**
 * The intro heading, one glyph per quad. In the scene rather than the DOM so
 * the planes sweep over it as the ring spins — text draws first, planes draw
 * on top. Each quad is a mask its glyph wipes up through.
 *
 * `chars` are the reveal uniforms and `fades` the opacity ones; the entry
 * timeline tweens both as arrays.
 */
export function createSplitText(group, params) {
  let chars = [];
  let fades = [];

  const dispose = () => {
    for (const child of [...group.children]) {
      group.remove(child);
      child.geometry.dispose();
      child.material.uniforms.uTex.value?.dispose();
      child.material.dispose();
    }
    chars = [];
    fades = [];
  };

  /* THE BRAND LOCKUP, when params.textImage names one.

     The heading used to be the words PHENOME RING, one textured quad per
     glyph, wiping up through its own cell. It is the brand mark now — the same
     full-colour lockup the storefront's masthead and its design system carry —
     so it is ONE quad with the picture on it, wiping through the same way.

     Everything downstream is unchanged: `chars` and `fades` are still arrays of
     uniforms and the entry timeline still tweens them as arrays. It is an array
     of one. That is why this is a branch inside build() rather than a second
     component — the timeline should not have to know which it got.

     Drawn to a canvas rather than handed to TextureLoader because an SVG needs
     rasterising at a chosen size either way, and the canvas is what the glyph
     path already used. */
  const buildImage = () => {
    const dpr = Math.min(window.devicePixelRatio, 2) * 2;
    const img = new Image();
    img.crossOrigin = "anonymous";

    // The quad is created immediately with a blank texture and filled when the
    // picture lands. The entry timeline runs off document.fonts and the atlas,
    // not off this, so a slow decode must not be able to hold up the ring.
    const tex = new THREE.Texture(document.createElement("canvas"));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;

    const mat = new THREE.ShaderMaterial({
      vertexShader: textVertexShader,
      fragmentShader: textFragmentShader,
      uniforms: {
        uTex: { value: tex },
        uReveal: { value: 0 },
        uColor: { value: new THREE.Color(params.textColor) },
        uOpacity: { value: 1 },
        uTinted: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    // Sized from the heading's own type size so the lockup scales with every
    // other measurement in the piece rather than being pinned to a pixel width.
    const w = params.textSize * params.textImageScale;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.renderOrder = 0;
    group.add(mesh);
    chars.push(mat.uniforms.uReveal);
    fades.push(mat.uniforms.uOpacity);

    img.onload = () => {
      const ratio = img.naturalHeight / img.naturalWidth || 0.153;
      const h = w * ratio;
      // Padding on the vertical only: the wipe travels up, so the mask needs
      // room above and below and none at the sides.
      const pad = h * 0.25;
      const cellH = h + pad * 2;

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(w * dpr));
      canvas.height = Math.max(1, Math.ceil(cellH * dpr));
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, pad, w, h);

      tex.image = canvas;
      tex.needsUpdate = true;
      mesh.scale.set(w, cellH, 1);
      mesh.position.set(0, 0, 0);
    };
    img.src = params.textImage;
  };

  const build = () => {
    dispose();

    if (params.textImage) {
      buildImage();
      return;
    }

    const size = params.textSize;
    // Above display resolution — type is the first thing to show softness and
    // these canvases are tiny.
    const dpr = Math.min(window.devicePixelRatio, 2) * 2;
    const font = `${params.textWeight} ${size}px "${params.textFont}", ui-sans-serif, system-ui, sans-serif`;

    const measure = document.createElement("canvas").getContext("2d");
    measure.font = font;

    const glyphs = [...params.text];
    const advances = glyphs.map((ch) => measure.measureText(ch).width);
    const tracking = params.textTracking * size;
    const totalW =
      advances.reduce((a, b) => a + b, 0) + tracking * (glyphs.length - 1);

    // Padding gives overhanging glyphs room and lengthens the wipe a little.
    const pad = size * 0.25;
    const cellH = size * 1.3 + pad * 2;

    let x = -totalW / 2;

    glyphs.forEach((ch, i) => {
      const adv = advances[i];
      if (ch.trim()) {
        const cellW = adv + pad * 2;

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(cellW * dpr));
        canvas.height = Math.max(1, Math.ceil(cellH * dpr));
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.font = font;
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#000";
        ctx.fillText(ch, pad, pad + size); // puts cap-height centre on y = 0

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        const mat = new THREE.ShaderMaterial({
          vertexShader: textVertexShader,
          fragmentShader: textFragmentShader,
          uniforms: {
            uTex: { value: tex },
            uReveal: { value: 0 },
            uColor: { value: new THREE.Color(params.textColor) },
            uOpacity: { value: 1 },
            uTinted: { value: 1 },
          },
          transparent: true,
          depthTest: false,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.scale.set(cellW, cellH, 1);
        // Cell is the advance box plus symmetric padding, so centring on the
        // advance keeps the run correctly spaced.
        mesh.position.set(x + adv / 2, 0, 0);
        mesh.renderOrder = 0;
        group.add(mesh);
        chars.push(mat.uniforms.uReveal);
        fades.push(mat.uniforms.uOpacity);
      }
      x += adv + tracking;
    });
  };

  return {
    build,
    dispose,
    get chars() {
      return chars;
    },
    get fades() {
      return fades;
    },
  };
}
