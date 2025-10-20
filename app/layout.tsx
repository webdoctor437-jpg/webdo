import "./global.scss";

export const metadata = {
  title: "웹닥터 (WebDoctor)",
  description: "AI 기반 UX/UI 분석 도구",
  icons: {
    icon: "/images/logo.png", // ✅ public/images/logo.png 사용
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
