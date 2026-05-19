"use client";

import { Suspense, useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [shake, setShake] = useState(false);

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
    } else if (timeLeft <= 0 && step === "otp") {
      triggerError("Kode OTP telah kadaluarsa. Silakan kirim ulang OTP.");
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      triggerError("Email dan password wajib diisi");
      return;
    }
    
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
          triggerError(directErr instanceof Error ? directErr.message : "Login failed");
        }
      } else {
        triggerError(errMsg);
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
    
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const res = await authApi.loginDirect(demoEmail, demoPassword);
      setAuth(res.data.user, res.data.token);
      router.push(redirectPath);
    } catch (err) {
      triggerError(err instanceof Error ? err.message : "Demo login failed");
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
      triggerError("Masukkan 6 digit kode OTP");
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
      triggerError(err instanceof Error ? err.message : "OTP verification failed");
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
      triggerError(err instanceof Error ? err.message : "Gagal mengirim ulang OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const shakeVariants: import("framer-motion").Variants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    },
    normal: { x: 0 }
  };

  return (
    <motion.div 
      className="w-full max-w-sm sm:max-w-md mx-auto"
      variants={shakeVariants}
      animate={shake ? "shake" : "normal"}
    >
      <div className="mb-8 text-center sm:text-left">
        {step === "otp" && (
           <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-primary transition-colors" onClick={() => setStep("login")} disabled={loading}>
             <ArrowLeft size={16} className="mr-2" /> Kembali
           </Button>
        )}
        <motion.h1 
          key={`title-${step}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground tracking-tight"
        >
          {step === "login" ? "Selamat Datang" : "Verifikasi Identitas"}
        </motion.h1>
        <motion.p 
          key={`desc-${step}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground mt-2"
        >
          {step === "login" 
            ? "Masuk ke akun Stokku Anda untuk melanjutkan." 
            : "Masukkan kode OTP 6 digit yang baru saja dikirimkan ke email Anda."}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-destructive/10 text-destructive text-sm font-medium rounded-lg p-3 border border-destructive/20 mb-6 flex items-start gap-2.5 overflow-hidden"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg p-3 border border-green-500/20 mb-6 flex items-start gap-2.5 overflow-hidden"
          >
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card/50 backdrop-blur-sm sm:border sm:border-border sm:shadow-lg sm:rounded-2xl sm:p-8">
        <AnimatePresence mode="wait">
          {step === "login" ? (
            <motion.form 
              key="login-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleLogin} 
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={loading}
                    className={`pl-10 h-11 transition-all ${error && !email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline font-medium" tabIndex={-1}>Lupa password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    disabled={loading}
                    className={`pl-10 pr-10 h-11 transition-all ${error && !password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-4">
                <Button type="submit" className="w-full h-11 text-base font-medium transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Memproses...
                    </>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/50 backdrop-blur-sm sm:bg-card px-3 text-muted-foreground font-medium">atau</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 text-primary transition-all"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    "Gunakan akun demo"
                  )}
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleVerifyOtp} 
              className="space-y-8 text-center"
            >
              <div className="flex justify-center gap-2 sm:gap-3 mt-4" onPaste={handleOtpPaste}>
                {otp.map((data, index) => (
                  <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={data}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold p-0 border-2 rounded-xl transition-all focus-visible:ring-offset-2 ${data ? 'border-primary' : 'border-border'}`}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    disabled={loading || timeLeft <= 0}
                  />
                ))}
              </div>
              
              <div className="text-sm font-medium">
                <span className={timeLeft <= 30 ? "text-destructive font-bold" : "text-muted-foreground"}>
                   Waktu tersisa: {formatTime(timeLeft)}
                </span>
              </div>

              <div className="space-y-4">
                 <Button type="submit" className="w-full h-11 text-base font-medium transition-all active:scale-[0.98]" disabled={loading || timeLeft <= 0}>
                   {loading ? (
                     <>
                       <Loader2 className="animate-spin mr-2" size={18} />
                       Memverifikasi...
                     </>
                   ) : (
                     "Verifikasi OTP"
                   )}
                 </Button>

                 <Button 
                   type="button" 
                   variant="ghost" 
                   className="w-full text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                   onClick={handleResendOtp}
                   disabled={loading || timeLeft > 270}
                 >
                   Belum menerima kode? <span className="underline decoration-primary/50 underline-offset-4 ml-1">Kirim ulang</span>
                 </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} stokku.ai &mdash; Smart Inventory Management
      </p>
    </motion.div>
  );
}

const emptySubscribe = () => () => {};

export default function LoginPage() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div className="min-h-screen flex w-full overflow-hidden bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden bg-zinc-950">
        {/* Background Image Illustration */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-bg.png"
            alt="Stokku Inventory Visualization"
            fill
            className="object-cover opacity-60 mix-blend-screen"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 max-w-xl w-full flex flex-col justify-end h-full pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Image
              src="/logo.png"
              alt="stokku.ai"
              width={180}
              height={45}
              className="brightness-0 invert drop-shadow-md"
              priority
              style={{ width: "auto" }}
            />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-sm"
          >
            Smart inventory management <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              for modern businesses.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-zinc-300 text-lg leading-relaxed max-w-md font-medium"
          >
            Track stock levels, forecast demand, and optimize your supply chain
            with AI-powered insights. No more guesswork.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 grid grid-cols-3 gap-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
          >
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-zinc-400 mt-1.5 font-medium">Stock accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">3x</div>
              <div className="text-sm text-zinc-400 mt-1.5 font-medium">Faster operations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-zinc-400 mt-1.5 font-medium">Real-time AI sync</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative w-full lg:w-1/2 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center z-20">
          <Image src="/logo.png" alt="stokku.ai" width={130} height={32} priority style={{ width: "auto" }} className="dark:brightness-0 dark:invert" />
        </div>

        {/* Decorative background blobs for light/dark mode */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="w-full flex-1 flex flex-col justify-center mt-12 lg:mt-0 z-10 relative">
          {mounted ? (
            <Suspense
              fallback={
                <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-6 animate-pulse">
                  <div className="h-10 w-64 bg-secondary/50 rounded-lg" />
                  <div className="h-5 w-48 bg-secondary/50 rounded-md" />
                  <div className="space-y-4 mt-10">
                    <div className="h-14 bg-secondary/30 rounded-xl" />
                    <div className="h-14 bg-secondary/30 rounded-xl" />
                    <div className="h-12 bg-primary/20 rounded-xl mt-6" />
                  </div>
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          ) : (
             <div className="w-full max-w-sm sm:max-w-md mx-auto h-[500px]" />
          )}
        </div>
      </div>
    </div>
  );
}
