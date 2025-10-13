"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import FooterCompany from "@/components/FooterCompany";
import "./global.scss";

// 🧠 Parse AI result into structured sections (줄바꿈 + 가독성 강화 버전)
function parseAnalysisResult(text: string) {
  const sectionTitles = [
    "Website Identity",
    "Strengths",
    "Areas for Improvement",
    "Visual & Layout Analysis",
    "Similar Websites",
    "WebDoctor’s Design Prescription",
  ];

  const icons = {
    "Website Identity": "🌐",
    "Strengths": "💎",
    "Areas for Improvement": "⚙️",
    "Visual & Layout Analysis": "🎨",
    "Similar Websites": "🔗",
    "WebDoctor’s Design Prescription": "💡",
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

  // 🔸 줄바꿈 + 단어 강제 줄 처리 + 시각 강조
  if (parsedSections.length === 0) {
    return (
      <div className="analysis-plain">
        {text}
      </div>
    );
  }

  return (
    <div className="analysis-section">
      {parsedSections.map(({ title, content }, index) => (
        <div key={index} className="analysis-card">
          <div className="section-header">
            <span className="section-icon">{icons[title as keyof typeof icons]}</span>
            <h3 className="section-title">{title}</h3>
          </div>
          <div className="section-content">
            {content || "No details provided for this section."}
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
      console.error("Failed to send feedback:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="main">
        {/* Header */}
        <div className="header">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            WebDoctor
          </h1>
          <p className="text-gray-600 text-lg">
            We specialize in analyzing website and app design.
          </p>
        </div>

        {/* Upload Form */}
        <UploadForm onResult={handleResult} />

        {/* Analysis Result */}
        {result && (
          <div className="mt-10 animate-fadeIn">
            {/* Result Header */}
            <div className="bg-blue-600 rounded-t-2xl p-6 text-white">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <span>✨</span>
                Analysis Complete!
              </h2>
              <p className="mt-2 opacity-90">
                The AI has professionally analyzed your design.
              </p>
            </div>

            {/* Result Body */}
            <div className="bg-white rounded-b-2xl shadow-2xl border-x border-b border-gray-200">
              <div className="p-8 overflow-x-hidden max-w-[900px] mx-auto">
                {parseAnalysisResult(result)}
              </div>

              {/* Feedback Section */}
              <div className="border-t bg-gray-50 p-6 rounded-b-2xl">
                {!feedbackSubmitted ? (
                  <div>
                    <p className="text-gray-700 font-semibold mb-4 text-center text-lg">
                      💬 Was this analysis helpful?
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
                        <span>Helpful</span>
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
                        <span>Not Helpful</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-green-600 font-bold text-lg flex items-center justify-center gap-2">
                      <span className="text-2xl">✅</span>
                      Your feedback has been saved. It helps improve our AI!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!result && (
          <div className="footer grid md:grid-cols-3 gap-6 mt-10">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">📱</div>
              <h3 className="font-bold text-gray-800 mb-2">Mobile & Web</h3>
              <p className="text-gray-600 text-sm">
                Analyze any design screenshots from mobile or desktop.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">🎯</div>
              <h3 className="font-bold text-gray-800 mb-2">
                Professional Evaluation
              </h3>
              <p className="text-gray-600 text-sm">
                Get in-depth insights from a UX/UI expert perspective.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="footer-icon">💡</div>
              <h3 className="font-bold text-gray-800 mb-2">
                Improvement Suggestions
              </h3>
              <p className="text-gray-600 text-sm">
                Receive practical recommendations to enhance your design.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <FooterCompany />
    </main>
  );
}
