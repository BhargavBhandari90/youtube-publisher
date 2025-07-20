import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        const fullPrompt = `You are a helpful assistant that returns video metadata for YouTube.

Given the following YouTube video prompt, generate:

- 1 optimized title
- 1 compelling description (up to 500 characters, no hashtags)
- A list of 15 relevant tags (no # symbol)
- A YouTube category

Respond ONLY with valid JSON (no markdown or \`\`\`json), like this:{
  "title": "",
  "description": "",
  "tags": [],
  "category": ""
}

Prompt: ${prompt}
`;
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        if (!response || !response.text) {
            return new NextResponse(
                JSON.stringify({ error: "No response from Gemini" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return NextResponse.json(JSON.parse(response.text));
    } catch (error) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ error: "Failed to generate response" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}