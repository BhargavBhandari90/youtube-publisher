import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/app/components/SessionProvider";

export const metadata: Metadata = {
  title: "Bunty's YouTube Publisher",
  description: "AI-powered YouTube video uploader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="font-sans min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center px-4 py-20">
          <SessionProvider>{children}</SessionProvider>
        </div>
      </body>
    </html>
  );
}
