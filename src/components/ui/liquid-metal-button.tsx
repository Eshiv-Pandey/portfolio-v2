"use client";

// Adapted from johuniq's MIT Liquid Metal Button public preview.
// https://21st.dev/@johuniq/components/liquid-metal-button
// See liquid-metal-button.LICENSE.txt. Paper Shaders retains its Apache license.
import { useEffect, useRef } from "react";
import type { ShaderMount } from "@paper-design/shaders";
import styles from "./liquid-metal-button.module.css";

interface LiquidMetalButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  expanded?: boolean;
}

export function LiquidMetalButton({ label, onClick, href, expanded }: LiquidMetalButtonProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const shaderRef = useRef<ShaderMount | null>(null);
  const hovered = useRef(false);
  const reduced = useRef(false);
  const pulseTimer = useRef(0);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      reduced.current = preference.matches;
      shaderRef.current?.setSpeed(reduced.current ? 0 : hovered.current ? 1 : 0.6);
    };
    updateMotion();
    preference.addEventListener("change", updateMotion);
    void import("@paper-design/shaders").then(({ ShaderMount, liquidMetalFragmentShader }) => {
      if (disposed || !host) return;
      try {
        shaderRef.current = new ShaderMount(host, liquidMetalFragmentShader, {
          u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.3, u_shiftBlue: 0.3,
          u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1,
          u_offsetX: 0.1, u_offsetY: -0.1, u_colorBack: [0, 0, 0, 1],
          u_colorTint: [0, 0, 0, 0], u_isImage: false, u_fit: 0,
          u_rotation: 0, u_originX: 0.5, u_originY: 0.5,
          u_worldWidth: 0, u_worldHeight: 0,
        }, undefined, reduced.current ? 0 : 0.6, 1000, 1, 65536);
        // ShaderMount pauses its animation when offscreen or the tab is hidden.
      } catch {
        host.replaceChildren();
      }
    }).catch(() => undefined);
    return () => {
      disposed = true;
      window.clearTimeout(pulseTimer.current);
      preference.removeEventListener("change", updateMotion);
      shaderRef.current?.dispose();
      shaderRef.current = null;
    };
  }, []);

  const enter = () => {
    hovered.current = true;
    shaderRef.current?.setSpeed(reduced.current ? 0 : 1);
  };
  const leave = () => {
    hovered.current = false;
    shaderRef.current?.setSpeed(reduced.current ? 0 : 0.6);
  };
  const activate = () => {
    if (!reduced.current) {
      shaderRef.current?.setSpeed(2.4);
      window.clearTimeout(pulseTimer.current);
      pulseTimer.current = window.setTimeout(() => shaderRef.current?.setSpeed(hovered.current ? 1 : 0.6), 300);
    }
    onClick?.();
  };
  const content = <>
    <span ref={hostRef} className={styles.metal} aria-hidden="true" />
    <span className={styles.surface} aria-hidden="true" />
    <span className={styles.label}>{label}</span>
  </>;
  const interaction = { onPointerEnter: enter, onPointerLeave: leave, onFocus: enter, onBlur: leave, onClick: activate };

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.button} {...interaction}>{content}</a>
  ) : (
    <button type="button" aria-expanded={expanded} className={styles.button} {...interaction}>{content}</button>
  );
}
