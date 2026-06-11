import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDoctorProfile } from "../hooks/useDoctors";
import { useBookAppointment } from "../hooks/useAppointments";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

// Same photo pool as DoctorList
const DOCTOR_PHOTOS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?w=600&h=600&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&h=600&fit=crop&crop=face",
];

const SPEC_COLORS = {
  Cardiology:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100",    icon: "❤️" },
  Pediatrics:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100",   icon: "👶" },
  Neurology:     { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100",  icon: "🧠" },
  Orthopedics:   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-100",    icon: "🦴" },
  Dermatology:   { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100", icon: "✨" },
  Ophthalmology: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100",     icon: "👁️" },
  Psychiatry:    { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-100",  icon: "🧬" },
};

function getDoctorPhoto(id) {
  return DOCTOR_PHOTOS[id % DOCTOR_PHOTOS.length];
}

function getSpecColors(spec) {
  return SPEC_COLORS[spec] || { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", icon: "🏥" };
}

function getDoctorRating(id) {
  const ratings = [4.7, 4.8, 4.9, 4.6, 4.8, 5.0, 4.7, 4.9, 4.8, 4.6];
  return ratings[id % ratings.length];
}

function getDoctorReviews(id) {
  const reviews = [128, 245, 312, 87, 193, 421, 156, 289, 74, 367];
  return reviews[id % reviews.length];
}

function StarRating({ rating, size = "sm" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className={`${s} ${n <= Math.round(rating) ? "star-filled" : "star-empty"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-sm font-bold text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

const formatTimeOnly = (dateStr) =>
  new Date(dateStr).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const groupSlotsByDate = (slots) => {
  const groups = {};
  if (!slots) return groups;
  const sorted = [...slots].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  sorted.forEach((slot) => {
    const dateStr = new Date(slot.startTime).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(slot);
  });
  return groups;
};

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState({ type: "", text: "" });
  const [photoError, setPhotoError] = useState(false);

  const { data: doctor, isLoading, isError } = useDoctorProfile(parseInt(id));
  const bookMutation = useBookAppointment();

  const handleBook = async (slotId) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (user?.role !== "PATIENT") {
      setMessage({ type: "error", text: "Only patients can book appointments" });
      return;
    }
    setMessage({ type: "", text: "" });
    try {
      await bookMutation.mutateAsync(slotId);
      setMessage({ type: "success", text: "Consultation booked successfully! Check your dashboard." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Booking failed. Please try again." });
    }
  };

  if (isLoading) return <LoadingSpinner text="Loading physician profile..." />;
  if (isError || !doctor) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 font-medium mb-6">Doctor profile could not be loaded.</p>
        <Link to="/doctors" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
          ← Back to Directory
        </Link>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(doctor.slots);
  const rating = getDoctorRating(doctor.id);
  const reviews = getDoctorReviews(doctor.id);
  const spec = getSpecColors(doctor.specialization);
  const photoUrl = getDoctorPhoto(doctor.id);
  const totalSlots = doctor.slots?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back nav */}
      <Link
        to="/doctors"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-600 font-semibold text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to practitioner directory
      </Link>

      <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />

      {/* ─── HERO BANNER ──────────────────────────────────── */}
      <div className="profile-hero p-0.5">
        {/* Background image with overlay */}
        <div className="relative rounded-[22px] overflow-hidden">
          <div className="absolute inset-0 hero-gradient hero-mesh" />
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-blob pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl animate-blob-delay pointer-events-none" />

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Doctor Photo */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  {!photoError ? (
                    <img
                      src={photoUrl}
                      alt={`Dr. ${doctor.user.name}`}
                      className="w-full h-full object-cover object-top"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-5xl font-extrabold">
                      {doctor.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-emerald-500 text-white rounded-full px-2.5 py-1 text-xs font-bold shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-clinical-pulse" />
                  Available
                </div>
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${spec.bg} ${spec.text} text-xs font-bold px-3 py-1 rounded-full border ${spec.border}`}>
                    {spec.icon} {doctor.specialization}
                  </span>
                  <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20" title="Verified Professional">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  Dr. {doctor.user.name}
                </h1>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <StarRating rating={rating} size="lg" />
                  <span className="text-slate-500 text-sm font-bold">({reviews} reviews)</span>
                </div>

                {/* Quick Stats Row */}
                <div className="mt-4 flex flex-wrap gap-4">
                  {[
                    { label: "Experience", value: `${doctor.experienceYears} years` },
                    { label: "Consultation", value: `$${doctor.consultationFee}` },
                    { label: "Open Slots", value: `${totalSlots} available` },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/90 border border-slate-200/80 rounded-xl px-4 py-2 shadow-sm backdrop-blur-sm">
                      <div className="text-xs text-slate-500 font-bold">{stat.label}</div>
                      <div className="text-sm font-black text-slate-800">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Bio Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              About the Doctor
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {doctor.bio ||
                "Certified healthcare practitioner committed to patient-first values, clinical quality standards, and continuous professional excellence. Dedicated to delivering evidence-based care with compassion."}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Credentials
            </h2>

            {[
              { label: "Specialty", value: doctor.specialization, icon: "🏥" },
              { label: "Experience", value: `${doctor.experienceYears} Years Active`, icon: "📅" },
              { label: "Consultation Fee", value: `$${doctor.consultationFee} / session`, icon: "💳" },
              { label: "Patient Rating", value: `${rating.toFixed(1)} / 5.0 (${reviews} reviews)`, icon: "⭐" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance badges */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl border border-teal-100 p-5 space-y-3">
            <p className="text-xs font-extrabold text-teal-700 uppercase tracking-widest">Compliance & Safety</p>
            {["HIPAA Certified", "Board Certified MD", "256-bit Encrypted Data", "24/7 Support"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm font-semibold text-teal-800">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Scheduling Console */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Schedule a Consultation
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Select an open time slot to book instantly
              </p>
            </div>
            {totalSlots > 0 && (
              <span className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold px-3 py-1.5 rounded-xl">
                {totalSlots} slots open
              </span>
            )}
          </div>

          {Object.keys(groupedSlots).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, slotsForDate]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-3.5 py-1.5 text-sm font-bold">
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {date}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{slotsForDate.length} {slotsForDate.length === 1 ? "slot" : "slots"}</span>
                  </div>

                  {/* Slot grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {slotsForDate.map((slot) => {
                      const isReserving = bookMutation.isPending && bookMutation.variables === slot.id;
                      return (
                        <div
                          key={slot.id}
                          className="group flex flex-col justify-between p-4 border border-slate-200/80 rounded-2xl hover:border-teal-300 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50/50 transition-all duration-200"
                        >
                          <div className="mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 bg-teal-50 border border-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Time</span>
                              <span className="text-sm font-extrabold text-slate-800 leading-tight">
                                {formatTimeOnly(slot.startTime)}–{formatTimeOnly(slot.endTime)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleBook(slot.id)}
                            disabled={bookMutation.isPending}
                            className="w-full bg-teal-600 hover:bg-teal-700 group-hover:shadow-md disabled:opacity-50 text-white font-bold py-2 rounded-xl text-xs shadow-sm hover:shadow transition-all"
                          >
                            {isReserving ? (
                              <span className="flex items-center justify-center gap-1.5">
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Reserving...
                              </span>
                            ) : "Book Slot"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-800 mb-1.5">No Available Consultations</h4>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                This physician currently has no open consultation slots. Please check back later or browse other specialists.
              </p>
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 mt-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Browse Other Doctors
              </Link>
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-indigo-800">Sign in to book</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  You need a patient account to book appointments.{" "}
                  <Link to="/login" className="underline font-bold hover:text-indigo-800">Sign in</Link>{" "}
                  or{" "}
                  <Link to="/register" className="underline font-bold hover:text-indigo-800">create one free</Link>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
