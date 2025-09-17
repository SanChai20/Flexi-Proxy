import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { i18n, Locale } from "../../../i18n-config";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlexiProxy - AI",
  description:
    "A service that provides API Base URLs and acts as a backend proxy for clients like Claude Code.",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  return (
    <html lang={lang}>
      <body className={inter.className}>
        {props.children}
        <Analytics />
      </body>
    </html>
  );
}
