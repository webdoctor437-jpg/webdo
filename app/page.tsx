"use client";
import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import FooterCompany from "@/components/FooterCompany";
import "./global.scss";

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

  if (parsedSections.length === 0) {
    return <div className="analysis-plain">{text}</div>;
  }

  return (
    <div className="analysis-section">
      {parsedSections.map(({ title, content }, index) => (
        <div key={index} className="analysis-card">
          <div className="section-header">
            <span className="section-icon">{icons[title as keyof typeof icons]}</span>
            <h3 className="section-title">{title}</h3>
          </div>
          <div className="section-content">{content}</div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const [result, setResult] = useState<string>("");
  const [imageData, setImageData] = useState<string>("");
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);
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
    <main className="page-container">
      {!result ? (
        <>
          <div className="header">
            <h1 className="title">WebDoctor</h1>
            <p className="subtitle">
              Upload a design or URL — get a full AI-powered UX/UI review.
            </p>
          </div>
          <UploadForm onResult={handleResult} />
          <FooterCompany />
        </>
      ) : (
        <div className="result-overlay">
          <div className="result-popup">
            <div className="result-header">
              <h2>✨ Analysis Complete!</h2>
              <p>The AI has professionally analyzed your design.</p>
            </div>

            <div className="result-body">
              {parseAnalysisResult(result)}
            </div>

            <div className="feedback-section">
              {!feedbackSubmitted ? (
                <>
                  <p className="feedback-title">💬 Was this analysis helpful?</p>
                  <div className="feedback-buttons">
                    <button
                      onClick={() => handleFeedback(true)}
                      className={`feedback-btn helpful ${
                        feedback === "helpful" ? "active" : ""
                      }`}
                    >
                      👍 Helpful
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className={`feedback-btn not-helpful ${
                        feedback === "not-helpful" ? "active" : ""
                      }`}
                    >
                      👎 Not Helpful
                    </button>
                  </div>
                </>
              ) : (
                <p className="feedback-confirm">
                  ✅ Your feedback has been saved. Thank you!
                </p>
              )}
            </div>

            <button className="close-btn" onClick={() => setResult("")}>
              ← Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
