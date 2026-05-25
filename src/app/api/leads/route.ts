import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

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

export async function GET(req: Request) {
  if (!validateAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!convex) {
    return NextResponse.json({ error: "Database not configured on server" }, { status: 500 });
  }

  try {
    const list = await convex.query(api.leads.list);
    return NextResponse.json(list);
  } catch (error) {
    console.error("API GET Leads failed:", error);
    return NextResponse.json({ error: "Failed to list leads" }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${cleanName}-${randomSuffix}`;
}

export async function POST(req: Request) {
  if (!validateAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!convex) {
    return NextResponse.json({ error: "Database not configured on server" }, { status: 500 });
  }

  try {
    const body = await req.json();
    let leadData = "";
    
    const {
      companyName,
      contactPerson,
      industry,
      website,
      offerAngle,
      painBucket,
      agentGoal,
      forbiddenClaims,
      handoffInstructions,
      tone,
      sourceUrls,
      notes,
    } = body;
    
    const businessName = companyName || "Unknown Business";
    const slug = generateSlug(businessName);

    if (body.leadData && typeof body.leadData === "string") {
      // Use raw text block if supplied directly
      leadData = body.leadData;
    } else {
      if (!companyName && !contactPerson && !industry && !notes && !agentGoal) {
        return NextResponse.json(
          { error: "Missing required fields. Provide either 'leadData' or structured fields." },
          { status: 400 }
        );
      }

      const formatArray = (arr: any) => Array.isArray(arr) && arr.length > 0 ? arr.join(", ") : "N/A";

      leadData = `Company Name: ${companyName || "N/A"}
Contact Person: ${contactPerson || "N/A"}
Industry: ${industry || "N/A"}
Website: ${website || "N/A"}
Source URLs (For Context): ${formatArray(sourceUrls)}

### Business Context:
Offer Angle / Value Proposition: ${offerAngle || "N/A"}
Customer Pain Points: ${painBucket || "N/A"}
Additional Notes: ${notes || "N/A"}

### Agent Role & Guidelines:
Agent Goal: ${agentGoal || "N/A"}
Desired Tone: ${tone || "Professional and empathetic"}
Forbidden Claims (DO NOT SAY THESE): ${formatArray(forbiddenClaims)}
Handoff Instructions: ${handoffInstructions || "N/A"}`;
    }

    // Generate UUID and save
    const uuid = crypto.randomUUID();
    await convex.mutation(api.leads.create, { uuid, leadData, slug, businessName });

    // Build the dynamic URL using slug instead of UUID
    const origin = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    const demoUrl = `${origin.startsWith("http") ? "" : "http://"}${origin}/demo/${slug}`;

    return NextResponse.json(
      {
        message: "Demo lead created successfully",
        uuid,
        slug,
        demoUrl,
        leadData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST Lead failed:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
