import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 🚀 중요: 정적 라우트 방지

// Lazy initialization to avoid build-time issues
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// 🖼 Capture website screenshot
async function captureScreenshot(url: string): Promise<string> {
  const puppeteer = await import("puppeteer-core");
  const chromium = await import("@sparticuz/chromium");

  let browser;
  try {
    browser = await puppeteer.default.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const screenshot = await page.screenshot({ type: "png", fullPage: false });
    const base64 = Buffer.from(screenshot).toString("base64");

    return `data:image/png;base64,${base64}`;
  } finally {
    if (browser) await browser.close();
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let imageUrl: string;

    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return NextResponse.json(
          { error: "Invalid URL format. URL must start with http:// or https://" },
          { status: 400 }
        );
      }

      const isImageUrl = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
      imageUrl = isImageUrl ? url : await captureScreenshot(url);
    } else if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size must be 5MB or less." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${base64}`;
    } else {
      return NextResponse.json(
        { error: "An image file or a valid URL is required." },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are WebDoctor – an AI UX/UI consultant that diagnoses and evaluates design quality.
Provide detailed, expert-level feedback on usability, layout, color, and hierarchy.
          `,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Please analyze this website or app design and provide the following:
1. Website Identity
2. Strengths
3. Areas for Improvement
4. Visual & Layout Analysis
5. Similar Websites
6. WebDoctor's Design Prescription
              `,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const result =
      completion.choices[0].message?.content ||
      "Unable to retrieve the analysis result.";

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during analysis." },
      { status: 500 }
    );
  }
}
