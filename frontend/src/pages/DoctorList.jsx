import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDoctors } from "../hooks/useDoctors";
import LoadingSpinner from "../components/LoadingSpinner";

// Deterministic Unsplash photo for a doctor by ID
// Uses a curated pool of real medical professional photos
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

// Specialty color map for badges
const SPEC_COLORS = {
  Cardiology:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-100"    },
  Pediatrics:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100"   },
  Neurology:     { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-100"  },
  Orthopedics:   { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-100"    },
  Dermatology:   { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100" },
  Ophthalmology: { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-100"     },
  Psychiatry:    { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-100"  },
  Oncology:      { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-100"     },
  Gynecology:    { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-100"    },
};

function getDoctorPhoto(doctorId) {
  return DOCTOR_PHOTOS[doctorId % DOCTOR_PHOTOS.length];
}

function getSpecColors(spec) {
  return SPEC_COLORS[spec] || { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100" };
}

// Deterministic rating based on ID
function getDoctorRating(doctorId) {
  const ratings = [4.7, 4.8, 4.9, 4.6, 4.8, 5.0, 4.7, 4.9, 4.8, 4.6];
  return ratings[doctorId % ratings.length];
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "star-filled" : "star-empty"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-slate-600">{rating.toFixed(1)}</span>
    </div>
  );
}

// Skeleton card for loading state
function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="h-48 shimmer-bg" />
      <div className="p-5 space-y-3">
        <div className="h-5 shimmer-bg rounded-lg w-3/4" />
        <div className="h-4 shimmer-bg rounded-lg w-1/2" />
        <div className="h-3 shimmer-bg rounded-full w-full" />
        <div className="h-3 shimmer-bg rounded-full w-4/5" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 shimmer-bg rounded-lg w-1/3" />
          <div className="h-9 shimmer-bg rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default function DoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const specialization = searchParams.get("specialization") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 6;

  const [searchInput, setSearchInput] = useState(search);
  const [specializationInput, setSpecializationInput] = useState(specialization);
  const [photoErrors, setPhotoErrors] = useState({});

  const { data, isLoading, isError } = useDoctors(search, specialization, page, limit);

  const doctors = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit, totalPages: 1 };

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setSpecializationInput(searchParams.get("specialization") || "");
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchInput) params.search = searchInput;
    if (specializationInput) params.specialization = specializationInput;
    params.page = 1;
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = {};
    if (search) params.search = search;
    if (specialization) params.specialization = specialization;
    params.page = newPage;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSpecializationInput("");
    setSearchParams({});
  };

  const handlePhotoError = (doctorId) => {
    setPhotoErrors((prev) => ({ ...prev, [doctorId]: true }));
  };

  const QUICK_SPECS = ["Cardiology", "Pediatrics", "Neurology", "Orthopedics", "Dermatology"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find a <span className="text-gradient-teal">Medical Specialist</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Browse, view schedules, and book slots instantly with certified practitioners
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold px-4 py-2 rounded-xl self-start md:self-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-clinical-pulse" />
            {meta.total} {meta.total === 1 ? "Practitioner" : "Practitioners"} Available
          </div>
        )}
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch animate-fade-in-up-delay-1"
      >
        <div className="flex-1 relative flex items-center">
          <svg className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search practitioners by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all text-sm"
          />
        </div>
        <div className="flex-1 relative flex items-center">
          <svg className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          </svg>
          <input
            type="text"
            placeholder="Filter by specialty (e.g. Cardiology)..."
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 lg:flex-initial bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          {(searchInput || specializationInput) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-3 rounded-xl transition-all"
              title="Clear filters"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Quick Specialty Pills */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up-delay-1">
        <span className="text-xs text-slate-500 font-semibold self-center mr-1">Quick filter:</span>
        {QUICK_SPECS.map((s) => {
          const c = getSpecColors(s);
          const isActive = specialization === s;
          return (
            <button
              key={s}
              onClick={() => {
                const params = {};
                if (search) params.search = search;
                if (!isActive) params.specialization = s;
                params.page = 1;
                setSearchParams(params);
              }}
              className={`spec-pill text-xs border ${isActive ? `${c.bg} ${c.text} ${c.border} shadow-sm` : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
            >
              {s}
              {isActive && (
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {isError && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl font-medium text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Failed to load medical specialists. Please try again.
        </div>
      )}

      {/* Doctor Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, idx) => {
              const rating = getDoctorRating(doctor.id);
              const spec = getSpecColors(doctor.specialization);
              const photoUrl = getDoctorPhoto(doctor.id);
              const hasPhotoError = photoErrors[doctor.id];

              return (
                <div
                  key={doctor.id}
                  className="doctor-card group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Photo section */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-50">
                    {!hasPhotoError ? (
                      <img
                        src={photoUrl}
                        alt={`Dr. ${doctor.user.name}`}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={() => handlePhotoError(doctor.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-50">
                        <div className="text-6xl font-extrabold text-teal-200">
                          {doctor.user.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    {/* Online dot */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-clinical-pulse" />
                      Available
                    </div>
                    {/* Experience badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {doctor.experienceYears} yrs exp
                      </span>
                    </div>
                    {/* Specialty badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className={`${spec.bg} ${spec.text} ${spec.border} border rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-sm`}>
                        {doctor.specialization}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-3">
                    {/* Name & verified */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-800 text-base group-hover:text-teal-700 transition-colors leading-tight">
                            Dr. {doctor.user.name}
                          </h3>
                          <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Verified Practitioner">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <StarRating rating={rating} />
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                      {doctor.bio || "Certified medical practitioner committed to evidence-based healthcare and patient wellness."}
                    </p>

                    {/* Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Fee</span>
                        <span className="text-lg font-extrabold text-slate-800">${doctor.consultationFee}</span>
                      </div>
                      <Link
                        to={`/doctors/${doctor.id}`}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5"
                      >
                        Book Now
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {doctors.length === 0 && (
              <div className="col-span-full text-center bg-white border border-slate-200/50 rounded-3xl py-20 px-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Specialists Found</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed mb-5">
                  We couldn't find any practitioners matching your criteria. Try resetting filters or searching with different keywords.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-slate-200/60 px-5 py-4 rounded-2xl shadow-sm">
              <p className="text-sm text-slate-500 font-medium hidden sm:block">
                Showing{" "}
                <span className="font-bold text-slate-700">{((page - 1) * limit) + 1}</span>–
                <span className="font-bold text-slate-700">{Math.min(page * limit, meta.total)}</span>{" "}
                of <span className="font-bold text-slate-700">{meta.total}</span> practitioners
              </p>
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                {Array.from({ length: meta.totalPages }, (_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${
                        isCurrent
                          ? "bg-teal-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= meta.totalPages}
                  className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
