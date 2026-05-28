import { NextResponse } from "next/server";

const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_BASE = "https://api.cal.com/v2";
const CAL_HEADERS = {
  "Content-Type": "application/json",
  "cal-api-version": "2024-08-13",
  Authorization: `Bearer ${CAL_API_KEY}`,
};

const EVENT_TYPE_SLUG = "30min";
const USERNAME = "kabir-aura-mpaprf";

export async function POST(req: Request) {
  try {
    const { action, ...params } = await req.json();

    if (!CAL_API_KEY) {
      return NextResponse.json(
        { error: "CAL_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (action === "get_slots") {
      return await getSlots(params);
    }

    if (action === "create_booking") {
      return await createBooking(params);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Cal.com API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

async function getSlots(params: { date?: string }) {
  const date = params.date || new Date().toISOString().split("T")[0];

  const url = `${CAL_BASE}/slots?eventTypeSlug=${EVENT_TYPE_SLUG}&username=${USERNAME}&start=${date}T00:00:00Z`;
  const res = await fetch(url, { headers: CAL_HEADERS });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to fetch slots" },
      { status: res.status }
    );
  }

  // Flatten slots from the date-keyed response and take the next 10
  const slots: string[] = [];
  const slotsByDate = data.slots || {};
  for (const dateKey of Object.keys(slotsByDate)) {
    for (const slot of slotsByDate[dateKey]) {
      slots.push(slot.time);
      if (slots.length >= 10) break;
    }
    if (slots.length >= 10) break;
  }

  return NextResponse.json({ slots });
}

async function createBooking(params: {
  start: string;
  name: string;
  email: string;
  timeZone?: string;
}) {
  const { start, name, email, timeZone = "Asia/Kolkata" } = params;

  if (!start || !name || !email) {
    return NextResponse.json(
      { error: "Missing required fields: start, name, email" },
      { status: 400 }
    );
  }

  const res = await fetch(`${CAL_BASE}/bookings`, {
    method: "POST",
    headers: CAL_HEADERS,
    body: JSON.stringify({
      eventTypeSlug: EVENT_TYPE_SLUG,
      username: USERNAME,
      start,
      attendee: { name, email, timeZone },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to create booking" },
      { status: res.status }
    );
  }

  return NextResponse.json({
    bookingUid: data.data?.uid,
    start: data.data?.start,
    status: data.data?.status,
  });
}
