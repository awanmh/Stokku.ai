"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  
  // UI States
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP States
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft <= 0) {
      setError("Kode OTP telah kadaluarsa. Silakan kirim ulang OTP.");
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      if (res.data && res.data.session_id) {
        setSessionId(res.data.session_id);
        setSuccessMsg(res.data.message || "OTP telah dikirim ke email anda");
        setStep("otp");
        setTimeLeft(300);
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Login failed";
      // If OTP service is unavailable (Redis/SMTP down), fallback to direct login
      if (errMsg.toLowerCase().includes("otp service unavailable") || 
          errMsg.toLowerCase().includes("failed to send otp") ||
          errMsg.toLowerCase().includes("server error") ||
          errMsg.toLowerCase().includes("server sedang tidak tersedia")) {
        try {
          const res = await authApi.loginDirect(email, password);
          setAuth(res.data.user, res.data.token);
          router.push(redirectPath);
          return;
        } catch (directErr) {
          setError(directErr instanceof Error ? directErr.message : "Login failed");
        }
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    const demoEmail = "admin@stokku.ai";
    const demoPassword = "password";

    try {
      const res = await authApi.loginDirect(demoEmail, demoPassword);
      setAuth(res.data.user, res.data.token);
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(char => !/^\d$/.test(char))) return;
    
    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode OTP");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authApi.verifyOTP(sessionId, otpCode);
      setAuth(res.data.user, res.data.token);
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await authApi.resendOTP(sessionId);
      setSessionId(res.data.session_id);
      setSuccessMsg("Kode OTP baru telah dikirim.");
      setTimeLeft(300);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md">
      <div className="lg:hidden mb-8 flex justify-center">
        <Image src="/logo.png" alt="stokku.ai" width={160} height={40} priority style={{ width: "auto" }} />
      </div>

      <div className="mb-8">
        {step === "otp" && (
           <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground w-fit" onClick={() => setStep("login")} disabled={loading}>
             <ArrowLeft size={16} className="mr-2" /> Kembali ke Login
           </Button>
        )}
        <h2 className="text-2xl font-bold text-foreground">
          {step === "login" ? "Selamat Datang" : "Verifikasi OTP"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {step === "login" 
            ? "Masuk ke dashboard untuk mengelola inventaris Anda" 
            : "Masukkan kode OTP 6 digit yang dikirim ke email Anda"}
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/20 mb-5">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 text-green-600 text-sm rounded-lg p-3 border border-green-500/20 mb-5">
          {successMsg}
        </div>
      )}

      {step === "login" ? (
        <form onSubmit={handleLogin} className="space-y-5">
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
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Atau</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Masuk sebagai Admin (Demo)"
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
          <div className="flex justify-center gap-2 sm:gap-4 mt-2" onPaste={handleOtpPaste}>
            {otp.map((data, index) => (
              <Input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={data}
                className="w-12 h-14 text-center text-2xl font-bold p-0 border-2"
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                ref={(el) => { otpRefs.current[index] = el; }}
                disabled={loading || timeLeft <= 0}
                required
              />
            ))}
          </div>
          
          <div className="text-sm font-medium">
            <span className={timeLeft <= 30 ? "text-destructive" : "text-muted-foreground"}>
               Waktu tersisa: {formatTime(timeLeft)}
            </span>
          </div>

          <div className="space-y-3">
             <Button type="submit" className="w-full h-10" disabled={loading || timeLeft <= 0}>
               {loading ? (
                 <>
                   <Loader2 className="animate-spin mr-2" size={16} />
                   Memproses...
                 </>
               ) : (
                 "Verifikasi OTP"
               )}
             </Button>

             <Button 
               type="button" 
               variant="ghost" 
               className="w-full text-foreground hover:text-primary transition-colors text-sm font-medium"
               onClick={handleResendOtp}
               disabled={loading || timeLeft > 270} // disabled for the first 30 seconds
             >
               Belum menerima kode? Kirim ulang
             </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
         &copy; {new Date().getFullYear()} stokku.ai — Smart Inventory Management
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
              style={{ width: "auto" }}
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
        {mounted ? (
          <Suspense fallback={<div className="w-full max-w-md animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-8" /><div className="space-y-4"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div></div>}>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="w-full max-w-md animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-8" /><div className="space-y-4"><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /><div className="h-10 bg-muted rounded" /></div></div>
        )}
      </div>
    </div>
  );
}
