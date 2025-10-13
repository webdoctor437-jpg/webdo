"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "file" && !file) return alert("Please upload an image!");
    if (mode === "url" && !url) return alert("Please enter a URL!");

    setLoading(true);

    const formData = new FormData();
    if (mode === "file" && file) formData.append("file", file);
    else if (mode === "url") formData.append("url", url);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Server error");
      setResult(data.result);
    } catch (err: any) {
      setResult(`❌ Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setUrl("");
  };

  return (
    <div className="page-container">
      {!result ? (
        // 📤 Upload Form
        <form onSubmit={handleSubmit} className="upload-box">
          <h2 className="title">Diagnose Your Design</h2>

          <div className="mode-buttons">
            <button
              type="button"
              className={`mode-btn ${mode === "file" ? "active" : ""}`}
              onClick={() => setMode("file")}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === "url" ? "active" : ""}`}
              onClick={() => setMode("url")}
            >
              🔗 Enter Image URL
            </button>
          </div>

          {mode === "file" && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          )}

          {mode === "url" && (
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
            />
          )}

          <button
            type="submit"
            disabled={loading || (mode === "file" && !file) || (mode === "url" && !url)}
            className="submit-btn"
          >
            {loading ? "Analyzing..." : " Start Analysis"}
          </button>
        </form>
      ) : (
        // ✅ Result View
        <div className="result-box large">
          <h2 className="result-title"> Analysis Complete!</h2>
          <p className="result-sub">
            Your uploaded design has been analyzed from a professional UX/UI perspective.
          </p>

          <div className="result-content">
            <pre>{result}</pre>
          </div>

          <button className="close-btn" onClick={reset}>
            🔄 Analyze Another
          </button>
        </div>
      )}
    </div>
  );
}
