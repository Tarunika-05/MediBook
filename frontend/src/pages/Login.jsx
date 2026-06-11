import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Alert from "../components/Alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      const user = await login(data.email, data.password);
      navigate(user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Login failed. Please check your credentials.");
    }
  };

  const fillDemo = async (email, password) => {
    setValue("email", email);
    setValue("password", password);
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Demo login failed.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex w-full">
      {/* ═══════════ LEFT HERO PANEL (40% desktop) ═══════════ */}
      <div className="hidden lg:flex lg:w-[40%] hero-gradient hero-mesh relative overflow-hidden flex-col items-center justify-center px-10">
        {/* Animated blobs */}
        <div className="absolute top-20 -left-16 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-24 right-10 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-blob-delay" />
        <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl animate-blob-delay2" />

        {/* Logo + brand */}
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-3xl shadow-2xl shadow-teal-500/30 mb-2 animate-float">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.42-4.03a1.5 1.5 0 012.55-.06L13.5 16.5l2.03-3.04a1.5 1.5 0 012.5-.16l1.97 2.7h1.5" />
            </svg>
          </div>

          <div>
            <h2 className="text-4xl font-black tracking-tight text-shadow-hero">
              Medi<span className="gradient-text-animate">Book</span>
            </h2>
            <p className="text-slate-600 text-sm mt-3 max-w-xs mx-auto leading-relaxed font-semibold">
              Your trusted platform for seamless healthcare scheduling and clinical consultations
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: "🔒", label: "HIPAA Compliant" },
              { icon: "🛡️", label: "SSL Encrypted" },
              { icon: "✅", label: "GDPR Ready" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="flex items-center gap-2 bg-white/80 border border-slate-200/60 shadow-sm px-4 py-2 rounded-2xl text-slate-700 text-xs font-bold"
              >
                <span className="text-sm">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { value: "10K+", label: "Patients" },
              { value: "500+", label: "Doctors" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-2xl font-black text-teal-600">{stat.value}</span>
                <span className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT FORM PANEL ═══════════ */}
      <div className="flex-1 flex items-center justify-center py-6 px-4 sm:px-8">
        <div className="w-full max-w-lg">
          {/* Glass Card */}
          <div className="glass-card rounded-[2rem] border border-slate-200/40 shadow-xl shadow-slate-350/20 p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              {/* Mobile-only logo */}
              <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-500/25 mb-1.5">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.42-4.03a1.5 1.5 0 012.55-.06L13.5 16.5l2.03-3.04a1.5 1.5 0 012.5-.16l1.97 2.7h1.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 text-xs">Sign in to your MediBook portal</p>
            </div>

            {/* ⚡ Compact Demo Accounts Section at Top */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⚡ One-Click Demo Access</span>
                <span className="text-[10px] text-teal-650 font-bold">Instant Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fillDemo("alex.johnson@email.com", "password123")}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-teal-50/50 border border-slate-200 rounded-xl transition-all text-left group shadow-sm hover:border-teal-300"
                >
                  <span className="text-base">🧑</span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-teal-600 uppercase tracking-wider leading-none">Patient</span>
                    <span className="block text-[9px] text-slate-500 truncate leading-none mt-1">alex.johnson</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("dr.sarah.mitchell@medibook.com", "password123")}
                  className="flex items-center gap-2.5 px-3 py-2 bg-white hover:bg-indigo-50/50 border border-slate-200 rounded-xl transition-all text-left group shadow-sm hover:border-indigo-300"
                >
                  <span className="text-base">👩‍⚕️</span>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-wider leading-none">Doctor</span>
                    <span className="block text-[9px] text-slate-500 truncate leading-none mt-1">dr.sarah.mitchell</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-slate-200/80" />
              <span className="px-3.5 text-[10px] text-slate-400 font-black uppercase tracking-widest">OR</span>
              <div className="flex-1 border-t border-slate-200/80" />
            </div>

            <Alert type="error" message={error} onClose={() => setError("")} />

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    {...register("email")}
                    className={`w-full pl-11 pr-4 py-2.5 border-2 ${errors.email ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'} rounded-2xl focus:ring-2 outline-none font-semibold text-slate-700 placeholder-slate-400 transition-all text-xs bg-white/60`}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className={`w-full pl-11 pr-12 py-2.5 border-2 ${errors.password ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : 'border-slate-200 focus:ring-teal-500 focus:border-teal-400'} rounded-2xl focus:ring-2 outline-none font-semibold text-slate-700 placeholder-slate-400 transition-all text-xs bg-white/60`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 text-white font-black py-2.5 text-sm rounded-2xl shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider + Register link */}
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-500">
                New to MediBook?{" "}
                <Link to="/register" className="text-teal-600 font-bold hover:text-teal-700 hover:underline underline-offset-2">
                  Create a free account
                </Link>
              </p>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-100">
              {["HIPAA", "SSL Secured", "GDPR Safe"].map((b) => (
                <span key={b} className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
