import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sampleInventory = [
  { id: "SKU-001", name: "Industrial Bearings", stock: 120, reorderPoint: 150, eoq: 300, status: "Reorder Needed" },
  { id: "SKU-002", name: "Hydraulic Valves", stock: 450, reorderPoint: 200, eoq: 500, status: "Optimal" },
  { id: "SKU-003", name: "Microcontrollers", stock: 15, reorderPoint: 50, eoq: 200, status: "Critical Stockout Risk" },
];

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an AI Supply Chain & Inventory Optimization Assistant.
        Current Inventory State: ${JSON.stringify(sampleInventory)}
        
        User Query: "${prompt}"
        
        Provide a concise, actionable recommendation regarding stockouts, Economic Order Quantity (EOQ), or reorder points.
      `,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}