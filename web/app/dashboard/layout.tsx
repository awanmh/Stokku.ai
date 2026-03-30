"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060913] text-white selection:bg-cyan-500/30">
      <Sidebar />
      <div className="flex flex-col lg:pl-64 min-h-screen transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden relative">
          {/* Subtle background ambient glow */}
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10 opacity-50" />
          
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
      {/* Toast configurations for dark mode */}
      <Toaster 
        theme="dark" 
        richColors 
        toastOptions={{
          style: {
            background: '#0a0f1c',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)'
          }
        }}
      />
    </div>
  );
}
