"use client";
import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import FooterCompany from "@/components/FooterCompany";
import "./global.scss";

export default function Page() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleResult = (analysisResult: string) => {
    setResult(analysisResult);
    setShowResult(true);
  };

  return (
    <main className="page-container">
      {!showResult ? (
        <>
          <h1 className="title">WebDoctor</h1>
          <p className="subtitle">
            Upload a design or URL — get a full AI-powered UX/UI review.
          </p>
          <UploadForm setResult={handleResult} loading={loading} setLoading={setLoading} />
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
              <pre className="result-text">{result}</pre>
            </div>

            <button className="back-btn" onClick={() => setShowResult(false)}>
              ← Back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
