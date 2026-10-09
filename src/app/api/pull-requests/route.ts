import { NextResponse } from "next/server";

import { PULL_REQUESTS_REVALIDATE, getPullRequests } from "@/lib/pull-requests";

/**
 * Replaces the template's `/api/github` proxy, which returned 401 unless a
 * GITHUB_TOKEN was configured and took the whole open-source section down
 * with it. The unauthenticated REST search serves the same data; a token, if
 * present, only raises the rate limit.
 */
export async function GET() {
  try {
    const data = await getPullRequests();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${PULL_REQUESTS_REVALIDATE}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Failed to load pull requests", error);

    return NextResponse.json(
      { error: "Unable to load pull requests right now." },
      { status: 502 }
    );
  }
}
