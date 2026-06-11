import { Link } from "react-router-dom";
import { useDoctors } from "../hooks/useDoctors";

// ─── Photo pool (deterministic by doctor ID) ──────────────────────
const DOCTOR_PHOTOS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face",
];

const SPEC_COLORS = {
  Cardiology:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100",    dot: "bg-rose-500"    },
  Neurology:     { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100",  dot: "bg-indigo-500"  },
  Pediatrics:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100",   dot: "bg-amber-500"   },
  Orthopedics:   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-100",    dot: "bg-teal-500"    },
  Dermatology:   { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100", dot: "bg-fuchsia-500" },
  Ophthalmology: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100",     dot: "bg-sky-500"     },
  Psychiatry:    { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-100",  dot: "bg-violet-500"  },
};

function getPhoto(id)   { return DOCTOR_PHOTOS[id % DOCTOR_PHOTOS.length]; }
function getRating(id)  { return [4.7,4.8,4.9,4.6,4.8,5.0,4.7,4.9,4.8,4.6][id%10]; }
function getReviews(id) { return [128,245,312,87,193,421,156,289,74,367][id%10]; }
function getSpec(spec)  { return SPEC_COLORS[spec] || { bg:"bg-teal-50", text:"text-teal-700", border:"border-teal-100", dot:"bg-teal-500" }; }

// ─── Static page data ─────────────────────────────────────────────
const SPECIALTIES = [
  { name:"Cardiology",    desc:"Heart health & cardiovascular care",   icon:"❤️",  gradient:"from-rose-500 to-pink-600",     bg:"from-rose-50 to-pink-50",         border:"border-rose-100",    text:"text-rose-700"    },
  { name:"Pediatrics",    desc:"Child development & pediatric care",   icon:"👶",  gradient:"from-amber-500 to-orange-500",  bg:"from-amber-50 to-orange-50",       border:"border-amber-100",   text:"text-amber-700"   },
  { name:"Neurology",     desc:"Brain & nervous system diagnostics",   icon:"🧠",  gradient:"from-indigo-500 to-violet-600", bg:"from-indigo-50 to-violet-50",      border:"border-indigo-100",  text:"text-indigo-700"  },
  { name:"Orthopedics",   desc:"Bone, joint & muscle treatment",       icon:"🦴",  gradient:"from-teal-500 to-emerald-600",  bg:"from-teal-50 to-emerald-50",       border:"border-teal-100",    text:"text-teal-700"    },
  { name:"Dermatology",   desc:"Skin, hair & cosmetic medicine",       icon:"✨",  gradient:"from-fuchsia-500 to-purple-600",bg:"from-fuchsia-50 to-purple-50",     border:"border-fuchsia-100", text:"text-fuchsia-700" },
  { name:"Ophthalmology", desc:"Vision care & eye health",             icon:"👁️", gradient:"from-sky-500 to-blue-600",      bg:"from-sky-50 to-blue-50",           border:"border-sky-100",     text:"text-sky-700"     },
];

const STATS = [
  { value:"12+", label:"Verified Doctors",   icon:"👨‍⚕️" },
  { value:"8",   label:"Demo Patients",       icon:"🧑‍🤝‍🧑" },
  { value:"98%", label:"Satisfaction Rate",   icon:"⭐" },
  { value:"24/7",label:"Support Available",   icon:"🛡️" },
];

const HOW_IT_WORKS = [
  { step:"01", title:"Create Your Account",  desc:"Sign up as a patient in under 60 seconds. Completely free.",      icon:"🔐" },
  { step:"02", title:"Find Your Specialist", desc:"Browse 500+ verified doctors by specialty, rating, and fee.",     icon:"🔍" },
  { step:"03", title:"Book Instantly",       desc:"Pick an available slot. Your booking is confirmed in real-time.", icon:"📅" },
  { step:"04", title:"Get Expert Care",      desc:"Attend your session and access your records securely anytime.",   icon:"💊" },
];

const TESTIMONIALS = [
  {
    quote: "I found a cardiologist and had an appointment booked in under 5 minutes. The experience was seamless!",
    name: "Alex Johnson", role: "Patient", avatar: "A",
    rating: 5,
  },
  {
    quote: "MediBook's scheduling system is a game-changer. No more double-bookings. My patients love the confirmation flow.",
    name: "Dr. Sarah Mitchell", role: "Cardiologist", avatar: "S",
    rating: 5,
  },
  {
    quote: "The AI symptom checker pointed me to the right specialist. Saved me a lot of guesswork and time.",
    name: "Priya Patel", role: "Patient", avatar: "P",
    rating: 5,
  },
];

const FEATURES = [
  { title:"Verified Practitioners", desc:"Every practitioner undergoes rigorous credentialing before joining.", color:"teal",   icon:"🛡️" },
  { title:"Conflict-Free Booking",  desc:"Real-time locking prevents double-booking the moment you confirm.", color:"indigo", icon:"🔒" },
  { title:"HIPAA Compliant",        desc:"256-bit encryption and JWT auth keeps all patient data private.",   color:"cyan",   icon:"🏥" },
  { title:"AI Symptom Triage",      desc:"Describe symptoms and our AI recommends the right specialist.",     color:"purple", icon:"🤖" },
];

const COLOR_MAP = {
  teal:   { bg:"bg-teal-50",   icon:"text-teal-600",   border:"border-teal-100"   },
  indigo: { bg:"bg-indigo-50", icon:"text-indigo-600", border:"border-indigo-100" },
  cyan:   { bg:"bg-cyan-50",   icon:"text-cyan-600",   border:"border-cyan-100"   },
  purple: { bg:"bg-purple-50", icon:"text-purple-600", border:"border-purple-100" },
};

const TRUSTED_BY = [
  "Mayo Clinic",
  "Cleveland Clinic",
  "Johns Hopkins",
  "Stanford Health",
  "Mount Sinai",
  "Mass General",
  "Cedars-Sinai",
  "UCLA Health",
];

const CTA_TRUST_STATS = [
  { value: "10,000+", label: "Consultations Completed" },
  { value: "500+", label: "Verified Doctors" },
  { value: "99.9%", label: "Platform Uptime" },
  { value: "4.9★", label: "Average Rating" },
];

// ─── Star Rating ──────────────────────────────────────────────────
function StarRating({ rating, size = "sm" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`${cls} ${s<=Math.round(rating)?"star-filled":"star-empty"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-black text-slate-600">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Doctor Card Skeleton ─────────────────────────────────────────
function DoctorSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-64 shimmer-bg" />
      <div className="p-6 space-y-4">
        <div className="h-6 shimmer-bg rounded-lg w-3/4" />
        <div className="h-4 shimmer-bg rounded-lg w-1/2" />
        <div className="flex justify-between pt-2">
          <div className="h-6 shimmer-bg rounded-lg w-1/4" />
          <div className="h-12 shimmer-bg rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Real Doctor Card ─────────────────────────────────────────────
function DoctorCard({ doctor, idx }) {
  const rating  = getRating(doctor.id);
  const reviews = getReviews(doctor.id);
  const spec    = getSpec(doctor.specialization);
  const photo   = getPhoto(doctor.id);

  return (
    <div className="doctor-card group animate-fade-in-up" style={{ animationDelay: `${idx * 0.07}s` }}>
      {/* Photo with verified glow ring */}
      <div className="relative h-64 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 verified-glow-ring pointer-events-none z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <img
          src={photo}
          alt={`Dr. ${doctor.user.name}`}
          className="w-full h-full object-cover object-top group-hover:scale-115 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.classList.add("flex","items-center","justify-center");
            const d = document.createElement("div");
            d.className = "text-7xl font-black text-slate-200";
            d.textContent = doctor.user.name.charAt(0);
            e.target.parentElement.appendChild(d);
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-[1]" />
        {/* Available badge */}
        <div className="absolute top-4 right-4 z-[3] flex items-center gap-2 glass-dark rounded-full px-3 py-1.5 text-xs font-black text-emerald-400 shadow-lg border border-emerald-500/20">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-clinical-pulse" />
          Available
        </div>
        {/* Specialty badge on gradient overlay */}
        <div className={`absolute bottom-4 left-4 z-[3] ${spec.bg} ${spec.text} border border-white/50 shadow-lg rounded-full px-4 py-1.5 text-xs font-black backdrop-blur-sm`}>
          {doctor.specialization}
        </div>
        {/* Reviews count */}
        <div className="absolute bottom-4 right-4 z-[3] text-white/80 text-xs font-bold">
          {reviews} reviews
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-teal-600 transition-colors leading-tight">
                Dr. {doctor.user.name}
              </h3>
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0 drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <StarRating rating={rating} />
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fee</div>
            <div className="text-xl font-black text-slate-900">${doctor.consultationFee}</div>
          </div>
        </div>

        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
          {doctor.bio || "Certified medical practitioner committed to evidence-based healthcare."}
        </p>

        <Link
          to={`/doctors/${doctor.id}`}
          className="w-full flex items-center justify-center gap-2 border-2 border-teal-500/30 bg-transparent hover:bg-teal-600 text-teal-700 hover:text-white font-extrabold text-sm py-3.5 rounded-xl transition-all duration-300 hover:border-teal-600 hover:shadow-[0_0_20px_rgba(13,148,136,0.3)]"
        >
          Book Appointment
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function Home() {
  const { data, isLoading } = useDoctors("", "", 1, 8);
  const doctors = data?.data || [];

  return (
    <div className="space-y-32 -mt-4 pb-20">

      {/* ══ ULTRA-PREMIUM HERO ══════════════════════════════════════════════════ */}
      <section className="hero-gradient hero-mesh rounded-[2.5rem] overflow-hidden relative min-h-[700px] flex items-center shadow-2xl">
        {/* Animated dot grid overlay */}
        <div className="absolute inset-0 hero-dot-grid opacity-[0.07] pointer-events-none z-[1]" />

        {/* Animated blobs - BIGGER */}
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-teal-500/25 rounded-full blur-[100px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/25 rounded-full blur-[100px] animate-blob-delay pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] animate-blob-delay2 pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-purple-500/15 rounded-full blur-[80px] animate-blob pointer-events-none" />

        {/* Floating medical icons */}
        <div className="absolute top-20 left-[10%] text-5xl animate-float opacity-20 pointer-events-none select-none" style={{ animationDelay: "0s", animationDuration: "7s" }}>🩺</div>
        <div className="absolute top-40 right-[15%] text-4xl animate-float opacity-15 pointer-events-none select-none" style={{ animationDelay: "2s", animationDuration: "8s" }}>💊</div>
        <div className="absolute bottom-32 left-[20%] text-4xl animate-float opacity-15 pointer-events-none select-none" style={{ animationDelay: "1s", animationDuration: "6s" }}>❤️</div>
        <div className="absolute top-1/2 right-[8%] text-3xl animate-float opacity-10 pointer-events-none select-none" style={{ animationDelay: "3s", animationDuration: "9s" }}>🧬</div>
        <div className="absolute bottom-20 right-[35%] text-3xl animate-float opacity-10 pointer-events-none select-none" style={{ animationDelay: "4s", animationDuration: "7.5s" }}>🫀</div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-28 w-full text-center flex flex-col items-center">
          <div className="max-w-5xl space-y-10 flex flex-col items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-black px-5 py-2.5 rounded-full mb-8 uppercase tracking-widest shadow-sm bg-white/60">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-clinical-pulse inline-block" />
                Trusted Healthcare Platform
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.02] tracking-tight">
                Your Health,{" "}
                <span className="gradient-text-animate">Expert Care</span>
                <br className="hidden sm:block" />
                <span className="text-slate-900">One Tap Away.</span>
              </h1>
            </div>

            <p className="animate-fade-in-up-delay-1 text-slate-700 text-lg md:text-2xl leading-relaxed max-w-3xl font-medium">
              Book confirmed consultations with verified medical specialists. Real-time slot reservation, instant confirmation, and HIPAA-secure electronic health records.
            </p>

            <div className="animate-fade-in-up-delay-2 flex flex-col sm:flex-row gap-5 pt-4">
              <Link to="/doctors"
                className="bg-teal-600 hover:bg-teal-700 text-white font-black py-5 px-14 rounded-2xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/35 hover:-translate-y-2 transition-all duration-300 flex items-center justify-center gap-3 text-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Specialists
              </Link>
              <Link to="/symptom-checker"
                className="bg-white hover:bg-slate-50 text-slate-700 font-black py-5 px-14 rounded-2xl hover:-translate-y-2 transition-all duration-300 flex items-center justify-center gap-3 text-xl border border-slate-200 shadow-sm">
                <span className="text-2xl">🤖</span> AI Triage
              </Link>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-in-up-delay-3 flex flex-wrap justify-center gap-8 pt-10">
              {["HIPAA Compliant","256-bit SSL","24/7 Support","No Credit Card"].map((b) => (
                <span key={b} className="flex items-center gap-2 text-sm text-slate-600 font-bold tracking-wide">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══ STATS – LIGHT SOCIAL-PROOF BAND ═════════════════════════ */}
      <section className="glass-card rounded-[2.5rem] border border-slate-150 relative shadow-xl -mt-16 mx-4">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, i) => (
              <div key={stat.label}
                className="text-center animate-fade-in-up"
                style={{ animationDelay:`${i*0.08}s` }}>
                <div className="text-3xl mb-2.5 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-black text-teal-600 mb-1.5">{stat.value}</div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══ TRUSTED BY ════════════════════════════════════════════ */}
      <section className="space-y-8 animate-fade-in-up">
        <div className="text-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Trusted by Leading Healthcare Institutions</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {TRUSTED_BY.map((name) => (
            <div key={name}
              className="glass-card rounded-2xl px-6 py-3 text-sm font-black text-slate-500 hover:text-teal-600 hover:border-teal-200 border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
              <span className="mr-2 opacity-50">🏥</span>
              {name}
            </div>
          ))}
        </div>
      </section>


      {/* ══ REAL DOCTORS FROM API ════════════════════════════════ */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-clinical-pulse" />
              Live from Database
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Available <span className="text-gradient-teal">Specialists</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">Book a confirmed appointment instantly with our verified practitioners</p>
          </div>
          <Link to="/doctors"
            className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            View All Doctors
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? Array.from({length:8}).map((_,i) => <DoctorSkeleton key={i} />)
            : doctors.slice(0, 8).map((doc, i) => <DoctorCard key={doc.id} doctor={doc} idx={i} />)
          }
        </div>

        <div className="text-center md:hidden mt-8">
          <Link to="/doctors"
            className="inline-flex items-center justify-center w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:-translate-y-1 transition-all">
            Browse All Doctors →
          </Link>
        </div>
      </section>

      {/* ══ SPECIALTIES – DARK GLASSMORPHIC CARDS ═════════════════ */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Browse by Specialty</h2>
          <p className="text-slate-500 font-medium text-lg">Find specialized clinical services tailored to your health needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SPECIALTIES.map((spec, i) => (
            <Link key={spec.name} to={`/doctors?specialization=${spec.name}`}
              className="group relative glass-card rounded-[2rem] overflow-hidden p-8 hover:-translate-y-2 transition-all duration-500 animate-fade-in-up border border-slate-100 hover:border-teal-200/50 shadow-sm"
              style={{ animationDelay:`${i*0.07}s` }}>
              {/* Left accent border glow */}
              <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-full bg-gradient-to-b ${spec.gradient} shadow-[0_0_12px_rgba(45,212,191,0.4)]`} />
              {/* Subtle bg mesh */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_70%_30%,rgba(45,212,191,0.3),transparent_60%)]" />
              <div className="relative z-10 flex items-start gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${spec.gradient} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 group-hover:shadow-[0_0_25px_rgba(45,212,191,0.3)] text-white`}>
                  {spec.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-black text-slate-800 mb-1.5 group-hover:text-teal-600 transition-colors">{spec.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{spec.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS – VERTICAL TIMELINE ═════════════════════ */}
      <section className="space-y-16 py-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            How <span className="text-gradient-teal">MediBook</span> Works
          </h2>
          <p className="text-slate-500 font-medium text-lg">From registration to appointment in under 3 minutes</p>
        </div>

        {/* Timeline layout */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical glowing line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-500 via-indigo-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.4)] md:-translate-x-1/2" />

          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step}
              className={`relative flex items-start gap-8 mb-12 last:mb-0 animate-fade-in-up ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              style={{ animationDelay:`${i*0.12}s` }}>
              {/* Timeline dot */}
              <div className="absolute left-8 md:left-1/2 w-5 h-5 -translate-x-1/2 z-20">
                <div className="w-5 h-5 bg-teal-500 rounded-full border-4 border-white shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
              </div>
              {/* Spacer for mobile */}
              <div className="w-16 md:hidden flex-shrink-0" />
              {/* Card */}
              <div className={`flex-1 glass-card rounded-[2rem] p-8 border border-slate-100 hover:shadow-[0_20px_40px_-15px_rgba(13,148,136,0.15)] hover:-translate-y-1 transition-all duration-500 ${
                i % 2 === 0 ? "md:mr-auto md:ml-0 md:pr-16" : "md:ml-auto md:mr-0 md:pl-16"
              } md:w-[calc(50%-2rem)]`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-200/80 rounded-[1.25rem] flex items-center justify-center text-3xl shadow-md">
                    {step.icon}
                  </div>
                  <div className="text-xs font-black text-teal-600 uppercase tracking-[0.2em] bg-teal-50 px-4 py-1.5 rounded-full">{step.step}</div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{step.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ══ TESTIMONIALS – GLASSMORPHIC ══════════════════════════ */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            What Our <span className="text-gradient-teal">Users</span> Say
          </h2>
          <p className="text-slate-500 font-medium text-lg">Real stories from patients and practitioners</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name}
              className="glass-card rounded-[2rem] p-8 border border-slate-100 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay:`${i*0.1}s` }}>
              {/* Large quotation mark */}
              <div className="absolute top-4 right-6 text-8xl font-black text-teal-500/10 leading-none select-none pointer-events-none">"</div>
              {/* Subtle glass border glow */}
              <div className="absolute inset-0 rounded-[2rem] border border-teal-500/0 hover:border-teal-500/10 transition-colors duration-500 pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <StarRating rating={t.rating} size="lg" />
                <p className="text-slate-700 font-medium leading-relaxed text-base italic">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ══ FEATURES GRID ════════════════════════════════════════ */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Why Choose <span className="text-gradient-teal">MediBook</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg">Enterprise-grade healthcare platform built for patients and practitioners</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {FEATURES.map((feat, i) => {
            const c = COLOR_MAP[feat.color] || COLOR_MAP.teal;
            return (
              <div key={feat.title}
                className={`glass-card rounded-[2rem] p-8 border ${c.border} hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 animate-fade-in-up flex items-start gap-5`}
                style={{ animationDelay:`${i*0.08}s` }}>
                <div className={`w-14 h-14 ${c.bg} rounded-[1.25rem] flex items-center justify-center text-2xl flex-shrink-0`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ══ MASSIVE CTA BANNER ═══════════════════════════════════ */}
      <section className="hero-gradient hero-mesh rounded-[3rem] overflow-hidden relative shadow-2xl my-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/25 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-cyan-400/20 rounded-full blur-[100px] animate-blob-delay" />
          <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[80px] animate-blob-delay2" />
        </div>
        {/* Dot grid */}
        <div className="absolute inset-0 hero-dot-grid opacity-[0.05] pointer-events-none" />

        <div className="relative z-10 px-6 md:px-20 py-14 md:py-16 text-center space-y-6 md:space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-widest bg-white/60">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-clinical-pulse" />
            Get Started Today
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] max-w-4xl">
            Ready to take control <br className="hidden sm:block" />of your healthcare?
          </h2>
          <p className="text-slate-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Join patients who've simplified their healthcare journey with MediBook. It's free to sign up.
          </p>

          {/* Trust stats - countdown style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 w-full max-w-4xl pt-4">
            {CTA_TRUST_STATS.map((s, i) => (
              <div key={s.label}
                className="bg-white rounded-2xl px-4 py-5 border border-slate-150 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-2xl md:text-3xl font-black text-teal-600 drop-shadow-[0_0_8px_rgba(45,212,191,0.2)]">{s.value}</div>
                <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6 w-full sm:w-auto">
            <Link to="/register"
              className="w-full sm:w-auto bg-teal-600 text-white hover:bg-teal-700 font-black py-5 px-16 rounded-2xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/35 hover:-translate-y-2 transition-all duration-300 text-xl">
              Create Free Account
            </Link>
            <Link to="/doctors"
              className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black py-5 px-16 rounded-2xl hover:-translate-y-2 transition-all duration-300 text-xl shadow-sm">
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
