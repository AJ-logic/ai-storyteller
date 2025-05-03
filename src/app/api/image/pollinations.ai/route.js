import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { prompt } = await req.json();
  const messages = [
    {
      role: "system",
      content:
        "You are a prompt engineer. Convert the following short story paragraph into a vivid visual scene prompt suitable for a text-to-image AI. Keep it concise, and describe only visible elements.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const visualPrompt = res.data.choices[0].message.content.trim();
    const queryParams = new URLSearchParams({ width: 400, height: 200 });
    const encodedPrompt = encodeURIComponent(visualPrompt);

    const imageURL = `https://image.pollinations.ai/prompt/${encodedPrompt}?${queryParams.toString()}`;

    return NextResponse.json({ image: imageURL });
  } catch (error) {
    console.log(error);
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
