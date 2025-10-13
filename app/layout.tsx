import "./global.scss";

export const metadata = {
  title: "WebDoctor",
  description: "AI UX/UI analysis tool",
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
      {/* ✅ head를 꼭 넣어야 Next.js가 루트 페이지로 인식함 */}
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
