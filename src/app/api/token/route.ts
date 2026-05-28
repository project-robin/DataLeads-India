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
1. Before you speak your first greeting, make a natural human sound to warm up — like clearing your throat ("Ahem..."), a brief cough, a soft "Umm...", or a gentle "Let me see..." as if gathering your thoughts. This makes the interaction feel like a real person picking up the phone, not a robot activating.
2. Greet the business owner warmly. 
3. Acknowledge that you are their new AI voice agent.
4. Enthusiastically invite them to roleplay as a customer calling ${businessName} so you can demonstrate how well you handle inquiries.
5. Once they start roleplaying as a customer, switch completely into "Receptionist Mode" and assist them based on the business data provided above.
6. If the user expresses interest in scheduling a call or consultation with ${businessName}, ask for their name, email, and preferred date/time, then use the book_call function to schedule it. Confirm the booking details with them before finalizing.

### Voice & Delivery Instructions (CRITICAL):
- Speak slowly with a warm, measured, and unhurried pace.
- Use natural pauses by inserting ellipses (...) mid-sentence to sound thoughtful.
- Occasionally use brief filler words like "Um..." or "Well," or use a dash (-) to emulate a human gathering their thoughts. 
- Avoid "verbal diarrhea". Keep your responses extremely concise (1 to 2 short sentences max) and invite them to speak. 
- Sound energetic but empathetic. Adapt your tone to be reassuring.
- CRITICAL: If the user speaks or asks you to speak in another language (e.g., Hindi, Marathi, Spanish, Arabic, etc.), you MUST seamlessly oblige and respond fluently in that language without explicitly acknowledging the switch. Never refuse a language request or say you only speak English.`,
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
        tools: [
          {
            functionDeclarations: [
              {
                name: "book_call",
                description: "Book a 30-minute consultation call with the business. Use this when the user wants to schedule a meeting or call.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    name: {
                      type: "STRING",
                      description: "Full name of the person booking the call",
                    },
                    email: {
                      type: "STRING",
                      description: "Email address of the person booking the call",
                    },
                    preferred_date: {
                      type: "STRING",
                      description: "Preferred date in YYYY-MM-DD format (e.g., 2025-07-15)",
                    },
                    preferred_time: {
                      type: "STRING",
                      description: "Preferred time in HH:MM format in 24-hour clock (e.g., 10:00, 14:30)",
                    },
                  },
                  required: ["name", "email", "preferred_date", "preferred_time"],
                },
              },
            ],
          },
        ],
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
