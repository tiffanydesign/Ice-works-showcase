export const textVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// One glyph per quad. The quad is the mask; the glyph slides up through it.
//
// At uReveal 0 the sample sits a full cell below the mask and every fragment
// is discarded, so the character is genuinely absent rather than transparent.
// At 1 it lines up exactly with the quad.
export const textFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTex;
  uniform float uReveal;
  uniform vec3  uColor;
  uniform float uOpacity;
  // 1 = the texture is a MASK and uColor is the ink (a glyph); 0 = the texture
  // carries its own colour and uColor is ignored (the brand lockup). The wipe
  // above is identical either way, which is the point of doing it here rather
  // than with a second material.
  uniform float uTinted;

  void main() {
    float gy = vUv.y + 1.0 - uReveal;
    if (gy > 1.0 || gy < 0.0) discard;

    vec4 t = texture2D(uTex, vec2(vUv.x, gy));
    if (t.a <= 0.001) discard;

    // The canvas is premultiplied, so the picture's own colour has to be
    // divided back out before it is blended again.
    vec3 rgb = mix(t.rgb / max(t.a, 0.001), uColor, uTinted);
    gl_FragColor = vec4(rgb, t.a * uOpacity);
  }
`;
