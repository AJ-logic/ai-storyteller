import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { context } = await req.json();

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant generating concise story decisions.",
    },
    {
      role: "user",
      content: `The story so far is:\n"""${context}"""\nGive exactly 3 short choices the reader could pick next. Each should be 5-10 words. Return them as plain text, one per line, no markdown.`,
    },
  ];

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.9,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const raw = res.data.choices[0].message.content.trim();
    return NextResponse.json({ choices: raw });
  } catch (error) {
    console.error("Choice API error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to generate choices" },
      { status: 500 }
    );
  }
}
