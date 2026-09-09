"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SwipeCards } from "@/components/swipe-cards";
import type { ExtractResponse } from "@/lib/schemas";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function AddSheet() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResponse | null>(null);
  const [source, setSource] = useState<"text" | "kakao_screenshot">("text");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetInput = useCallback(() => {
    setText("");
    setImage(null);
    setError(null);
    setResult(null);
    setLoading(false);
    setSource("text");
  }, []);

  const setImageFromFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImage(await fileToDataUrl(file));
    setSource("kakao_screenshot");
    setError(null);
  }, []);

  // 시트 열려 있는 동안 전역 paste → 이미지면 dataUrl 미리보기
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      e.preventDefault();
      void setImageFromFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, setImageFromFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void setImageFromFile(file);
  };

  const extract = async () => {
    if (!text.trim() && !image) {
      setError("텍스트 또는 이미지를 넣어 주세요");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(text.trim() && { text: text.trim() }),
          ...(image && { image }),
          source: image ? "kakao_screenshot" : "text",
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `추출 실패 (${res.status})`);
      setResult(body as ExtractResponse);
      setSource(image ? "kakao_screenshot" : "text");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetInput();
      }}
    >
      <SheetTrigger render={<Button variant="outline" className="h-11 rounded-full px-5 shadow-lg" />}>추가</SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90%] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{result ? "확인" : "정보 추가"}</SheetTitle>
        </SheetHeader>

        {result ? (
          <SwipeCards data={result} source={source} onDone={() => { resetInput(); setOpen(false); }} />
        ) : (
          <div className="space-y-3 px-4 pb-6">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="메모·대화·명함 텍스트를 붙여넣거나, 이미지를 Ctrl+V / 드롭"
                rows={5}
                className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 pr-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <button
                type="button"
                aria-label="텍스트 입력으로 이동"
                className="absolute right-2 bottom-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                onClick={() => textareaRef.current?.focus()}
              >
                <MicIcon className="size-4" />
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-center text-xs text-muted-foreground"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="미리보기" className="max-h-40 rounded-md object-contain" />
              ) : (
                <span>이미지 드롭 · 붙여넣기 · 파일 선택</span>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  파일 선택
                </Button>
                {image && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setImage(null); setSource("text"); }}>
                    이미지 제거
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void setImageFromFile(f);
                  e.target.value = "";
                }}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="button" className="w-full" disabled={loading} onClick={() => void extract()}>
              {loading ? "추출 중…" : "추출"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
