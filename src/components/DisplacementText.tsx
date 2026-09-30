
"use client";


import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type DisplacementTextProps = {
  text?: string;
  fontSize?: number;
  font?: string;
  color?: string;
  lightColor?: string;
  darkColor?: string;
  className?: string;
  /**
   * Fraction of the container's width the word should span, 0-1. When set, the
   * font size is derived from the container instead of `fontSize` — see
   * `fontSizeToSpan`. Leave it off to keep an exact size.
   */
  fitWidth?: number;
};

/** Square texture the word is drawn into, then mapped across the whole plane. */
const TEXTURE_SIZE = 2048;
/** World-space size of the plane the texture is mapped onto. */
const PLANE_SIZE = 30;
/** Half-height of the orthographic frustum, in world units. */
const CAMERA_DISTANCE = 12;

/**
 * How many px wide the word renders per 1px of font size.
 *
 * Measured rather than assumed: it depends on the glyphs and on whichever font
 * the browser actually resolved, and the whole sizing calculation hangs off it.
 */
const measureWidthPerPx = (text: string, font: string): number => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) {
    return 0;
  }
  const probe = 100;
  ctx.font = `bold ${probe}px ${font}`;
  return ctx.measureText(text).width / probe;
};

/**
 * The font size that makes the word span `span` px across a container `height`
 * px tall.
 *
 * The chain: the frustum is fixed at +-CAMERA_DISTANCE vertically, so the scale
 * is `height / (2 * CAMERA_DISTANCE)` px per world unit; the plane carries the
 * whole texture across PLANE_SIZE units; and the plane is turned 45 degrees, so
 * only cos(45) of the word's length lands on the horizontal axis. Result is
 * clamped to the texture, which the word would otherwise overrun and be cut off
 * inside.
 */
const fontSizeToSpan = (
  span: number,
  height: number,
  widthPerPx: number
): number => {
  const pxPerTexturePx =
    (PLANE_SIZE / TEXTURE_SIZE) *
    Math.SQRT1_2 *
    (height / (CAMERA_DISTANCE * 2));

  const texturePx = Math.min(span / pxPerTexturePx, TEXTURE_SIZE * 0.96);
  return texturePx / widthPerPx;
};

