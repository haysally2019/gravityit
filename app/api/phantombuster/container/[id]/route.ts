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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await pbFetch(`/containers/fetch?id=${params.id}`);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fetch failed" },
      { status: 500 }
    );
  }
}
