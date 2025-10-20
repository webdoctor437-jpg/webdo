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

    if (mode === "file" && !file) return alert("이미지를 업로드해주세요!");
    if (mode === "url" && !url) return alert("이미지 URL을 입력해주세요!");

    setLoading(true);

    const formData = new FormData();
    if (mode === "file" && file) formData.append("file", file);
    else if (mode === "url") formData.append("url", url);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "서버 오류가 발생했습니다.");
      
      // 결과를 상위 컴포넌트로 전달
      onResult(data.result, data.imageUrl);
      
      // 폼 초기화
      setFile(null);
      setUrl("");
    } catch (err: any) {
      onResult(`❌ 분석 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="upload-box">
        <h2 className="title">디자인 진단하기</h2>

        <div className="mode-buttons">
          <button
            type="button"
            className={`mode-btn ${mode === "file" ? "active" : ""}`}
            onClick={() => setMode("file")}
          >
            📁 파일 업로드
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "url" ? "active" : ""}`}
            onClick={() => setMode("url")}
          >
            🔗 이미지 URL 입력
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
            placeholder="https://예시사이트.com/image.png"
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
          {loading ? "분석 중..." : "🔍 분석 시작"}
        </button>
      </form>
    </div>
  );
}
