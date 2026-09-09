"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// props 없음. FAB 「추가」 버튼 + 바텀 시트를 스스로 렌더한다 (2단계에서 paste/drop → /api/extract → 스와이프로 교체).
export function AddSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="h-11 rounded-full px-5 shadow-lg" />}>추가</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>정보 추가</SheetTitle>
        </SheetHeader>
        <p className="px-4 pb-8 text-muted-foreground">준비 중</p>
      </SheetContent>
    </Sheet>
  );
}
