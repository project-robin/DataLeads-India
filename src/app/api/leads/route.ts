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
    
    // Fallback to structured fields
    const { companyName, contactPerson, industry, notes } = body;
    const businessName = companyName || "Unknown Business";
    const slug = generateSlug(businessName);

    if (body.leadData && typeof body.leadData === "string") {
      // Use raw text block if supplied directly
      leadData = body.leadData;
    } else {
      if (!companyName && !contactPerson && !industry && !notes) {
        return NextResponse.json(
          { error: "Missing required fields. Provide either 'leadData' or structured fields ('companyName', 'contactPerson', etc.)" },
          { status: 400 }
        );
      }

      leadData = `Company Name: ${companyName || "N/A"}
Contact Person: ${contactPerson || "N/A"}
Industry: ${industry || "N/A"}
Notes/Pain Points: ${notes || "N/A"}`;
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
