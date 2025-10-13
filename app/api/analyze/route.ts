import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

let openai: OpenAI | null = null;

function getClient() {
  if (!openai) {
    const key = process.env.OPENAI_API_KEY;
    console.log("🔑 OPENAI_API_KEY exists?", !!key);
    console.log("🔑 OPENAI_API_KEY prefix:", key?.slice(0, 8) || "MISSING");

    if (!key) throw new Error("❌ Missing OPENAI_API_KEY in environment");
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

export async function POST(req: Request) {
  try {
    const client = getClient();
    console.log("✅ Client initialized");

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello!" }],
    });

    console.log("✅ Response received");
    return NextResponse.json({ success: true, content: response.choices[0].message });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
