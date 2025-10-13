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
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
