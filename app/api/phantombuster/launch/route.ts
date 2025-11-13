import { NextResponse } from "next/server";

async function pbFetch(path: string, init?: RequestInit) {
  const key = process.env.PHANTOMBUSTER_API_KEY;
  if (!key) throw new Error("Missing PHANTOMBUSTER_API_KEY env var");

  const headers = {
    "Content-Type": "application/json",
    "X-Phantombuster-Key-1": key,
    ...(init?.headers || {})
  };

  const res = await fetch(`https://api.phantombuster.com/api/v2${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`PB API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, arguments: args = {}, maxDuration = 600 } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId required" }, { status: 400 });
    }

    const payload = { id: agentId, arguments: args, maxDuration };
    const data = await pbFetch(`/agents/launch`, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Launch failed" },
      { status: 500 }
    );
  }
}
