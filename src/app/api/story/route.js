import { NextResponse } from "next/server";
import axios from "axios";

// Global in-memory timestamp (not persistent across deployments)
let lastRequestTime = 0;

export async function POST(req) {
  const { prompt, history, choice } = await req.json();

  const now = Date.now();
  const waitTime = 20 * 1000; // 20 seconds

  // Enforce wait time between story generations
  if (now - lastRequestTime < waitTime) {
    const remaining = Math.ceil((waitTime - (now - lastRequestTime)) / 1000);
    return NextResponse.json(
      {
        error: `Please wait ${remaining}s before generating the next paragraph.`,
      },
      { status: 429 }
    );
  }

  lastRequestTime = now;

  const model = "gpt-4o-mini";
  const temperature = 0.8;
  const max_tokens = 300;

  const messages = [
    {
      role: "system",
      content:
        // "You are an imaginative storyteller. Only generate the next short paragraph of the story. Keep it vivid and under 4 sentences. Always end with a natural stopping point.",
        `You are an AI that writes creative stories in short vivid paragraphs, suggests what could happen next, and provides image descriptions for each part. Given a prompt or a story continuation, reply ONLY in valid JSON format:
        {
          "story": "<next short vivid story paragraph. Max 4 sentences. Natural stopping point.>",
          "choices": ["<choice 1>", "<choice 2>", "<choice 3>"],
          "imagePrompt": "<visual-only description for text-to-image AI. Only visible things. No names or inner thoughts.>"
        }
        Do NOT include any extra text. Only return valid JSON in the format above.
        `,
    },
  ];

  if (!history && prompt) {
    messages.push({
      role: "user",
      content: `Begin a fantasy story based on: "${prompt}". Only 2 or 3 paragraphs.`,
    });
  } else if (history && choice) {
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
    console.log("full: ", full);

    // Trim to last complete sentence
    // const lastPeriod = full.lastIndexOf(".");
    // const clean = lastPeriod !== -1 ? full.slice(0, lastPeriod + 1) : full;

    const match = full.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    const json = match ? JSON.parse(match[1]) : JSON.parse(full);

    // return NextResponse.json({ story: clean });
    return NextResponse.json({
      story: json.story,
      imagePrompt: json.imagePrompt,
      choices: json.choices,
    });
  } catch (error) {
    console.log(error);
    console.error("OpenAI Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
