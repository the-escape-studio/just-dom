import { cn } from "@workspace/ui/lib/utils";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next/types";
import { Toaster } from "@workspace/ui/components/sonner";
import "./globals.css";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// meta
export const metadata: Metadata = {
  title: "JUST-DOM",
  description:
    "Just DOM is a lightweight JavaScript library to simplify DOM manipulation.",
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <RootProvider>{children}</RootProvider>
        <Toaster />
      </body>
    </html>
  )
}
