import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = process.env.NEXT_PUBLIC_CONVEX_URL
  ? new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)
  : null;

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    if (!convex) {
      return NextResponse.json(
        { error: "Convex not initialized on server" },
        { status: 500 }
      );
    }

    // Verify lead exists
    const lead = await convex.query(api.leads.getBySlug, { slug });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Build the system instruction using the lead data
    const businessName = lead.businessName || "your company";
    const systemInstruction = {
      parts: [
        {
          text: `You are a highly capable, professional, and friendly AI receptionist built specifically for ${businessName}.
You are currently speaking to the OWNER of ${businessName}, who is testing your capabilities.

Here is the context about the business you work for:
${lead.leadData}

### Core Directive:
1. Greet the business owner warmly. 
2. Acknowledge that you are their new AI voice agent.
3. Enthusiastically invite them to roleplay as a customer calling ${businessName} so you can demonstrate how well you handle inquiries.
4. Once they start roleplaying as a customer, switch completely into "Receptionist Mode" and assist them based on the business data provided above.

### Voice & Delivery Instructions (CRITICAL):
- Speak slowly with a warm, measured, and unhurried pace.
- Use natural pauses by inserting ellipses (...) mid-sentence to sound thoughtful.
- Occasionally use brief filler words like "Um..." or "Well," or use a dash (-) to emulate a human gathering their thoughts. 
- Avoid "verbal diarrhea". Keep your responses extremely concise (1 to 2 short sentences max) and invite them to speak. 
- Sound energetic but empathetic. Adapt your tone to be reassuring.`,
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
      leadId: lead._id,
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
