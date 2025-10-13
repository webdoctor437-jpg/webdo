
export const metadata = {
  title: "WebDoctor",
  description: "AI UX/UI analysis tool",
  icons: {
    icon: "/images/logo.png", // ✅ favicon.ico 대신 이 경로로 지정
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head />
      <body>{children}</body>
    </html>
  );
}
