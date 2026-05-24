import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    if (!convex) {
      return NextResponse.json(
        { error: "Convex not initialized on server" },
        { status: 500 }
      );
    }

    // Verify lead exists
    const lead = await convex.query(api.leads.get, { uuid: leadId });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Build the system instruction using the lead data
    const systemInstruction = {
      parts: [
        {
          text: `You are an AI sales assistant for DataLeads India, representing a Chartered Accountant. 
You are speaking to the owner of a newly registered GST business.
Here is the data about their business:
${lead.leadData}

Your goal is to offer your CA services for GST filing, accounting, and compliance.
Keep your responses concise, professional, and persuasive. Do not break character. Do not acknowledge that you are an AI.`,
        },
      ],
    };

    // Note: For MVP we pass the API key to the client. 
    // In production, implement a WebSocket Proxy on the server.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment variables.");
    }

    return NextResponse.json({
      apiKey: apiKey || "MOCK_KEY",
      config: {
        systemInstruction,
        model: "models/gemini-3.1-flash-live-preview",
      },
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate configuration" },
      { status: 500 }
    );
  }
}
