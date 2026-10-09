import { readFile, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import {
  COLLECTIONS,
  STUDIO_ENABLED,
  collectionPath,
  isCollectionKey,
} from "@/lib/studio";

/**
 * The Content Studio's read/write endpoint. It only functions during local
 * development (see `@/lib/studio`); a production build answers every method
 * with 404, so the deployed site has no writable surface.
 *
 * GET  → every editable collection and its current rows.
 * PUT  → `{ collection, data }`, validated against the allowlist, written back
 *        to that collection's JSON file as formatted JSON.
 */

export const dynamic = "force-dynamic";

function disabled() {
  return new NextResponse("Not found", { status: 404 });
}

export async function GET() {
  if (!STUDIO_ENABLED) return disabled();

  const collections = await Promise.all(
    (Object.keys(COLLECTIONS) as (keyof typeof COLLECTIONS)[]).map(
      async (key) => {
        const raw = await readFile(collectionPath(key), "utf8");
        return [key, JSON.parse(raw)] as const;
      }
    )
  );

  return NextResponse.json({
    meta: COLLECTIONS,
    data: Object.fromEntries(collections),
  });
}

export async function PUT(request: Request) {
  if (!STUDIO_ENABLED) return disabled();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  const { collection, data } =
    (body as { collection?: unknown; data?: unknown }) ?? {};

  if (!isCollectionKey(collection)) {
    return NextResponse.json(
      { error: "Unknown collection." },
      { status: 400 }
    );
  }
  if (!Array.isArray(data)) {
    return NextResponse.json(
      { error: "`data` must be an array of rows." },
      { status: 400 }
    );
  }

  // Pretty-print with a trailing newline so the file reads well in a diff and
  // matches what an editor would leave behind.
  const json = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(collectionPath(collection), json, "utf8");

  return NextResponse.json({ ok: true, count: data.length });
}
