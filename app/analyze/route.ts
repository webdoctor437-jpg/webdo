import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function captureScreenshot(url: string): Promise<string> {
  const puppeteer = await import("puppeteer-core");
  const chromiumImport = await import("@sparticuz/chromium");
  const chromium: any = chromiumImport.default || chromiumImport; // ✅ 타입 해결

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

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const screenshot = await page.screenshot({ type: "png", fullPage: false });
    const base64 = Buffer.from(screenshot).toString("base64");

    return `data:image/png;base64,${base64}`;
  } finally {
    if (browser) await browser.close();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const screenshot = await captureScreenshot(url);
    return NextResponse.json({ screenshot });
  } catch (error: any) {
    console.error("❌ Error in POST /analyze:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
