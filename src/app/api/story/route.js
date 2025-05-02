import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { prompt, max_tokens } = await req.json();

  const messages = [
    {
      role: "system",
      content: "You are a magical storyteller for children.",
    },
    {
      role: "user",
      content: `Write a two or three, complete short paragraph about: ${prompt}. End your thought properly and completely with the dot.`,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens,
        stop: ["\n\n"],
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
    console.log("error: ", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
