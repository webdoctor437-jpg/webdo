
export const metadata = {
  title: "WebDoctor",
  description: "Upload or enter a URL to analyze UX/UI quality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
