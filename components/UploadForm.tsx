"use client";

import { useState } from "react";

interface UploadFormProps {
  onResult: (analysisResult: string, image?: string) => void;
}

export default function UploadForm({ onResult }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "file" && !file) return alert("Please upload an image!");
    if (mode === "url" && !url) return alert("Please enter a URL!");

    setLoading(true);

    const formData = new FormData();
    if (mode === "file" && file) formData.append("file", file);
    else if (mode === "url") formData.append("url", url);

    try {
      const res = await fetch("/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Server error");
      
      // Pass result to parent component
      onResult(data.result, data.imageUrl);
      
      // Reset form
      setFile(null);
      setUrl("");
    } catch (err: any) {
      onResult(`❌ Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
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
          {loading ? "Analyzing..." : "🔍 Start Analysis"}
        </button>
      </form>
    </div>
  );
}