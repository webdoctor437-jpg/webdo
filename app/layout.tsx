import "./global.scss";

export const metadata = {
  title: "WebDoctor",
  description: "AI UX/UI analysis tool",
  icons: {
    icon: "/images/logo.png", // ✅ public/images/logo.png 사용
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head />
      <body>{children}</body>
    </html>
  );
}

