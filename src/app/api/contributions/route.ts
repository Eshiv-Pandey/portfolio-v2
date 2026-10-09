import { NextResponse } from "next/server";

import { CONTRIBUTIONS_REVALIDATE, getContributions } from "@/lib/github";

/**
 * Route handlers aren't cached in Next 16, so freshness is controlled by the
 * `next: { revalidate }` on the upstream fetch inside `getContributions` plus
 * the CDN header below. The username is fixed rather than read from a query
 * param — this is one person's portfolio, and a `?username=` would turn the
 * deployment into an open proxy for a third-party API.
 */
export async function GET() {
  try {
    const data = await getContributions();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${CONTRIBUTIONS_REVALIDATE}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Failed to load GitHub contributions", error);

    return NextResponse.json(
      { error: "Unable to load GitHub contributions right now." },
      { status: 502 }
    );
  }
}
