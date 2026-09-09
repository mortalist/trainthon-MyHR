import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyHR",
  description: "당신 네트워크의 인사팀",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-dvh flex justify-center sm:items-center sm:bg-neutral-200 dark:sm:bg-neutral-900">
        <div className="relative flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-background sm:h-[844px] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
