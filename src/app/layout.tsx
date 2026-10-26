import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Nanum_Pen_Script } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ClientProviders } from "@/components/common/ClientProviders";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

const nanumPen = Nanum_Pen_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  title: "아라하루 - 매일 아침, 알아가는 즐거움",
  description:
    "초등 1~6학년이 학년·학기를 골라 하루 한 세트(15~21문제)씩 푸는 아침학습. 가입 없이 무료, 기록은 기기에만 저장.",
  keywords: [
    "초등학습",
    "일일학습",
    "아침학습",
    "매일학습",
    "초등교육",
    "학습앱",
  ],
  authors: [{ name: "아라하루" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "아라하루 - 매일 아침, 알아가는 즐거움",
    description: "초등 1~6학년 맞춤 일일학습 프로그램",
    siteName: "아라하루",
    locale: "ko_KR",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "아라하루",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2ECC71",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script src="/sw-cleanup.js" async />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon.png"
          sizes="180x180"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="아라하루" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        {/* iOS splash screens - various device sizes */}
        {/* iPhone SE, 8 (375x667) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        {/* iPhone X, XS, 11 Pro, 12 mini, 13 mini (375x812) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        {/* iPhone XR, 11, 12, 13, 14 (414x896 / 390x844) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        {/* iPhone 14 Pro, 15, 16 (393x852) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        {/* iPhone 14 Pro Max, 15 Plus, 16 Plus (430x932) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        {/* iPad (768x1024) */}
        <link
          rel="apple-touch-startup-image"
          href="/icon-512.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>
      <body
        className={`${notoSansKR.variable} ${nanumPen.variable} antialiased`}
      >
        {children}
        <ClientProviders />
        <Toaster position="top-center" richColors />
        {/* 오늘·누적 이용자 수 — 공용 카운터(ssam-count). 개인정보 0: 기기 무작위 id 해시만 */}
        <script src="/ssam-count.js" data-app="araharu" data-place="host" defer />
      </body>
    </html>
  );
}
