import { getRecentChangelogEntries } from "@/lib/changelog";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "4", 10);
    
    const entries = await getRecentChangelogEntries(limit);
    return NextResponse.json(entries);
  } catch (error) {
    console.warn("Error fetching changelog entries:", error);
    return NextResponse.json([], { status: 200 });
  }
}
