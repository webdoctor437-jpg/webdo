import { NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// 🧩 초기화 (빌드 시점 오류 방지)
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export const runtime = "nodejs";
export const preferredRegion = "iad1"; // ✅ Vercel puppeteer 안정 지역

// 🖼 웹사이트 스크린샷 캡처
async function captureScreenshot(url: string): Promise<string> {
  let browser;
  try {
    console.log("🌐 브라우저 실행 중...");

    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: chromium.headless !== undefined ? chromium.headless : true,
    });

    const page = await browser.newPage();

    console.log("📸 페이지 로드 중:", url);
    await page.goto(url, {
      waitUntil: "networkidle2", // ✅ 렌더링 완료 대기
      timeout: 40000,
    });

    // ✅ 애니메이션, JS 로딩 안정화 대기
    await new Promise((res) => setTimeout(res, 2000));

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const base64 = Buffer.from(screenshot).toString("base64");
    console.log("✅ 스크린샷 캡처 성공");
    return `data:image/png;base64,${base64}`;
  } catch (err: any) {
    console.error("❌ 스크린샷 캡처 실패:", err.message);
    throw new Error("스크린샷 캡처 실패: " + err.message);
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

    // 🔗 URL 모드
    if (url) {
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return NextResponse.json(
          { error: "잘못된 URL 형식입니다. http:// 또는 https:// 로 시작해야 합니다." },
          { status: 400 }
        );
      }

      const isImageUrl = /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
      if (isImageUrl) {
        imageUrl = url;
        console.log("🔗 이미지 URL 감지됨:", url);
      } else {
        console.log("🌐 웹페이지 스크린샷 캡처 시도:", url);
        try {
          imageUrl = await captureScreenshot(url);
        } catch (err: any) {
          console.warn("⚠️ 스크린샷 실패, 텍스트 분석으로 대체:", err.message);
          imageUrl = null;
        }
      }
    }

    // 📁 파일 업로드 모드
    else if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "파일 크기는 5MB 이하만 가능합니다." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/jpeg";
      imageUrl = `data:${mimeType};base64,${base64}`;
      console.log("📤 업로드된 이미지 수신 완료");
    } else {
      return NextResponse.json(
        { error: "이미지 파일 또는 유효한 URL이 필요합니다." },
        { status: 400 }
      );
    }

    // 🧠 OpenAI 분석 요청
    const openai = getOpenAIClient();

    const messages: any[] = [
      {
        role: "system",
        content: `
당신은 "웹닥터(WebDoctor)"라는 AI UX/UI 컨설턴트입니다.
당신의 역할은 웹사이트나 앱 디자인을 전문가의 시각으로 분석하고 평가하는 것입니다.

사용자의 디자인을 전문적으로 진단하고, 개선할 수 있는 구체적이고 실질적인 UX/UI 피드백을 제공합니다.
주요 평가 항목은 사용성, 시각적 위계, 색상 조화, 타이포그래피 가독성, 레이아웃 일관성입니다.
전문적이고 자신감 있는 어조로, 실제 디자이너가 조언하는 느낌으로 설명해주세요.
        `,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
다음 웹사이트 또는 앱 디자인을 분석해주세요.

다음 항목을 포함해 주세요:

1. **웹사이트 정보**
   - 어떤 종류의 사이트인지
   - 예상 목적과 주요 사용자층

2. **강점**
   - 디자인적으로 잘 작동하는 요소
   - 사용성 또는 시각적으로 좋은 점

3. **개선이 필요한 부분**
   - 개선할 수 있는 UX/UI 요소
   - 구체적인 이유와 개선 방향 제안

4. **시각적 & 레이아웃 분석**
   - 색상 조화, 타이포그래피, 여백, 시각적 위계 구조 평가

5. **유사한 웹사이트**
   - 비슷한 디자인 스타일을 가진 실제 웹사이트나 앱 예시

6. **웹닥터의 디자인 처방전**
   - 전체적인 개선 방향과 브랜드 인식 향상을 위한 제안
            `,
          },
        ],
      },
    ];

    if (imageUrl) {
      messages[1].content.push({
        type: "image_url",
        image_url: { url: imageUrl },
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
    });

    const result =
      completion.choices?.[0]?.message?.content ||
      "분석 결과를 가져올 수 없습니다.";

    console.log("✅ 분석 완료");
    return NextResponse.json({ result }, { status: 200 });
  } catch (error: any) {
    console.error("❌ API 오류:", error);

    let errorMessage = "분석 중 오류가 발생했습니다.";
    if (error?.message?.includes("API key")) {
      errorMessage = "OpenAI API 키가 설정되지 않았습니다.";
    } else if (error?.message?.includes("quota")) {
      errorMessage = "API 사용 한도를 초과했습니다.";
    } else if (error?.message?.includes("Invalid image")) {
      errorMessage = "제공된 URL이 유효한 이미지가 아닙니다.";
    } else if (error?.message?.includes("Screenshot capture failed")) {
      errorMessage = "URL에서 스크린샷을 가져오지 못했습니다.";
    } else if (error?.message?.includes("Navigation timeout")) {
      errorMessage = "페이지 로드 시간이 초과되었습니다. URL을 확인해주세요.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
