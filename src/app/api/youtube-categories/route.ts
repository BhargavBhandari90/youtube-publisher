
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: NextRequest) {
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY, // Use a separate API key for public data
    });

    const res = await youtube.videoCategories.list({
      part: ["snippet"],
      regionCode: "US", // You might want to make this configurable
    });

    return new NextResponse(JSON.stringify(res.data.items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching YouTube categories:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch YouTube categories" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