const createTextTexture = (
  text: string,
  size: number,
  font: string,
  color: string
): THREE.Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = `bold ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const vertexShader = `
  varying vec2 vUv;
  uniform vec3 uDisplacement;

  float easeInOutCubic(float x) {
    return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    vUv = uv;
    vec3 displaced = position;

    vec4 localPosition = vec4(position, 1.0);
    vec4 worldPosition = modelMatrix * localPosition;

    float dist = length(uDisplacement - worldPosition.rgb);
    float minDistance = 3.0;

    if (dist < minDistance) {
      float mapped = map(dist, 0.0, minDistance, 1.0, 0.0);
      float val = easeInOutCubic(mapped);
      displaced.z += val;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = color;
  }
`;

const DisplacementText = ({
  text = "ESHIV",
  fontSize = 200,
  font = "sans-serif",
  color,
  lightColor = "#000000",
  darkColor = "#ffffff",
  className,
  fitWidth,
}: DisplacementTextProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || container.clientWidth || 1;
    const height = rect.height || container.clientHeight || 1;

    if (height === 0) {
      return;
    }

    const widthPerPx = fitWidth ? measureWidthPerPx(text, font) : 0;
    const resolveFontSize = (w: number, h: number) =>
      fitWidth && widthPerPx > 0
        ? fontSizeToSpan(fitWidth * w, h, widthPerPx)
        : fontSize;

    let activeFontSize = resolveFontSize(width, height);

    const scene = new THREE.Scene();
    scene.background = null;

    const cameraDistance = CAMERA_DISTANCE;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      -cameraDistance * aspect,
      cameraDistance * aspect,
      cameraDistance,
      -cameraDistance,
      0.01,
      1000
    );

    camera.position.set(0, -10, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, 100, 100);
    const getActiveColor = () => {
      if (color) {
        return color;
      }
      return document.documentElement.classList.contains("dark")
        ? darkColor
        : lightColor;
    };

    let currentColor = getActiveColor();
    let textTexture = createTextTexture(text, activeFontSize, font, currentColor);

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: textTexture },
        uDisplacement: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const plane = new THREE.Mesh(geometry, shaderMaterial);
    plane.rotation.z = Math.PI / 4;
    scene.add(plane);

    const hitPlaneGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
    const hitPlaneMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hitPlane = new THREE.Mesh(hitPlaneGeometry, hitPlaneMaterial);
    hitPlane.name = "hit";
    scene.add(hitPlane);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const [intersection] = raycaster.intersectObject(hitPlane);
      if (!intersection) {
        return;
      }

      (shaderMaterial.uniforms.uDisplacement.value as THREE.Vector3).copy(
        intersection.point
      );
    };

    container.addEventListener("pointermove", onPointerMove);

    const replaceTexture = (nextColor: string, nextSize: number) => {
      const nextTexture = createTextTexture(text, nextSize, font, nextColor);
      nextTexture.needsUpdate = true;
      shaderMaterial.uniforms.uTexture.value = nextTexture;
      textTexture.dispose();
      textTexture = nextTexture;
      currentColor = nextColor;
      activeFontSize = nextSize;
    };

    const handleResize = () => {
      const nextRect = container.getBoundingClientRect();
      if (nextRect.height === 0) {
        return;
      }
      const nextAspect = nextRect.width / nextRect.height;
      camera.left = -cameraDistance * nextAspect;
      camera.right = cameraDistance * nextAspect;
      camera.top = cameraDistance;
      camera.bottom = -cameraDistance;
      camera.updateProjectionMatrix();
      renderer.setSize(nextRect.width, nextRect.height, false);

      // A fitted word is sized against the container, so a resize has to redraw
      // the texture. Only when it actually moved — redrawing a 2048px canvas on
      // every pixel of a drag would be wasteful, and sub-percent changes are
      // invisible anyway.
      const nextSize = resolveFontSize(nextRect.width, nextRect.height);
      if (Math.abs(nextSize - activeFontSize) > activeFontSize * 0.01) {
        replaceTexture(currentColor, nextSize);
      }
    };

    window.addEventListener("resize", handleResize);

    let animationId = 0;
    const renderScene = () => {
      animationId = window.requestAnimationFrame(renderScene);
      renderer.render(scene, camera);
    };

    renderScene();

    let observer: MutationObserver | undefined;
    let mediaQueryCleanup: (() => void) | undefined;

    if (!color) {
      const handleThemeChange = () => {
        const nextColor = getActiveColor();
        if (nextColor === currentColor) {
          return;
        }
        replaceTexture(nextColor, activeFontSize);
      };

      observer = new MutationObserver(handleThemeChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      if (window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const mediaHandler = () => handleThemeChange();

        if (typeof mediaQuery.addEventListener === "function") {
          mediaQuery.addEventListener("change", mediaHandler);
          mediaQueryCleanup = () => mediaQuery.removeEventListener("change", mediaHandler);
        } else if (typeof mediaQuery.addListener === "function") {
          mediaQuery.addListener(mediaHandler);
          mediaQueryCleanup = () => mediaQuery.removeListener(mediaHandler);
        }
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(animationId);
      observer?.disconnect();
      mediaQueryCleanup?.();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      textTexture.dispose();
      geometry.dispose();
      hitPlaneGeometry.dispose();
      hitPlaneMaterial.dispose();
      shaderMaterial.dispose();
    };
  }, [text, fontSize, font, color, lightColor, darkColor, fitWidth]);

  return (
    <div ref={containerRef} className={cn("relative h-200 w-full", className)} />
  );
};

export default DisplacementText;

