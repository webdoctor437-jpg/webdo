import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export const runtime = "nodejs";

// 🖼 안전한 스크린샷 함수
async function captureScreenshot(url: string): Promise<string> {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshot = await page.screenshot({ type: "png", fullPage: false });
    return `data:image/png;base64,${Buffer.from(screenshot).toString("base64")}`;
  } catch (e) {
    console.error("❌ Screenshot failed:", e);
    throw new Error("SCREENSHOT_FAILED");
  } finally {
    if (browser) await browser.close();
  }
}

// 🧠 메인 POST 핸들러
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let imageUrl: string | null = null;

    if (url) {
      if (!/^https?:\/\//i.test(url)) {
        return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
      }
      if (/\.(png|jpg|jpeg|gif|webp)$/i.test(url)) {
        imageUrl = url;
      } else {
        imageUrl = await captureScreenshot(url);
      }
    } else if (file) {
      const arrayBuffer = await file.arrayBuffer();
      imageUrl = `data:${file.type};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
    } else {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }

    const openai = getOpenAIClient();

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are WebDoctor – an AI UX/UI consultant that analyzes design quality.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Please analyze this design and provide insights with sections for strengths, improvements, and visual analysis.",
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 1000,
      });
    } catch (apiErr) {
      console.error("❌ OpenAI error:", apiErr);
      return NextResponse.json(
        { error: "OpenAI API request failed" },
        { status: 500 }
      );
    }

    const result =
      completion?.choices?.[0]?.message?.content ||
      "No response content received from the AI.";

    return NextResponse.json({ result }, { status: 200 });
  } catch (err: any) {
    console.error("❌ API Error:", err);
    let message = "An error occurred.";
    if (err.message?.includes("SCREENSHOT_FAILED"))
      message = "Screenshot capture failed.";
    if (err.message?.includes("OPENAI_API_KEY"))
      message = "Missing OpenAI API key.";

    // ✅ fallback JSON 응답
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
