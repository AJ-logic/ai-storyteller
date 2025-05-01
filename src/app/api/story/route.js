import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { prompt } = await req.json();

  const messages = [
    {
      role: "system",
      content: "You are a magical storyteller for children.",
    },
    {
      role: "user",
      content: `Please write a short story about: ${prompt}`,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const story = response.data.choices[0].message.content;
    return NextResponse.json({ story });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
