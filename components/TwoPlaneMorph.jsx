"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { vertexShader, fragmentShader, MAX_PLANES, MAX_LINKS } from "./shaders/planeShaders";

// Aspect is 1.5 : 1, landscape. The planes sit side by side and pull apart
// along their long axis, so the edges facing each other are the short ones.
const PLANE_WIDTH = 150; // the axis they separate along
const PLANE_HEIGHT = PLANE_WIDTH / 1.5; // the length of the facing edges

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function TwoPlaneMorph() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    // 0 = the two planes are exactly on top of each other, one shape.
    // 1 = both have landed, sitting `gap` apart.
    const state = { sep: 0 };

    const params = {
      zoom: 2.2, // everything is in plane-pixels; this just magnifies for tuning
      gap: 80, // resting gap between the facing edges — the whole stretch
      radius: 10,
      // honey
      thread: 1.0, // bridge width at full merge, as a fraction of the facing edge
      thin: 1.0, // how fast it thins as the gap opens
      pinch: 0.35, // how far the middle necks in once fully stretched
      sag: 6, // droop at the middle of a stretched thread
      dissolve: 4, // screen px the radius runs past zero, so it fades out
      fillet: 14, // blend radius where the thread meets a plane
      goo: 0, // softness where the two planes overlap — keep at 0 for flat cards
      wobble: 0,
      loop: true,
    };

    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uSize: { value: new THREE.Vector2(PLANE_WIDTH, PLANE_HEIGHT) },
      uRadius: { value: params.radius },
      uCount: { value: 2 },
      uPos: { value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()) },
      uRot: { value: new Float32Array(MAX_PLANES) },
      uScale: { value: Array.from({ length: MAX_PLANES }, () => new THREE.Vector2()) },
      uLinkCount: { value: 1 },
      uLinkA: { value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()) },
      uLinkB: { value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector2()) },
      // (rEnd, rMid, sag, fillet) packed, matching the shader's layout.
      uLinkPar: {
        value: Array.from({ length: MAX_LINKS }, () => new THREE.Vector4()),
      },
      uK: { value: params.goo },
      uWobble: { value: params.wobble },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#0a0a0a") },
      // This rig stays a flat silhouette; the atlas uniforms only need to
      // exist so the shared shader has everything it declares.
      uAtlas: { value: null },
      uGrid: { value: new THREE.Vector2(1, 1) },
      uImageCount: { value: 0 },
      uImageOffset: { value: 0 },
      uBlend: { value: 1 },
      uTextured: { value: 0 },
      uBandTop: { value: 0 },
      uBandBottom: { value: 0 },
      uGlass: { value: new THREE.Vector4() },
      uFringe: { value: 0 },
      uSheen: { value: 0 },
    };

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(mesh);

    // Both planes are full size the whole time, so the only thing changing is
    // the distance between them. No rotation: uSize is already landscape.
    uniforms.uScale.value[0].set(1, 1);
    uniforms.uScale.value[1].set(1, 1);
    uniforms.uRot.value[0] = 0;
    uniforms.uRot.value[1] = 0;

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
      mesh.scale.set(w, h, 1);
      uniforms.uResolution.value.set(w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const layout = () => {
      const z = params.zoom;
      const sep = clamp01(state.sep);

      uniforms.uSize.value.set(PLANE_WIDTH * z, PLANE_HEIGHT * z);
      uniforms.uRadius.value = params.radius * z;
      uniforms.uWobble.value = params.wobble * z;
      // The planes are rigid cards, so they union plainly. Any smin between
      // them inflates the silhouette by about k/4 while they overlap, which
      // is most of what was reading as bulk.
      uniforms.uK.value = params.goo * z;

      // Centres move from coincident to one plane width plus the resting gap.
      const dist = (PLANE_WIDTH + params.gap) * z * sep;
      uniforms.uPos.value[0].set(-dist * 0.5, 0);
      uniforms.uPos.value[1].set(dist * 0.5, 0);

      // The gap actually open between the facing edges. Negative while the
      // planes still overlap, which is most of the first half of the move.
      const faceGap = dist - PLANE_WIDTH * z;
      // 0 = faces still touching, 1 = landed at the resting gap.
      const v = clamp01(faceGap / (params.gap * z));

      // At full merge the bridge is as wide as the edge it comes off, so it
      // reads as one mass rather than a wire.
      const w = Math.pow(1 - v, params.thin);
      // The dissolve bias is in screen pixels, not plane units: it exists to
      // carry the radius past zero and out of antialiasing range, so it must
      // not scale with zoom.
      const rEnd = PLANE_HEIGHT * 0.5 * z * params.thread * w - params.dissolve;
      // Pinch is applied after the bias so the middle and the ends reach zero
      // together and the whole thread fades as one, instead of the neck
      // breaking first and leaving nubs behind on each plane.
      const rMid = rEnd * (1 - (1 - params.pinch) * smoothstep(0, 0.7, v));

      uniforms.uLinkA.value[0].copy(uniforms.uPos.value[0]);
      uniforms.uLinkB.value[0].copy(uniforms.uPos.value[1]);
      uniforms.uLinkPar.value[0].set(
        rEnd,
        rMid,
        params.sag * z * Math.pow(v, 1.5),
        // While merged, the bridge edge is flush with the plane edge, so a
        // fillet there would round a join that does not exist yet and swell
        // the outline. It only comes in once there is a real neck to form a
        // meniscus around — and never wider than that neck, so it winds down
        // with the thread instead of bulging the plane edges after it has gone.
        Math.min(
          params.fillet * z * smoothstep(0, 0.35, v),
          Math.max(rMid, 0) * 1.5
        )
      );
    };

    // --- loop ----------------------------------------------------------------
    const tween = gsap.to(state, {
      sep: 1,
      duration: 2.2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.5,
    });

    // --- dev controls --------------------------------------------------------
    let gui;
    // The import resolves asynchronously, so under StrictMode's double mount
    // it can land after this effect has already been cleaned up — building a
    // second panel that nothing owns. Bail if that has happened.
    let disposed = false;
    if (process.env.NODE_ENV === "development") {
      import("lil-gui").then(({ default: GUI }) => {
        if (disposed) return;
        gui = new GUI({ title: "two-plane honey" });
        gui.add(state, "sep", 0, 1, 0.001).listen();
        gui
          .add(params, "loop")
          .onChange((v) => (v ? tween.play() : tween.pause()));

        const honey = gui.addFolder("honey");
        honey.add(params, "thread", 0, 6, 0.01);
        honey.add(params, "thin", 0.05, 12, 0.01);
        honey.add(params, "pinch", 0.01, 2, 0.01);
        honey.add(params, "sag", -300, 300, 0.5);
        honey.add(params, "dissolve", 0, 100, 0.1);
        honey.add(params, "fillet", 0, 250, 0.5);
        honey.add(params, "goo", 0, 250, 0.5);

        const shape = gui.addFolder("shape");
        shape.add(params, "gap", 1, 1200, 1);
        shape.add(params, "radius", 0, 300, 0.5);
        shape.add(params, "zoom", 0.1, 12, 0.01);
        shape.add(params, "wobble", 0, 120, 0.1);
      });
    }

    const start = performance.now();
    renderer.setAnimationLoop(() => {
      uniforms.uTime.value = (performance.now() - start) * 0.001;
      layout();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      tween.kill();
      gui?.destroy();
      mesh.geometry.dispose();
      mesh.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0" />;
}
