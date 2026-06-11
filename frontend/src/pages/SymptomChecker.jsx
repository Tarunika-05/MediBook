import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";

const SUGGESTED_CHIPS = [
  "Chest pain",
  "Headache",
  "Skin rash",
  "Joint pain",
  "Anxiety",
  "Fever & chills",
  "Shortness of breath",
];

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200 animate-pulse";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getUrgencyGlow = (urgency) => {
    switch (urgency) {
      case "high":
        return "shadow-[0_0_20px_rgba(239,68,68,0.5),0_0_60px_rgba(239,68,68,0.2)]";
      case "medium":
        return "shadow-[0_0_20px_rgba(245,158,11,0.5),0_0_60px_rgba(245,158,11,0.2)]";
      default:
        return "shadow-[0_0_20px_rgba(59,130,246,0.5),0_0_60px_rgba(59,130,246,0.2)]";
    }
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      case "medium":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      default:
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white";
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    const userMessage = symptoms.trim();

    // Add user message to conversation
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSymptoms("");
    setLoading(true);
    setResult(null);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.post("/recommendations", {
        symptoms: userMessage,
      });
      if (data.success) {
        setResult(data.data);
        setMessages((prev) => [
          ...prev,
          { role: "ai", result: data.data, content: data.data.reasoning },
        ]);
      } else {
        const errText = data.error?.message || "Triage failed";
        setMessage({ type: "error", text: errText });
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: errText, isError: true },
        ]);
      }
    } catch (err) {
      const errText =
        err.response?.data?.error?.message ||
        "Failed to reach triage engine";
      setMessage({ type: "error", text: errText });
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: errText, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    setSymptoms((prev) => (prev ? `${prev}, ${chip.toLowerCase()}` : chip));
  };

  /* ---- Robot Avatar ---- */
  const BotAvatar = () => (
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5a2.25 2.25 0 010 3l-3.3 3.3a2.25 2.25 0 01-3 0L12 19.3l-1.5 1.5a2.25 2.25 0 01-3 0l-3.3-3.3a2.25 2.25 0 010-3" />
      </svg>
    </div>
  );

  /* ---- Typing Indicator ---- */
  const TypingIndicator = () => (
    <div className="flex items-end gap-3 animate-fade-in-up">
      <BotAvatar />
      <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 max-w-[80%]">
        <div className="flex items-center gap-1.5 animate-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );

  /* ---- Render a single AI result card ---- */
  const AiResultCard = ({ res }) => (
    <div className="space-y-4 text-slate-800 w-full">
      {/* Triage Classification */}
      <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-clinical-pulse" />
            Triage Classification
          </h3>
          <span
            className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${getUrgencyBg(res.urgency)} ${getUrgencyGlow(res.urgency)}`}
          >
            ⚡ {res.urgency} urgency
          </span>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2">
          {res.specializations.map((spec) => (
            <span
              key={spec}
              className="bg-teal-50 text-teal-700 border border-teal-150 text-[11px] font-bold px-3 py-1 rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Reasoning */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Clinical Reasoning
          </p>
          <p className="text-slate-705 text-sm leading-relaxed">
            {res.reasoning}
          </p>
        </div>
      </div>

      {/* Doctor Recommendations */}
      {res.doctors.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-clinical-pulse" />
            Recommended Specialists ({res.doctors.length})
          </p>
          {res.doctors.map((doctor, i) => (
            <div
              key={doctor.id}
              className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:scale-[1.02] transition-transform duration-300 shadow-sm hover:border-teal-300 hover:shadow-md group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Photo Placeholder */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shrink-0 text-teal-800 font-black text-lg shadow-sm">
                {doctor.user.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {doctor.user.name}
                  </h4>
                  <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {doctor.experienceYears} Yrs
                  </span>
                </div>
                <p className="text-teal-700 text-xs font-bold mt-0.5">
                  {doctor.specialization}
                </p>
                <p className="text-slate-500 text-xs mt-1 line-clamp-1">
                  {doctor.bio || "Certified medical specialist available for consult."}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-emerald-600 text-[11px] font-bold block">
                    {doctor.availableSlots} slots
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    ${doctor.consultationFee}
                  </span>
                </div>
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-[11px] px-5 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-105 uppercase tracking-wider"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {res.doctors.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-sm">
            No matching doctors found in our network for the triaged specialties.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto py-1">
      {/* ─── HEADER CARD ─── */}
      <div className="hero-gradient hero-mesh rounded-2xl border border-slate-200/60 overflow-hidden relative shadow-sm">
        {/* Decorative glow orbs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 py-3.5 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Glowing AI Brain Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md text-white border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                MediBot AI
              </h1>
              <p className="text-slate-600 text-[10px] font-semibold tracking-wide">
                Powered by <span className="text-teal-650 font-extrabold">Clinical Intelligence Engine</span>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-clinical-pulse" />
              HIPAA Secure
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-500 animate-clinical-pulse" />
              AI-Powered
            </span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONSOLE CARD ─── */}
      <div className="glass-card rounded-[2.5rem] border border-slate-200/50 shadow-xl overflow-hidden flex flex-col">
        {/* Symptom Chips */}
        <div className="bg-slate-50/50 border-b border-slate-200/60 px-6 py-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Quick Symptoms
          </p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTED_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-teal-500/20 text-teal-700 bg-white hover:bg-teal-50 hover:border-teal-400 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Alert (if any) */}
        {message.text && (
          <div className="px-6 pt-4">
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: "", text: "" })}
            />
          </div>
        )}

        {/* Scrollable Conversation Viewport */}
        <div className="overflow-y-auto px-6 py-6 max-h-[280px] h-auto bg-slate-50/30 shadow-inner space-y-5">
          {/* Welcome message if no conversation yet */}
          {messages.length === 0 && !loading && (
            <div className="flex items-end gap-3 animate-fade-in-up">
              <BotAvatar />
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%] shadow-sm">
                <p className="text-slate-800 text-sm leading-relaxed">
                  👋 Hello! I'm <span className="text-teal-700 font-bold">MediBot AI</span>, your clinical intelligence assistant. Describe your symptoms in detail and I'll analyze them to recommend the right specialists for you.
                </p>
                <p className="text-slate-500 text-[10px] font-semibold mt-2 uppercase tracking-wider">
                  Clinical AI • Just now
                </p>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {messages.map((msg, index) => (
            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${50}ms` }}>
              {msg.role === "user" ? (
                /* ── User Message Bubble ── */
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl rounded-br-md px-5 py-3.5 max-w-[80%] shadow-md">
                    <p className="text-white text-sm leading-relaxed font-medium">
                      {msg.content}
                    </p>
                    <p className="text-teal-100/60 text-[10px] font-semibold mt-1.5 text-right uppercase tracking-wider">
                      You
                    </p>
                  </div>
                </div>
              ) : (
                /* ── AI Message Bubble ── */
                <div className="flex items-end gap-3">
                  <BotAvatar />
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%] space-y-4 shadow-sm">
                    {msg.isError ? (
                      <p className="text-red-655 text-sm">
                        ⚠️ {msg.content}
                      </p>
                    ) : msg.result ? (
                      <AiResultCard res={msg.result} />
                    ) : (
                      <p className="text-slate-800 text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    )}
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                      MediBot AI • Analysis Complete
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* ─── MESSAGE INPUT BAR ─── */}
        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <form onSubmit={handleAnalyze} className="flex items-center gap-3">
            {/* Input */}
            <div className="flex-1 relative group">
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all duration-300 font-medium"
              />
              <div className="absolute inset-0 rounded-2xl bg-teal-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-xl" />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-200 disabled:to-slate-300 disabled:shadow-none flex items-center justify-center shadow-md shadow-teal-500/20 transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-3">
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              MediBot AI provides recommendations only — always consult a licensed physician.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
