import { NextResponse } from "next/server";

import { LEETCODE_REVALIDATE, getLeetCodeProfile } from "@/lib/leetcode";

/**
 * LeetCode's GraphQL endpoint sends no CORS headers, so the browser cannot
 * call it directly — this route exists to make that request server-side.
 * No credentials are involved; the profile data is public.
 */
export async function GET() {
  try {
    const data = await getLeetCodeProfile();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${LEETCODE_REVALIDATE}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("Failed to load LeetCode profile", error);

    return NextResponse.json(
      { error: "Unable to load LeetCode activity right now." },
      { status: 502 }
    );
  }
}
