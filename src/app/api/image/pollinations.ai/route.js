import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const queryParams = new URLSearchParams({ width: 400, height: 200 });
    const encodedPrompt = encodeURIComponent(prompt);

    const imageURL = `https://image.pollinations.ai/prompt/${encodedPrompt}?${queryParams.toString()}`;

    return NextResponse.json({ image: imageURL });
  } catch (error) {
    console.error(
      "Image generation failed:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
