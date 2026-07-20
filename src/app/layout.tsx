import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简历专家 — JD 定制简历优化 Agent",
  description:
    "针对不同求职阶段，基于目标岗位 JD 诊断简历、匹配要求、挖掘经历、重构表达，并生成面试准备与模拟。",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
