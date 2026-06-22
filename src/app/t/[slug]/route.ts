import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (convex) {
    try {
      const userAgent = req.headers.get("user-agent") || undefined;
      const referrer = req.headers.get("referer") || undefined;
      const country = req.headers.get("x-vercel-ip-country") || undefined;
      const timestamp = Date.now();

      await convex.mutation(api.clicks.record, {
        slug,
        timestamp,
        userAgent,
        referrer,
        country,
      });
    } catch (err) {
      console.error("Failed to record click in tracker:", err);
    }
  }

  // Determine host and redirect to /demo/[slug]
  const host = req.headers.get("host") || "localhost:3000";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/demo/${slug}`;

  return NextResponse.redirect(redirectUrl, 302);
}
