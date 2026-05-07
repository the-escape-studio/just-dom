"use client"

import { FlickeringGrid } from "@/components/magicui/flickering-grid"
import { copyToClipboard } from "@/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  ArrowRightIcon,
  BookIcon,
  CopyIcon,
  HeartIcon,
  PlayIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { AuroraText } from "@workspace/ui/components/aurora-text"

const HomeView = () => {
  const { resolvedTheme } = useTheme()
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000"
  return (
    <>
      <main className="relative flex min-h-svh flex-col items-center justify-center p-4">
        {/* Background */}
        <FlickeringGrid
          className="absolute inset-0 mask-[radial-gradient(circle,transparent_0%,black_100%)] opacity-40"
          color={color}
        />
        {/* Content */}
        <div className="relative z-10 flex w-full flex-col items-center gap-8 md:max-w-lg">
          <div className="flex flex-col items-center gap-2">
            {/* title */}
            <AuroraText
              className="bg-background text-6xl font-bold"
              colors={[
                "var(--primary)",
                "var(--foreground)",
                "var(--primary)",
                "var(--foreground)",
                "var(--primary)",
              ]}
            >
              JUST-DOM
            </AuroraText>
            <p className="-mt-1 max-w-sm text-center text-muted-foreground">
              A simple and easy to use library for creating and manipulating DOM
              elements.
            </p>
          </div>

          {/* installation */}
          <div className="w-full rounded-lg border bg-background/5 backdrop-blur">
            <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
              <p className="text-xs">Installation</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard("npm install just-dom", "Installation copied")
                }
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <pre className="p-4 font-mono italic">
              <code>npm install just-dom</code>
            </pre>
          </div>

          {/* actions */}
          <div className="flex items-center gap-4">
            <Button variant="outline" render={<Link href="/playground" />}>
              <PlayIcon className="h-4 w-4" />
              Playground
            </Button>
            <Button render={<Link href="/docs" />}>
              <BookIcon className="h-4 w-4" />
              Get started <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="flex items-center justify-center gap-2">
              Made with <HeartIcon className="fill-red-500 text-transparent" />{" "}
              by{" "}
              <a
                href="https://github.com/codingspook"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80"
              >
                codingspook
              </a>{" "}
              e{" "}
              <a
                href="https://github.com/ergo04"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80"
              >
                ergo04
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default HomeView
