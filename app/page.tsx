"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import FooterCompany from "@/components/FooterCompany";
import "./global.scss";

function parseAnalysisResult(text: string) {
  const sectionTitles = [
    "웹사이트 정보",
    "강점",
    "개선이 필요한 부분",
    "시각적 & 레이아웃 분석",
    "유사한 웹사이트",
    "웹닥터의 디자인 처방전",
  ];

  const icons = {
    "웹사이트 정보": "🌐",
    "강점": "💎",
    "개선이 필요한 부분": "⚙️",
    "시각적 & 레이아웃 분석": "🎨",
    "유사한 웹사이트": "🔗",
    "웹닥터의 디자인 처방전": "💡",
  };

  const regex = new RegExp(`(${sectionTitles.join("|")})`, "gi");
  const parts = text.split(regex).filter((part) => part.trim() !== "");

  let parsedSections: { title: string; content: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    const title = sectionTitles.find(
      (t) => parts[i].toLowerCase().includes(t.toLowerCase())
    );
    if (title) {
      const content = parts[i + 1]?.trim() || "";
      parsedSections.push({ title, content });
      i++;
    }
  }

  if (parsedSections.length === 0) {
    return <div className="analysis-plain">{text}</div>;
  }

  return (
    <div className="analysis-section">
      {parsedSections.map(({ title, content }, index) => (
        <div key={index} className="analysis-card">
          <div className="section-header">
            <span className="section-icon">
              {icons[title as keyof typeof icons]}
            </span>
            <h3 className="section-title">{title}</h3>
          </div>
          <div className="section-content">
            {content || "이 항목에 대한 세부 정보가 없습니다."}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [result, setResult] = useState<string>("");
  const [imageData, setImageData] = useState<string>("");
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(
    null
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleResult = (analysisResult: string, image?: string) => {
    setResult(analysisResult);
    setImageData(image || "");
    setFeedback(null);
    setFeedbackSubmitted(false);
  };

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? "helpful" : "not-helpful");

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result,
          imageData,
          isHelpful,
          timestamp: new Date().toISOString(),
        }),
      });
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("피드백 전송 실패:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="main">
        {/* 헤더 */}
        <div className="header">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            웹닥터 (WebDoctor)
          </h1>
          <p className="text-gray-600 text-lg">
            웹사이트와 앱 디자인을 AI가 분석해드립니다.
          </p>
        </div>

        {/* 업로드 폼 */}
        <UploadForm onResult={handleResult} />

        {/* 분석 결과 */}
        {result && (
          <div className="mt-10 animate-fadeIn">
            {/* 결과 헤더 */}
            <div className="bg-blue-600 rounded-t-2xl p-6 text-white">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span>✨</span>
                분석 완료!
              </h2>
              <p className="mt-2 opacity-90">
                AI가 귀하의 디자인을 전문적으로 분석했습니다.
              </p>
            </div>

            {/* 결과 본문 */}
            <div className="bg-white rounded-b-2xl shadow-2xl border-x border-b border-gray-200">
              <div className="p-8 overflow-x-hidden max-w-[900px] mx-auto">
                {parseAnalysisResult(result)}
              </div>

              {/* 피드백 섹션 */}
              <div className="border-t bg-gray-50 p-6 rounded-b-2xl">
                {!feedbackSubmitted ? (
                  <div>
                    <p className="text-gray-700 font-semibold mb-4 text-center text-lg">
                      💬 이 분석이 도움이 되었나요?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleFeedback(true)}
                        className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all ${
                          feedback === "helpful"
                            ? "bg-green-500 text-white shadow-xl scale-110 ring-4 ring-green-200"
                            : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 hover:shadow-lg hover:scale-105 border-2 border-gray-200"
                        }`}
                      >
                        <span className="text-2xl">👍</span>
                        <span>도움이 되었어요</span>
                      </button>
                      <button
                        onClick={() => handleFeedback(false)}
                        className={`group flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all ${
                          feedback === "not-helpful"
                            ? "bg-red-500 text-white shadow-xl scale-110 ring-4 ring-red-200"
                            : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-lg hover:scale-105 border-2 border-gray-200"
                        }`}
                      >
                        <span className="text-2xl">👎</span>
                        <span>별로였어요</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                      <span className="text-2xl">✅</span>
                      피드백이 저장되었습니다. AI 개선에 도움이 됩니다!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 안내 카드 (결과 없을 때) */}
        {!result && (
          <div className="footer grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">📱</div>
              <h3 className="font-bold text-gray-800 mb-2">모바일 & 웹</h3>
              <p className="text-gray-600 text-sm">
                모바일 또는 데스크톱 디자인 스크린샷을 분석할 수 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">🎯</div>
              <h3 className="font-bold text-gray-800 mb-2">전문가 분석</h3>
              <p className="text-gray-600 text-sm">
                UX/UI 전문가의 시각에서 심층적인 인사이트를 제공합니다.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">💡</div>
              <h3 className="font-bold text-gray-800 mb-2">개선 제안</h3>
              <p className="text-gray-600 text-sm">
                디자인을 개선할 수 있는 실질적인 조언을 받아보세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 푸터 */}
      <FooterCompany />
    </main>
  );
}
