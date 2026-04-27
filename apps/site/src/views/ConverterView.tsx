"use client";

import { Button } from "@workspace/ui/components/button";
import { convertHtmlToDom } from "@/lib/converter";
import { copyToClipboard } from "@/lib/utils";
import Editor, { OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { emmetCSS, emmetHTML } from "emmet-monaco-es";
import {
  ChevronsLeftRightEllipsisIcon,
  CopyIcon,
  EraserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { useMediaQuery } from "usehooks-ts";

const defaultHtml = `<div class="card" data-id="42">
  <header class="card-header">
    <h2>Hello World</h2>
    <span class="badge">New</span>
  </header>
  <p class="card-body" style="color: #333;">
    This is an example component.
  </p>
  <svg viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>
  <footer>
    <button class="btn btn-primary" type="button">
      Clicca qui
    </button>
  </footer>
</div>`;

const ConverterView = () => {
  const [htmlInput, setHtmlInput] = useState(defaultHtml);
  const [jsOutput, setJsOutput] = useState("");
  const [prefix, setPrefix] = useState<"DOM" | "jd">("DOM");
  const { resolvedTheme } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  useEffect(() => {
    setIsClientLoaded(true);
    convertHtmlToDom(defaultHtml, prefix).then((result) => {
      setJsOutput(result);
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (htmlInput.trim()) {
      convertHtmlToDom(htmlInput, prefix).then((result) => {
        setJsOutput(result);
      });
    }
  }, [prefix]);

  const runConvertOnly = async (html: string) => {
    if (!html.trim()) {
      setJsOutput("");
      return;
    }
    const result = await convertHtmlToDom(html, prefix);
    setJsOutput(result);
  };

  const handleConvert = async () => {
    const result = await convertHtmlToDom(htmlInput, prefix);
    setJsOutput(result);
    copyToClipboard(result, "JS-DOM copied");
    if (isMobile) {
      setIsDrawerOpen(true);
    }
  };

  const handleCopyCode = () => {
    copyToClipboard(jsOutput, "JS-DOM copied");
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const htmlEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleHtmlEditorDidMount: OnMount = (editor, monaco) => {
    emmetHTML(monaco);
    emmetCSS(monaco);
    htmlEditorRef.current = editor;
    // Auto-convert when the HTML editor loses focus (no clipboard copy)
    editor.onDidBlurEditorWidget(() => {
      void runConvertOnly(editor.getValue());
    });
  };

  const handleClear = () => {
    setHtmlInput("");
    setJsOutput("");
  };

  return (
    <>
      <main className="p-4 pt-20 h-svh flex flex-col gap-4 md:gap-0 w-full mx-auto max-w-(--fd-layout-width)">
        {/* Header */}
        <div className="contents md:flex items-center gap-2 justify-between mb-4">
          <h2 className="text-2xl font-bold">HTML to JUST-DOM</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border overflow-hidden text-sm font-medium">
              <button
                type="button"
                onClick={() => setPrefix("DOM")}
                className={`px-3 py-1.5 transition-colors ${
                  prefix === "DOM"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                DOM.
              </button>
              <button
                type="button"
                onClick={() => setPrefix("jd")}
                className={`px-3 py-1.5 transition-colors ${
                  prefix === "jd"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                jd.
              </button>
            </div>
            <Button type="button" onClick={handleConvert} className="order-last">
              <ChevronsLeftRightEllipsisIcon className="w-4 h-4 mr-2" />
              Convert code
            </Button>
          </div>
        </div>
        {/* Content */}
        {isClientLoaded ? (
          <div className="flex w-full border rounded-md overflow-hidden flex-auto">
            {/* Input Side */}
            <div className="w-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-2 justify-between px-4 py-2 border-b">
                <p className="text-sm font-medium">Input HTML</p>
                <div className="flex gap-2 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                  >
                    <EraserIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(htmlInput, "HTML copied")}
                  >
                    <CopyIcon />
                  </Button>
                </div>
              </div>
              {/* Editor */}
              <Editor
                onMount={handleHtmlEditorDidMount}
                className="w-full h-auto flex-auto [&>div]:h-full [&>div]:w-full"
                defaultLanguage="html"
                value={htmlInput}
                onChange={(value) => setHtmlInput(value || "")}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>

            {/* separator */}
            {!isMobile && (
              <>
                <div className="h-auto w-px bg-border block" />

                {/* Output Side */}
                <div className="w-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 justify-between px-4 py-2 border-b">
                    <p className="text-sm font-medium">Output JavaScript</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyCode}
                    >
                      <CopyIcon />
                    </Button>
                  </div>
                  {/* Editor */}
                  <Editor
                    className="w-full h-auto flex-auto [&>div]:h-full [&>div]:w-full"
                    defaultLanguage="javascript"
                    language="javascript"
                    value={jsOutput}
                    theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                    options={{
                      autoIndent: "advanced",
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex w-full border rounded-md overflow-hidden flex-auto bg-foreground/10 animate-pulse" />
        )}
      </main>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[94svh] !max-h-none !mt-0 flex flex-col">
          <DrawerHeader className="flex flex-row items-center gap-2 justify-between">
            <DrawerTitle>Output JavaScript</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
              <CopyIcon />
            </Button>
          </DrawerHeader>
          <div className="px-4 pb-4 flex flex-col flex-auto gap-4">
            <div className="w-full h-full flex rounded-md overflow-hidden border">
              {/* Editor */}
              <Editor
                className="w-full h-auto flex-auto [&>div]:h-full [&>div]:w-full"
                defaultLanguage="javascript"
                language="javascript"
                value={jsOutput}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  autoIndent: "advanced",
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            {/* Buttons */}
            <div className="flex flex-row gap-2 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
              >
                Close dialog
              </Button>
              <Button type="button" onClick={handleCopyCode}>
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy code
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ConverterView;
