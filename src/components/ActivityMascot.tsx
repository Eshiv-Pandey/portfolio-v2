export function ActivityMascot({ kind }: { kind: "github" | "leetcode" }) {
  return (
    <svg viewBox="0 0 96 80" aria-hidden="true" shapeRendering="crispEdges">
      {kind === "github" ? (
        <>
          <path fill="#101014" d="M18 26V10h6v4h6v6h36v-6h6v-4h6v16h6v30h-6v6H66v6H54v8H42V64H30v-6H18v-6h-6V32h6Z" />
          <path fill="#f4efd9" d="M24 32h48v6h6v12h-6v6H24v-6h-6V38h6Z" />
          <path fill="#101014" d="M30 38h6v12h-6Zm30 0h6v12h-6Z" />
          <path fill="#f4efd9" d="M24 18h6v6h-6Zm42 0h6v6h-6Z" />
          <path fill="#101014" d="M12 56h6v6h6v6h12v6H18v-6h-6v-6H6V50h6Z" />
          <path fill="#ff65c7" d="M42 50h12v6H42Z" />
          <path fill="#101014" d="M60 64h6v12h-6Zm-30 0h6v12h-6Z" />
          <path fill="#fff" d="M30 26h6v6h-6ZM6 20h6v6H6Zm78 42h6v6h-6Z" />
        </>
      ) : (
        <>
          <path fill="#101014" d="M24 38V28h6v-6h18v6h6v10h6V26h-6V14h6V8h12v6h6v12h-6v8h6V14h6V8h12v6h6v12h-6v6h-6v10h6v24h-6v6H12v-6h6V44h6Z" transform="translate(-8 0)" />
          <path fill="#ffb74f" d="M48 38h12v-6h12v6h6v6h6v18h-6v8H24v-6h24Z" />
          <path fill="#e961ba" d="M18 38h6v-6h18v6h6v6h6v18h-6v6H24v-6h-6Z" />
          <path fill="#a52a82" d="M24 44h18v6h6v12H30v-6h-6Zm6 6v6h6v-6Z" />
          <path fill="#fff" d="M48 12h12v6h6v6h-6v6H48v-6h-6v-6h6Zm30 0h12v6h6v6h-6v6H78v-6h-6v-6h6Z" />
          <path fill="#101014" d="M54 18h6v6h-6Zm30 0h6v6h-6ZM66 50h6v6h6v-6h6v6h-6v6h-6v-6h-6Z" />
          <path fill="#ffc3ee" d="M24 38h18v6H24Zm30 6h6v6h-6Z" />
        </>
      )}
      <path fill="#fff1a8" d="M8 76h80v2H8Z" />
    </svg>
  );
}
