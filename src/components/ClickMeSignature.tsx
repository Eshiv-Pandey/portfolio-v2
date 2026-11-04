import styles from "./name-intro.module.css";

// Original lettering, using the same open pen strokes as NameSignature.
const strokes = [
  "M74 23C62 11 35 17 28 36C16 63 32 80 57 66C69 59 76 50 82 43",
  "M78 61C86 45 106 12 99 10C90 8 82 34 80 56C77 74 89 72 101 57L111 39C102 59 103 74 116 66C126 58 129 49 138 44C128 36 111 50 113 64C114 78 133 67 144 51C158 31 173 7 166 10C155 16 148 48 143 68C154 50 166 45 165 53C161 63 160 63 175 67",
  "M115 28L116 26",
  "M194 48L186 69C196 48 210 39 207 51L202 68C210 48 224 42 221 56C216 72 228 70 237 58C251 52 254 42 246 44C237 45 232 61 240 68C248 74 268 64 280 53",
];

export function ClickMeSignature({ className }: { className?: string }) {
  return (
    <svg viewBox="16 5 270 78" className={className} aria-hidden="true" data-click-me-signature>
      {strokes.map((path, index) => (
        <path key={index} d={path} pathLength={1} className={`${styles.stroke} ${styles.staticStroke}`} />
      ))}
    </svg>
  );
}
