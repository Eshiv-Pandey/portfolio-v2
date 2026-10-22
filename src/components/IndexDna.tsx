"use client";

import { useEffect, useRef } from "react";
import styles from "./index-dna.module.css";

const CELL = 6;
const BLUE = [59, 91, 217], YELLOW = [245, 197, 24];

/** The reference's blue-to-yellow pixel helix, turned into a quiet vertical rail. */
export function IndexDna({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastFrame = 0, phase = 0, width = 0, height = 0;

    function draw() {
      context!.clearRect(0, 0, width, height);
      const radius = width * 0.32;
      const pixels: { x: number; y: number; depth: number; color: number[]; rung: boolean }[] = [];
      const push = (u: number, angle: number, color: number[], position = 1, rung = false) => {
        const depth = Math.cos(angle) * position;
        pixels.push({ x: width / 2 + Math.sin(angle) * radius * position,
          y: CELL * 2 + u * (height - CELL * 4) + depth * CELL,
          depth: 0.5 + depth * 0.5, color, rung });
      };
      const turns = 2.3;
      const samples = Math.max(80, Math.ceil(height / 1.5));
      for (let strand = 0; strand < 2; strand++) {
        for (let i = 0; i <= samples; i++) {
          const u = i / samples;
          const angle = (u * turns + phase) * Math.PI * 2 + strand * Math.PI;
          push(u, angle, strand === 0 ? BLUE : YELLOW);
        }
      }
      const rungCount = Math.max(8, Math.floor((height - CELL * 4) / (CELL * 2.5)));
      for (let rung = 0; rung <= rungCount; rung++) {
        const u = rung / rungCount;
        const angle = (u * turns + phase) * Math.PI * 2;
        for (let step = 0; step <= 16; step++) {
          const progress = step / 16;
          const color = BLUE.map((value, channel) => Math.round(value + (YELLOW[channel] - value) * progress));
          push(u, angle, color, 1 - progress * 2, true);
        }
      }
      pixels.sort((a, b) => a.depth - b.depth);
      for (const pixel of pixels) {
        context!.globalAlpha = (pixel.rung ? 0.35 : 0.6) + pixel.depth * (pixel.rung ? 0.25 : 0.4);
        context!.fillStyle = `rgb(${pixel.color.join(",")})`;
        context!.fillRect(Math.floor(pixel.x / CELL) * CELL, Math.floor(pixel.y / CELL) * CELL, CELL - 1, CELL - 1);
      }
      context!.globalAlpha = 1;
    }

    function animate(now: number) {
      phase = (phase + Math.min(now - lastFrame, 50) * 0.000025) % 1;
      lastFrame = now;
      draw();
      frame = requestAnimationFrame(animate);
    }

    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      canvas!.dataset.animating = "false";
      if (!desktop.matches || document.hidden) return;
      draw();
      if (!paused && !reducedMotion.matches) {
        lastFrame = performance.now();
        canvas!.dataset.animating = "true";
        frame = requestAnimationFrame(animate);
      }
    }

    function resize() {
      const bounds = canvas!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      context!.imageSmoothingEnabled = false;
      sync();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    desktop.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      desktop.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return <canvas ref={canvasRef} data-index-dna aria-hidden="true" className={styles.dna} />;
}
