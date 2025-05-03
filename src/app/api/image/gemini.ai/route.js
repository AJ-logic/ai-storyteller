import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  const { prompt } = await req.json();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let base64Image = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("No image found in Gemini response.");
    }

    // Return image as base64 string for frontend to use in <img src={`data:image/png;base64,${image}`} />
    return NextResponse.json({ image: `data:image/png;base64,${base64Image}` });
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
