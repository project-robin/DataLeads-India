import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

function validateAuth(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  const secretKey = process.env.API_SECRET_KEY || "demo_api_secret_token_123";
  return token === secretKey;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  if (!validateAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!convex) {
    return NextResponse.json({ error: "Database not configured on server" }, { status: 500 });
  }

  try {
    const { leadId } = await params;

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId in URL path" }, { status: 400 });
    }

    // 1. Get the lead by public uuid to find its internal _id
    const lead = await convex.query(api.leads.get, { uuid: leadId });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 2. Delete the lead using the internal _id
    await convex.mutation(api.leads.remove, { id: lead._id });

    return NextResponse.json({
      message: "Lead deleted successfully",
      uuid: leadId,
    });
  } catch (error) {
    console.error("API DELETE Lead failed:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
