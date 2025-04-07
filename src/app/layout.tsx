import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components//providers";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qvick - 기숙사 관리 시스템",
  description: "학교 기숙사 출석 및 인원 관리 시스템",
  authors: [{ name: "Team C0nnect" }],
  keywords: ["기숙사", "출석", "관리", "시스템", "Qvick"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable}`}>
        <Providers>
          <div className="min-h-screen w-full bg-gray-50">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
