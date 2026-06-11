import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppointments, useCancelAppointment } from "../hooks/useAppointments";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PatientDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 6; // Display 6 records per page for a clean grid layout
  const [message, setMessage] = useState({ type: "", text: "" });

  const { data, isLoading, isError } = useAppointments(page, limit);
  const cancelMutation = useCancelAppointment();

  const appointments = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit, totalPages: 1 };

  const handleCancel = async (id) => {
    setMessage({ type: "", text: "" });
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: "success", text: "Appointment cancelled successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Cancellation failed" });
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (isLoading) return <LoadingSpinner text="Loading patient dashboard..." />;

  const now = new Date();
  const upcomingCount = appointments.filter(
    (a) => a.status === "BOOKED" && new Date(a.slot.startTime) > now
  ).length;

  const uniqueDoctorsCount = new Set(appointments.map((a) => a.slot.doctor.id)).size;
  const nextAppt = appointments.find(
    (a) => a.status === "BOOKED" && new Date(a.slot.startTime) > now
  );

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="hero-gradient hero-mesh rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm border border-slate-200/60 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            👋 Welcome Back
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Patient Portal</h1>
          <p className="text-slate-655 text-sm font-medium max-w-xl">Manage your consultations, access clinical details, and coordinate with specialist physicians.</p>
        </div>
        <Link
          to="/doctors"
          className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md shadow-teal-600/15 transition-all duration-300 hover:-translate-y-0.5 relative z-10 shrink-0 text-xs uppercase tracking-wider"
        >
          New Consultation
        </Link>
      </div>

      <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />

      {/* Overview Cards - Compact & Patient-tailored */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm border-l-4 border-l-teal-500">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl shrink-0">📊</div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Total Bookings</span>
            <span className="text-lg font-black text-slate-800">{meta.total}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm border-l-4 border-l-indigo-500">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">👨‍⚕️</div>
          <div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Specialists Seen</span>
            <span className="text-lg font-black text-slate-800">{uniqueDoctorsCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm border-l-4 border-l-cyan-500">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-xl shrink-0">📅</div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">
              Next Consultation {upcomingCount > 0 && `(${upcomingCount} upcoming)`}
            </span>
            {nextAppt ? (
              <span className="text-xs font-bold text-teal-700 truncate block">
                Dr. {nextAppt.slot.doctor.user.name.split(" ").slice(-1)[0]} · {new Date(nextAppt.slot.startTime).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-400 block">None scheduled</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            My Clinical Consultations
          </h2>
          {isError && (
            <div className="bg-red-50 text-red-700 border border-red-150 p-4 rounded-xl font-medium">
              Failed to load appointments. Please try again.
            </div>
          )}
          {appointments.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onCancel={handleCancel}
                    cancelling={cancelMutation.isPending && cancelMutation.variables === appt.id}
                    showCancel={appt.status === "BOOKED"}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200/60 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm mt-4">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="relative inline-flex items-center rounded-xl border border-slate-205 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= meta.totalPages}
                      className="relative ml-3 inline-flex items-center rounded-xl border border-slate-205 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-700">{((page - 1) * limit) + 1}</span> to{" "}
                        <span className="font-bold text-slate-700">
                          {Math.min(page * limit, meta.total)}
                        </span>{" "}
                        of <span className="font-bold text-slate-700">{meta.total}</span> records
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm border border-slate-200/80 overflow-hidden" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page <= 1}
                          className="relative inline-flex items-center px-3 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {Array.from({ length: meta.totalPages }, (_, idx) => {
                          const pNum = idx + 1;
                          const isCurrent = pNum === page;
                          return (
                            <button
                              key={pNum}
                              onClick={() => handlePageChange(pNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-xs font-bold transition-all ${
                                isCurrent
                                  ? "z-10 bg-teal-600 text-white"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {pNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= meta.totalPages}
                          className="relative inline-flex items-center px-3 py-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center text-slate-500">
              <p className="font-semibold mb-3 text-sm">No consultations scheduled.</p>
              <Link to="/doctors" className="text-teal-600 font-bold hover:underline text-sm">Browse clinical specialist calendar &rarr;</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onCancel, cancelling, showCancel }) {
  const isCancelled = appt.status === "CANCELLED";
  const isPast = new Date(appt.slot.startTime) <= new Date();
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-350">
      {/* Doctor info & Specialty */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 bg-teal-50 text-teal-700 font-extrabold text-sm rounded-xl flex items-center justify-center shrink-0 border border-teal-100">
          {appt.slot.doctor.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">Dr. {appt.slot.doctor.user.name}</h4>
            <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] text-teal-600 font-bold tracking-wider uppercase block mt-0.5">{appt.slot.doctor.specialization}</span>
        </div>
      </div>

      {/* Date and Time */}
      <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-150">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{formatDateTime(appt.slot.startTime)}</span>
      </div>

      {/* Status & Cancel Action */}
      <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end">
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
          isCancelled 
            ? "bg-red-50 text-red-700 border-red-100" 
            : "bg-emerald-50 text-emerald-700 border-emerald-100"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`}></span>
          {appt.status}
        </span>

        {showCancel && (
          <button
            onClick={() => onCancel(appt.id)}
            disabled={cancelling || isPast}
            className="text-red-650 hover:text-white hover:bg-red-600 border border-red-150 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 shrink-0"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
