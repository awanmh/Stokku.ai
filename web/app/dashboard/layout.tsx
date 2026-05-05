"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !user) {
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          // If profile fetch fails (e.g. invalid token), logout
          logout();
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, setUser, logout]);

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
