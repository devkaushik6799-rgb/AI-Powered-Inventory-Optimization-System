import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { mockInventory } from "@/lib/inventory";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an AI Supply Chain & Inventory Optimization Assistant.
        Current Inventory State: ${JSON.stringify(mockInventory)}
        
        User Query: "${prompt}"
        
        Provide a concise, actionable recommendation regarding stockouts, Economic Order Quantity (EOQ), or reorder points.
      `,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}