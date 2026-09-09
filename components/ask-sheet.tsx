"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// props 없음. FAB 「질문」 버튼 + 바텀 시트를 스스로 렌더한다 (4단계에서 프리셋 칩 + /api/ask mode=ask로 교체).
export function AskSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button className="h-11 rounded-full px-5 shadow-lg" />}>질문</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>인맥에게 묻기</SheetTitle>
        </SheetHeader>
        <p className="px-4 pb-8 text-muted-foreground">준비 중</p>
      </SheetContent>
    </Sheet>
  );
}
