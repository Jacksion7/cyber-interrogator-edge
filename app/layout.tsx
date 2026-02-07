import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "赛博审讯室：图灵危机",
  description: "审讯 AI 嫌疑人，揭开真相。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-cyber-black text-gray-200 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
