"use client";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { copyToClipboard } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, BookIcon, CopyIcon, HeartIcon, PlayIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { AuroraText } from "@workspace/ui/components/aurora-text";

const HomeView = () => {
  const { resolvedTheme } = useTheme();
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000";
  return (
    <>
      <main className="relative min-h-svh flex flex-col items-center justify-center p-4">
        {/* Background */}
        <FlickeringGrid
          className="absolute inset-0 mask-[radial-gradient(circle,transparent_0%,black_100%)] opacity-40"
          color={color}
        />
        {/* Content */}
        <div className="w-full md:max-w-lg relative z-10 flex flex-col gap-8 items-center">
          <div className="flex flex-col gap-2 items-center">
            {/* title */}
            <AuroraText
              className="text-6xl font-bold bg-background"
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
            <p className="text-muted-foreground text-center max-w-sm -mt-1">
              A simple and easy to use library for creating and manipulating DOM
              elements.
            </p>
          </div>

          {/* installation */}
          <div className="bg-background/5 backdrop-blur border rounded-lg w-full">
            <div className="border-b px-4 py-2 flex items-center gap-2 justify-between">
              <p className="text-xs">Installation</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  copyToClipboard("npm install just-dom", "Installation copied")
                }
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
            </div>
            <pre className="p-4 font-mono italic">
              <code>npm install just-dom</code>
            </pre>
          </div>

          {/* actions */}
          <div className="flex gap-4 items-center">
            <Button variant="outline" render={<Link href="/playground" />}>
              <PlayIcon className="w-4 h-4" />
              Playground
            </Button>
            <Button render={<Link href="/docs" />}>
              <BookIcon className="w-4 h-4" />
              Get started <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center mt-6">
            <p className="flex items-center justify-center gap-2">
              Made with{" "}
              <HeartIcon className="text-transparent fill-red-500" /> by{" "}
              <a
                href="https://github.com/coodingspok"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium"
              >
                coodingspok
              </a>{" "}
              e{" "}
              <a
                href="https://github.com/ergo04"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium"
              >
                ergo04
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomeView;
