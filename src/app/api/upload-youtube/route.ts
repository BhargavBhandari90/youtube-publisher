
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import { Readable } from "stream";

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  console.log('token', token);

  if (!token || !token.accessToken) {
    return new NextResponse(JSON.stringify({ error: "Unauthorizedwwww" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const videoFile = formData.get("video") as Blob;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = JSON.parse(formData.get("tags") as string);
    const category = formData.get("category") as string;

    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string,
    });

    const youtube = google.youtube({
      version: "v3",
      auth,
    });

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    const videoStream = new Readable();
    videoStream.push(videoBuffer);
    videoStream.push(null); // Indicate end of stream

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: category,
        },
        status: {
          privacyStatus: "private", // You can change this to 'public' or 'unlisted'
        },
      },
      media: {
        mimeType: videoFile.type,
        body: videoStream,
      },
    }, {
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / evt.bytesTotal) * 100;
        // You can log progress here or send it back to the client if needed
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      },
    });

    return new NextResponse(JSON.stringify({ message: "Video uploaded successfully", videoId: res.data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("YouTube upload error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to upload video" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
