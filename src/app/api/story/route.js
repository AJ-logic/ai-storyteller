import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { prompt, history, choice } = await req.json();

  const model = "gpt-4o-mini";
  const temperature = 0.8;
  const max_tokens = 100;

  const system = {
    role: "system",
    content:
      "You are an imaginative storyteller. Only generate the next short paragraph of the story. Keep it vivid and under 4 sentences. Always end with a natural stopping point.",
  };

  const messages = [system];

  if (!history && prompt) {
    // Initial story
    messages.push({
      role: "user",
      content: `Begin a fantasy story based on: "${prompt}". Only 2 or 3 paragraphs.`,
    });
  } else if (history && choice) {
    // Continue story from choice
    messages.push({
      role: "user",
      content: `Here is the story so far:\n"""${history}"""\nThe user chooses: "${choice}". Continue the story in 2 or 3 short paragraphs.`,
    });
  } else {
    return NextResponse.json(
      { error: "Missing required prompt or choice." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages,
        temperature,
        max_tokens,
        stop: ["\n\n"],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let full = response.data.choices[0].message.content.trim();

    // Trim to last complete sentence
    const lastPeriod = full.lastIndexOf(".");
    const clean = lastPeriod !== -1 ? full.slice(0, lastPeriod + 1) : full;

    return NextResponse.json({ story: clean });
  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
