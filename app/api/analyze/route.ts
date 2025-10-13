import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// 🧩 Lazy initialization to avoid build-time errors
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

export const runtime = "nodejs";

// 🖼 Capture website screenshot (Vercel-safe version)
async function captureScreenshot(url: string): Promise<string> {
  let browser;
  try {
    console.log("🌐 Launching browser...");
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log("📸 Loading page:", url);
    await page.goto(url, {
      waitUntil: "domcontentloaded", // faster and safer than networkidle2
      timeout: 20000,
    });

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const base64 = Buffer.from(screenshot).toString("base64");
    console.log("✅ Screenshot captured successfully");
    return `data:image/png;base64,${base64}`;
  } catch (err: any) {
    console.error("❌ Screenshot capture failed:", err.message);
    throw new Error("Screenshot capture failed: " + err.message);
  } finally {
    if (browser) await browser.close();
  }
}

// 🧠 Main POST handler
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let imageUrl: string | null = null;

    // 🔗 URL Mode
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return NextResponse.json(
          { error: "Invalid URL format. Must start with http:// or https://" },
          { status: 400 }
        );
      }

      const isImageUrl = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
      if (isImageUrl) {
        imageUrl = url;
        console.log("🔗 Image URL detected:", url);
      } else {
        console.log("🌐 Capturing webpage screenshot:", url);
        imageUrl = await captureScreenshot(url);
      }
    }

    // 📁 File Upload Mode
    else if (file) {
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
      console.log("📤 Uploaded image received successfully");
    } else {
      return NextResponse.json(
        { error: "An image file or a valid URL is required." },
        { status: 400 }
      );
    }

    // 🧠 OpenAI Analysis
    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are WebDoctor – an AI UX/UI consultant that diagnoses and evaluates design quality.
Your goal is to analyze screenshots or website URLs as if performing a professional design review.

Use expert-level reasoning and provide actionable feedback on how to improve user experience, clarity, and visual appeal.
Focus on usability, visual hierarchy, color balance, typography legibility, and overall layout consistency.
Your tone should be analytical, confident, and insightful – like a senior design strategist giving practical advice.
          `,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Please analyze this website or app design.

Include the following sections:

1. **Website Identity**
   - What type of website/app this appears to be
   - Its likely purpose and audience

2. **Strengths**
   - What design elements are working well?
   - What makes the experience user-friendly or visually appealing?

3. **Areas for Improvement**
   - What specific UX/UI issues could be optimized?
   - Provide improvement suggestions with clear reasoning

4. **Visual & Layout Analysis**
   - Discuss color balance, typography, spacing, and overall visual hierarchy

5. **Similar Websites**
   - Mention a few real-world websites or apps with similar design approaches

6. **WebDoctor's Design Prescription**
   - Conclude with professional recommendations on how to enhance usability and brand perception
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
      completion.choices?.[0]?.message?.content ||
      "Unable to retrieve the analysis result.";

    console.log("✅ Analysis complete");

    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    console.error("❌ API Error:", error);

    let errorMessage = "An error occurred during analysis.";
    if (error?.message?.includes("API key")) {
      errorMessage = "The OpenAI API key is not configured.";
    } else if (error?.message?.includes("quota")) {
      errorMessage = "The API quota has been exceeded.";
    } else if (error?.message?.includes("Invalid image")) {
      errorMessage = "The provided URL is not a valid image.";
    } else if (error?.message?.includes("Screenshot capture failed")) {
      errorMessage = "Failed to capture screenshot from the provided URL.";
    } else if (error?.message?.includes("Navigation timeout")) {
      errorMessage = "Page load timeout. Please check the URL.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
