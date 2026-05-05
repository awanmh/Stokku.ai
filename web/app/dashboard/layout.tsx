"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col lg:pl-60 min-h-screen">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <FloatingChatbot />
      <Toaster
        theme="dark"
        richColors
        toastOptions={{
          style: {
            background: "hsl(var(--bg-overlay))",
            border: "1px solid hsl(var(--border-default))",
            borderRadius: "8px",
          },
        }}
      />
    </div>
  );
}
