"use client";

import { useEffect, useRef } from "react";

import type * as Three from "three";
import styles from "./nebula-background.module.css";

/**
 * A soft animated nebula that fills the footer behind its content, replacing
 * the flat board colour. It rides a single full-screen three.js shader plane
 * (three is already a dependency; no react-three-fiber) and is theme-aware: a
 * warm cream/marigold/teal/rose haze in light mode, a deeper glow on near-black
 * in dark mode, so the footer's own ink stays readable in both.
 *
 * Touch and small screens use a CSS haze to avoid mobile GPU context crashes.
 * Desktop rendering is bounded, pauses offscreen, and falls back to that haze
 * if WebGL fails. Reduced motion freezes either version.
 */

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uDark;

  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * vec2(uResolution.x / uResolution.y, 1.0) * 3.0;
    float t = uTime * 0.09;

    float n1 = fbm(p + vec2(t, t * 0.5));
    float n2 = fbm(p * 1.7 - vec2(t * 0.7, t));
    float clouds = fbm(p + n1 * 1.4 + vec2(t));

    vec3 baseL = vec3(0.988, 0.953, 0.925);
    vec3 baseD = vec3(0.082, 0.059, 0.051);
    vec3 base = mix(baseL, baseD, uDark);

    vec3 marigold = mix(vec3(0.914, 0.635, 0.031), vec3(0.82, 0.45, 0.16), uDark);
    vec3 teal = mix(vec3(0.055, 0.486, 0.482), vec3(0.10, 0.44, 0.43), uDark);
    vec3 rose = mix(vec3(0.847, 0.42, 0.451), vec3(0.62, 0.26, 0.32), uDark);

    // Light mode washed out too far, so its weight is pushed up toward the
    // dark-mode strength; the marigold band also starts lower in light so more
    // of the field takes colour.
    float w = mix(0.58, 0.62, uDark);
    vec3 col = base;
    col = mix(col, marigold, smoothstep(mix(0.30, 0.40, uDark), 0.92, clouds) * w);
    col = mix(col, teal, smoothstep(0.50, 1.0, n2) * w * 0.7);
    col = mix(col, rose, smoothstep(0.55, 0.96, n1) * w * 0.65);

    float star = pow(hash(floor(gl_FragCoord.xy * 0.5)), 42.0);
    col += star * mix(0.18, 0.55, uDark);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const VERT = /* glsl */ `
  void main(){ gl_Position = vec4(position, 1.0); }
`;

export function NebulaBackground() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    let visible = false;
    let initializing = false;
    let failed = false;
    let elapsed = 0;
    let lastFrame = 0;
    let lastPaint = 0;
    let renderer: Three.WebGLRenderer | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let scene: Three.Scene | undefined;
    let camera: Three.Camera | undefined;
    let geometry: Three.PlaneGeometry | undefined;
    let material: Three.ShaderMaterial | undefined;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const simple = window.matchMedia("(max-width: 767px), (pointer: coarse)");

    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const setState = (state: "css" | "webgl" | "paused" | "fallback") => {
      host.dataset.nebulaState = state;
      host.toggleAttribute("data-nebula-running", visible && !document.hidden && !motion.matches && !renderer);
    };
    const release = () => {
      stop();
      canvas?.removeEventListener("webglcontextlost", lost);
      try {
        geometry?.dispose();
        material?.dispose();
        renderer?.dispose();
        renderer?.forceContextLoss();
      } catch { /* A lost context may already have released its resources. */ }
      canvas?.remove();
      renderer = canvas = scene = camera = geometry = material = undefined;
    };
    const fallback = () => { failed = true; release(); setState("fallback"); };
    function lost(event: Event) {
      event.preventDefault();
      // Keep the CSS version for this visit instead of repeatedly retrying a
      // failing GPU and leaving a broken canvas in the banner or footer.
      fallback();
    }
    const paint = () => {
      if (!renderer || !scene || !camera || !material || !host.clientWidth || !host.clientHeight) return false;
      try {
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uDark.value = document.documentElement.classList.contains("dark") ? 1 : 0;
        renderer.render(scene, camera);
        return true;
      } catch { fallback(); return false; }
    };
    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || document.hidden || motion.matches || !renderer) return;
      elapsed += Math.min(now - lastFrame, 100) / 1000;
      lastFrame = now;
      // The soft haze needs only 30 painted frames per second.
      if (now - lastPaint >= 1000 / 30) {
        lastPaint = now;
        if (!paint()) return;
      }
      raf = requestAnimationFrame(frame);
    };
    const size = () => {
      if (!renderer || !canvas || !material) return;
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      // Bound the actual drawing buffer, including on high-DPI screens.
      const scale = Math.min(1, Math.sqrt(300000 / (w * h)));
      const width = Math.max(1, Math.floor(w * scale));
      const height = Math.max(1, Math.floor(h * scale));
      if (canvas.width !== width || canvas.height !== height) renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(canvas.width, canvas.height);
    };
    const initialize = async () => {
      if (disposed || initializing || failed || simple.matches || renderer) return;
      initializing = true;
      try {
        const THREE = await import("three");
        if (disposed || simple.matches || !visible || document.hidden) return;
        canvas = document.createElement("canvas");
        canvas.className = styles.canvas;
        canvas.addEventListener("webglcontextlost", lost);
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
        renderer.setPixelRatio(1);
        scene = new THREE.Scene();
        camera = new THREE.Camera();
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uTime: { value: elapsed },
          uDark: { value: document.documentElement.classList.contains("dark") ? 1 : 0 },
        } });
        scene.add(new THREE.Mesh(geometry, material));
        size();
        host.appendChild(canvas);
        sync();
      } catch { if (!disposed) fallback(); }
      finally { initializing = false; }
    };
    function sync() {
      stop();
      if (disposed || !host) return;
      if (simple.matches) { release(); setState("css"); return; }
      if (failed) { setState("fallback"); return; }
      if (!visible || document.hidden || !host.clientWidth || !host.clientHeight) { setState(renderer ? "paused" : "css"); return; }
      if (!renderer) { void initialize(); return; }
      if (!paint()) return;
      setState("webgl");
      if (!motion.matches) { lastFrame = performance.now(); lastPaint = lastFrame; raf = requestAnimationFrame(frame); }
    }
    const resize = () => {
      try { size(); sync(); } catch { fallback(); }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    io.observe(host);
    const themeObserver = new MutationObserver(sync);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    simple.addEventListener("change", sync);

    return () => {
      disposed = true;
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      simple.removeEventListener("change", sync);
      release();
    };
  }, []);

  return <div ref={hostRef} data-nebula data-nebula-state="css" aria-hidden="true" className={styles.background} />;
}
