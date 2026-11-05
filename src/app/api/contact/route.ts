import { SITE_URL } from "@/lib/site";

const RECIPIENT = "eshivpandey18@gmail.com";
const MAX_BODY_LENGTH = 12288;

function failure(error: string, status: number) {
  return Response.json({ success: false, error }, { status });
}

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_LENGTH) {
      return failure("Your note is too long. Please shorten it and try again.", 413);
    }
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return failure("Please enter your name, email address, and note.", 400);
    }
    input = parsed as Record<string, unknown>;
  } catch {
    return failure("Your note could not be read. Please try again.", 400);
  }

  if (typeof input._honey === "string" && input._honey.trim()) {
    return Response.json({ success: true });
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";
  if (!name || name.length > 80 || !message || message.length > 2000) {
    return failure("Please enter your name and a note of up to 2,000 characters.", 400);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return failure("Please enter a valid email address so I can reply.", 400);
  }

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        _replyto: email,
        _subject: "New Submission from Portfolio",
        _template: "table",
        _captcha: "false",
        _url: `${SITE_URL}/contact`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || (result?.success !== true && result?.success !== "true")) {
      if (response.status === 429) {
        return failure("Too many notes right now. Please try again in a few minutes.", 429);
      }
      return failure("Your note could not be sent right now. Please try again.", 502);
    }
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return failure("Sending your note took too long. Please try again.", 504);
    }
    return failure("Your note could not be sent right now. Please try again.", 502);
  }
}
