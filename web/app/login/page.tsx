"use client";

import { Suspense, useState, useEffect } from "react";
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

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    const demoEmail = "admin@stokku.ai";
    const demoPassword = "password";
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      const res = await authApi.login(demoEmail, demoPassword);
      setAuth(res.data.user, res.data.token);
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Enter your credentials to access the dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="bg-danger-bg text-destructive text-sm rounded-md p-3 border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
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
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Button type="submit" className="w-full h-9" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-9"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Continue with demo account"
            )}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} stokku.ai &mdash; Smart Inventory Management
      </p>
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-16">
        <div className="relative z-10 max-w-md text-primary-foreground">
          <div className="mb-10">
            <Image
              src="/logo.png"
              alt="stokku.ai"
              width={160}
              height={40}
              className="brightness-0 invert"
              priority
              style={{ width: "auto" }}
            />
          </div>
          <h2 className="text-3xl font-semibold leading-tight mb-4 tracking-tight">
            Smart inventory management for modern businesses.
          </h2>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            Track stock levels, forecast demand, and optimize your supply chain
            with AI-powered insights. No more guesswork.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-semibold">99.9%</div>
              <div className="text-xs text-primary-foreground/60 mt-1">Stock accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">3x</div>
              <div className="text-xs text-primary-foreground/60 mt-1">Faster operations</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">24/7</div>
              <div className="text-xs text-primary-foreground/60 mt-1">Real-time sync</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="lg:hidden mb-8 absolute top-8 left-8">
          <Image src="/logo.png" alt="stokku.ai" width={120} height={30} priority style={{ width: "auto" }} />
        </div>
        {mounted ? (
          <Suspense
            fallback={
              <div className="w-full max-w-sm space-y-4 animate-pulse">
                <div className="h-7 w-48 bg-secondary rounded" />
                <div className="h-4 w-64 bg-secondary rounded" />
                <div className="space-y-3 mt-6">
                  <div className="h-9 bg-secondary rounded" />
                  <div className="h-9 bg-secondary rounded" />
                  <div className="h-9 bg-secondary rounded" />
                </div>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
