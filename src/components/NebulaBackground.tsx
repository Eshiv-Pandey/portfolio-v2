"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * A soft animated nebula that fills the footer behind its content, replacing
 * the flat board colour. It rides a single full-screen three.js shader plane
 * (three is already a dependency; no react-three-fiber) and is theme-aware: a
 * warm cream/marigold/teal/rose haze in light mode, a deeper glow on near-black
 * in dark mode, so the footer's own ink stays readable in both.
 *
 * Under `prefers-reduced-motion` it renders a single still frame instead of
 * animating, and if WebGL is unavailable the parent's own background shows
 * through unharmed.
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
  const reducedMotion = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    // Loaded lazily so three never lands in the initial bundle for the rest of
    // the page — the footer is far below the fold.
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      } catch {
        return; // No WebGL — the parent background stays as-is.
      }
      renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const uniforms = {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uDark: {
          value: document.documentElement.classList.contains("dark") ? 1 : 0,
        },
      };
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
      );
      scene.add(mesh);

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = host;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(w, h, false);
        uniforms.uResolution.value.set(w, h);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // Follow theme flips without a remount.
      const themeObs = new MutationObserver(() => {
        uniforms.uDark.value = document.documentElement.classList.contains("dark") ? 1 : 0;
        if (reducedMotion) renderer.render(scene, camera);
      });
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const start = performance.now();
      const frame = () => {
        uniforms.uTime.value = (performance.now() - start) / 1000;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      if (reducedMotion) renderer.render(scene, camera);
      else frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        themeObs.disconnect();
        mesh.geometry.dispose();
        (mesh.material as import("three").ShaderMaterial).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0" />;
}
