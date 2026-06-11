import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const SPECIALTIES_NAV = [
  { name: "Cardiology",    icon: "❤️",  href: "/doctors?specialization=Cardiology"    },
  { name: "Neurology",     icon: "🧠",  href: "/doctors?specialization=Neurology"     },
  { name: "Pediatrics",    icon: "👶",  href: "/doctors?specialization=Pediatrics"    },
  { name: "Orthopedics",   icon: "🦴",  href: "/doctors?specialization=Orthopedics"   },
  { name: "Dermatology",   icon: "✨",  href: "/doctors?specialization=Dermatology"   },
  { name: "Ophthalmology", icon: "👁️", href: "/doctors?specialization=Ophthalmology" },
  { name: "Psychiatry",    icon: "🧬",  href: "/doctors?specialization=Psychiatry"    },
];

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative py-1.5 font-semibold text-sm transition-colors group ${
        isActive ? "text-teal-600" : "text-slate-600 hover:text-teal-600"
      }`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-0 h-0.5 bg-teal-600 transition-all duration-200 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

function SpecialtiesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 py-1.5 font-semibold text-sm transition-colors group ${
          open ? "text-teal-600" : "text-slate-600 hover:text-teal-600"
        }`}
      >
        Specialties
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full" />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-2 z-50 animate-fadeIn">
          {/* Arrow pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
            <div className="w-3 h-3 bg-white border-l border-t border-slate-100 rotate-45 translate-y-1 mx-auto" />
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
            Browse by Department
          </div>
          {SPECIALTIES_NAV.map((spec) => (
            <Link
              key={spec.name}
              to={spec.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-teal-50 group transition-colors"
            >
              <span className="text-lg w-7 text-center">{spec.icon}</span>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-teal-700">
                {spec.name}
              </span>
              <svg
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-500 ml-auto transition-colors"
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <Link
              to="/doctors"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-teal-600">View All Specialists →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainLayout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSpecOpen, setMobileSpecOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 clinical-glass shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-8 h-8 text-teal-600 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.42-4.03a1.5 1.5 0 012.55-.06L13.5 16.5l2.03-3.04a1.5 1.5 0 012.5-.16l1.97 2.7h1.5" />
                  <circle cx="12" cy="12" r="9" className="opacity-10" fill="currentColor" />
                </svg>
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-clinical-pulse" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                MediBook
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <NavLink to="/doctors">Find Doctors</NavLink>
              <SpecialtiesDropdown />
              <NavLink to="/symptom-checker">AI Triage</NavLink>

              {isAuthenticated && user?.role === "PATIENT" && (
                <NavLink to="/patient/dashboard">My Appointments</NavLink>
              )}
              {isAuthenticated && user?.role === "DOCTOR" && (
                <>
                  <NavLink to="/doctor/dashboard">Dashboard</NavLink>
                  <NavLink to="/analytics">Analytics</NavLink>
                </>
              )}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-teal-800">{user.name.split(" ")[0]}</span>
                      <span className="text-slate-400 ml-1">·</span>
                      <span className="text-slate-500 ml-1">{user.role === "DOCTOR" ? "Doctor" : "Patient"}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 font-semibold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-teal-600 font-semibold text-sm px-4 py-2 hover:bg-slate-100/50 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-teal-600 rounded-lg hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
            <Link to="/doctors" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Doctors
            </Link>

            {/* Mobile Specialties Accordion */}
            <div>
              <button
                onClick={() => setMobileSpecOpen(!mobileSpecOpen)}
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  </svg>
                  Specialties
                </span>
                <svg className={`w-4 h-4 transition-transform ${mobileSpecOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {mobileSpecOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-teal-100 pl-3">
                  {SPECIALTIES_NAV.map((s) => (
                    <Link key={s.name} to={s.href} onClick={() => { setMobileOpen(false); setMobileSpecOpen(false); }}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-all">
                      <span>{s.icon}</span> {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/symptom-checker" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-1.49.272a60.083 60.083 0 01-10.29 0L6.865 20.32c-1.717-.293-2.3-2.379-1.067-3.61L7.2 15.3" />
              </svg>
              AI Symptom Triage
            </Link>

            {isAuthenticated && user?.role === "PATIENT" && (
              <Link to="/patient/dashboard" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                My Appointments
              </Link>
            )}
            {isAuthenticated && user?.role === "DOCTOR" && (
              <>
                <Link to="/doctor/dashboard" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all">
                  Dashboard Console
                </Link>
                <Link to="/analytics" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all">
                  Clinical Analytics
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 bg-teal-600 hover:bg-teal-700 rounded-xl text-sm font-bold text-white transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className={`flex-grow max-w-7xl mx-auto ${isAuthPage ? 'py-3' : 'py-8'} px-4 sm:px-6 lg:px-8 w-full`}>
        {children}
      </main>

      {isAuthPage ? (
        <footer className="bg-white border-t border-slate-100 py-3 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <p>© {new Date().getFullYear()} MediBook Digital Health Platform. All rights reserved.</p>
            <div className="flex gap-4">
              <span>SECURE 256-BIT SSL</span>
              <span>•</span>
              <span>HIPAA COMPLIANT</span>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="bg-white border-t border-slate-100 mt-16">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h1.5l2.42-4.03a1.5 1.5 0 012.55-.06L13.5 16.5l2.03-3.04a1.5 1.5 0 012.5-.16l1.97 2.7h1.5" />
                    <circle cx="12" cy="12" r="9" className="opacity-10" fill="currentColor" />
                  </svg>
                  <span className="font-extrabold text-lg text-slate-800 tracking-tight">MediBook</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Connecting patients with certified medical specialists in real-time. Secure, conflict-free clinical appointment scheduling.
                </p>
                <div className="flex gap-3">
                  {["HIPAA", "SSL", "GDPR"].map((b) => (
                    <span key={b} className="text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100 px-2 py-1 rounded-lg">{b}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">For Patients</h3>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li><Link to="/doctors" className="hover:text-teal-600 transition-colors">Search Specialists</Link></li>
                  <li><Link to="/symptom-checker" className="hover:text-teal-600 transition-colors">AI Symptom Check</Link></li>
                  <li><Link to="/register" className="hover:text-teal-600 transition-colors">Patient Account</Link></li>
                  <li><Link to="/patient/dashboard" className="hover:text-teal-600 transition-colors">My Appointments</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">Specialties</h3>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  {SPECIALTIES_NAV.slice(0, 5).map((s) => (
                    <li key={s.name}>
                      <Link to={s.href} className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                        <span className="text-sm">{s.icon}</span> {s.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">For Providers</h3>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li><Link to="/register" className="hover:text-teal-600 transition-colors">Join Practitioner Network</Link></li>
                  <li><Link to="/login" className="hover:text-teal-600 transition-colors">Clinic Dashboard</Link></li>
                  <li><Link to="/analytics" className="hover:text-teal-600 transition-colors">Clinical Analytics</Link></li>
                  <li><a href="#" className="hover:text-teal-600 transition-colors">Schedule Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} MediBook Digital Health Platform. All rights reserved.</p>
              <div className="flex gap-4 text-xs text-slate-400 font-semibold tracking-wider">
                <span>SECURE 256-BIT SSL</span>
                <span>•</span>
                <span>HIPAA COMPLIANT</span>
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Global AI Triage Chatbot Widget */}
      <AiChatbotWidget />
    </div>
  );
}

function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I am MediBot, your clinical intelligence assistant. Describe your symptoms (e.g., 'fever and headache') or select a chip below to start a triage assessment.",
    },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || symptoms.trim();
    if (!query) return;

    if (!textToSend) {
      setSymptoms("");
    }

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const { data } = await api.post("/recommendations", { symptoms: query });
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: data.data.reasoning, result: data.data },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: data.error?.message || "Triage assessment failed. Please try again." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: err.response?.data?.error?.message || "Failed to contact medical triage service." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[450px] max-h-[calc(100vh-120px)] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden mb-4 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white text-base">
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-800 leading-tight">MediBot AI</h3>
                <span className="text-[10px] text-teal-650 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Clinical Triage Engine
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={msg.role === "user" ? "chat-bubble-user max-w-[85%]" : "chat-bubble-ai max-w-[85%]"}>
                  <span>{msg.content}</span>

                  {msg.result && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-200/80 w-full text-slate-800">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Classification</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getUrgencyBg(msg.result.urgency)}`}>
                          {msg.result.urgency.toUpperCase()}
                        </span>
                      </div>
                      
                      {msg.result.doctors && msg.result.doctors.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recommended Doctors</p>
                          {msg.result.doctors.slice(0, 2).map((doc) => (
                            <div key={doc.id} className="bg-white p-2.5 rounded-xl border border-slate-150 flex items-center justify-between gap-2 shadow-sm">
                              <div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">{doc.user.name}</p>
                                <p className="text-[10px] text-teal-600 font-bold mt-0.5">{doc.specialization}</p>
                              </div>
                              <Link to={`/doctors/${doc.id}`} onClick={() => setIsOpen(false)} className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                                Book
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start">
                <div className="chat-bubble-ai flex items-center gap-1.5">
                  <div className="animate-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            {["Chest pain", "Headache", "Fever", "Anxiety", "Skin rash"].map((c) => (
              <button key={c} type="button" onClick={() => handleSend(c)} className="shrink-0 text-[10px] font-bold bg-white text-slate-600 border border-slate-200 rounded-full px-2.5 py-1 hover:border-teal-500 hover:text-teal-600 transition-colors">
                {c}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms..."
              disabled={loading}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-755 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-400"
            />
            <button type="submit" disabled={loading || !symptoms.trim()} className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-full transition-colors flex items-center justify-center shadow-md shadow-teal-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 relative"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
