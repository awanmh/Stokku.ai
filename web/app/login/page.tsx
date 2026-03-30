"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.token);
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden mb-8 flex justify-center">
        <Image src="/logo.png" alt="stokku.ai" width={160} height={40} priority />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Selamat Datang</h2>
        <p className="text-muted-foreground mt-1">
          Masuk ke dashboard untuk mengelola inventaris Anda
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} stokku.ai — Smart Inventory Management
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[hsl(215,80%,48%)] via-[hsl(215,75%,40%)] to-[hsl(222,47%,15%)] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <div className="mb-12">
            <Image
              src="/logo.png"
              alt="stokku.ai"
              width={200}
              height={50}
              className="brightness-0 invert"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Manajemen Inventaris <br />
            <span className="text-cyan-300">Cerdas & Real-Time</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Kelola stok, prediksi demand, dan optimalkan supply chain Anda
            dengan teknologi AI. Tidak ada lagi stok ghaib atau dead-stock.
          </p>
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-white/60">Akurasi Stok</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3x</div>
              <div className="text-sm text-white/60">Lebih Cepat</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-white/60">Stok Ghaib</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Suspense fallback={<div className="w-full max-w-md animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-8" /><div className="space-y-4"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
