import { useState } from "react";
import { useSlots, useCreateSlot, useDeleteSlot } from "../hooks/useSlots";
import { useAppointments, useDailySchedule, useCancelAppointment } from "../hooks/useAppointments";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const slotSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("slots");

  // Pagination states
  const [slotsPage, setSlotsPage] = useState(1);
  const slotsLimit = 5;

  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const appointmentsLimit = 6;

  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(slotSchema),
  });

  // Query Hooks
  const { data: slotsData, isLoading: slotsLoading } = useSlots(slotsPage, slotsLimit);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments(appointmentsPage, appointmentsLimit);
  const { data: schedule, isLoading: scheduleLoading } = useDailySchedule(scheduleDate);

  const createMutation = useCreateSlot();
  const deleteMutation = useDeleteSlot();
  const cancelMutation = useCancelAppointment();

  const slots = slotsData?.data || [];
  const slotsMeta = slotsData?.meta || { total: 0, page: 1, limit: slotsLimit, totalPages: 1 };

  const appointments = appointmentsData?.data || [];
  const appointmentsMeta = appointmentsData?.meta || { total: 0, page: 1, limit: appointmentsLimit, totalPages: 1 };

  const handleCreateSlot = async (data) => {
    setMessage({ type: "", text: "" });

    try {
      await createMutation.mutateAsync(data);
      setMessage({ type: "success", text: "Consultation slot created successfully" });
      reset();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create slot" });
    }
  };

  const handleDeleteSlot = async (id) => {
    setMessage({ type: "", text: "" });
    try {
      await deleteMutation.mutateAsync(id);
      setMessage({ type: "success", text: "Consultation slot deleted successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to delete slot" });
    }
  };

  const handleCancelAppointment = async (id) => {
    setMessage({ type: "", text: "" });
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: "success", text: "Appointment cancelled successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to cancel appointment" });
    }
  };

  const handleScheduleDateChange = (date) => {
    setScheduleDate(date);
  };

  const tabs = [
    { id: "slots", label: "Manage Availability", icon: "🗓️" },
    { id: "appointments", label: "Patient Appointments", icon: "👥" },
    { id: "schedule", label: "Daily Timeline", icon: "🕒" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Physician Console</h1>
        <p className="text-slate-500 font-medium">Manage clinical slots, review appointment bookings, and access daily queues</p>
      </div>

      <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: "", text: "" })} />

      {/* Tabs */}
      <div className="flex border border-slate-200/60 gap-1.5 bg-slate-50 p-1.5 rounded-full shadow-sm max-w-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-extrabold text-xs uppercase tracking-wider rounded-full transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/20"
                : "text-slate-500 hover:text-slate-800 hover:bg-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "slots" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Create slot form */}
          <div className="lg:col-span-2 glass-card rounded-[2rem] border border-slate-100 p-8 clinical-shadow-hover transition-all duration-300 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add Clinical Availability</h2>
              <p className="text-slate-500 text-xs mt-0.5">Specify start and end times to open a booking window</p>
            </div>
            <form onSubmit={handleSubmit(handleCreateSlot)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label>
                <input
                  type="datetime-local"
                  {...register("startTime")}
                  className={`w-full px-4 py-3 border ${errors.startTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-teal-500'} rounded-xl focus:ring-2 outline-none font-medium text-slate-700`}
                />
                {errors.startTime && <p className="mt-1 text-xs text-red-500 font-medium">{errors.startTime.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                <input
                  type="datetime-local"
                  {...register("endTime")}
                  className={`w-full px-4 py-3 border ${errors.endTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-teal-500'} rounded-xl focus:ring-2 outline-none font-medium text-slate-700`}
                />
                {errors.endTime && <p className="mt-1 text-xs text-red-500 font-medium">{errors.endTime.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-sm transition-all hover:shadow"
              >
                {isSubmitting || createMutation.isPending ? "Opening Slot..." : "Release Slot"}
              </button>
            </form>
          </div>


          {/* Slots listing */}
          <div className="lg:col-span-3 glass-card rounded-[2rem] border border-slate-100 p-8 clinical-shadow-hover transition-all duration-300 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Available Windows</h2>
              <p className="text-slate-500 text-xs mt-0.5">Your open consultation times available for patients to book</p>
            </div>
            {slotsLoading ? (
              <LoadingSpinner text="Retrieving open slots..." />
            ) : slots.length > 0 ? (
              <>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {slots.map((slot) => {
                    const isAvailable = slot.status === "AVAILABLE";
                    const isDeleting = deleteMutation.isPending && deleteMutation.variables === slot.id;
                    return (
                      <div 
                        key={slot.id} 
                        className="flex items-center justify-between p-4 bg-white border border-slate-150 rounded-2xl hover:border-teal-200 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm sm:text-base">
                            <span className="text-slate-400">🕒</span>
                            <span>{formatDateTime(slot.startTime)}</span>
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                            isAvailable 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                              : "bg-slate-50 text-slate-500 border-slate-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-slate-400"}`}></span>
                            {slot.status}
                          </span>
                        </div>
                        {isAvailable && (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-55"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Slots Pagination Footer */}
                {slotsMeta.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                    <button
                      onClick={() => setSlotsPage((p) => Math.max(1, p - 1))}
                      disabled={slotsPage <= 1}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold disabled:opacity-50 transition-all border border-slate-200/50"
                    >
                      Prev
                    </button>
                    <span className="text-xs text-slate-500 font-bold">Page {slotsPage} of {slotsMeta.totalPages}</span>
                    <button
                      onClick={() => setSlotsPage((p) => Math.min(slotsMeta.totalPages, p + 1))}
                      disabled={slotsPage >= slotsMeta.totalPages}
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold disabled:opacity-50 transition-all border border-slate-200/50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
                <svg className="w-8 h-8 text-slate-350 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-slate-500 text-sm font-semibold">No clinical slots created yet.</p>
                <p className="text-slate-400 text-xs max-w-xs mx-auto mt-1">Add details on the left panel to register your calendar availability.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="glass-card rounded-[2rem] border border-slate-100 p-8 md:p-10 clinical-shadow-hover transition-all duration-300 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Booked Consultations</h2>
            <p className="text-slate-500 text-xs mt-0.5">Comprehensive list of patient reservations and booking status</p>
          </div>
          {appointmentsLoading ? (
            <LoadingSpinner text="Retrieving patient appointments..." />
          ) : appointments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appt) => {
                  const isBooked = appt.status === "BOOKED";
                  return (
                    <div key={appt.id} className="bg-white p-5 border border-slate-200/80 rounded-2xl space-y-4 hover:border-teal-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-teal-50 text-teal-700 font-extrabold text-sm rounded-full flex items-center justify-center shrink-0 border border-teal-100">
                            {appt.patient?.name ? appt.patient.name.charAt(0).toUpperCase() : "P"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{appt.patient?.name || "Patient"}</h4>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 truncate">{appt.patient?.email}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 shrink-0 ${
                          isBooked 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isBooked ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                          {appt.status}
                        </span>
                      </div>
                      
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider block">Session Schedule</span>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">{formatDateTime(appt.slot.startTime)}</p>
                        </div>

                        {isBooked && (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            disabled={(cancelMutation.isPending && cancelMutation.variables === appt.id) || new Date(appt.slot.startTime) <= new Date()}
                            className="text-red-650 hover:text-white hover:bg-red-600 border border-red-150 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 shrink-0"
                          >
                            {(cancelMutation.isPending && cancelMutation.variables === appt.id) ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Appointments Pagination Footer */}
              {appointmentsMeta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-4">
                  <button
                    onClick={() => setAppointmentsPage((p) => Math.max(1, p - 1))}
                    disabled={appointmentsPage <= 1}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold disabled:opacity-50 transition-all border border-slate-200/50"
                  >
                    Previous Page
                  </button>
                  <span className="text-xs text-slate-500 font-bold">Page {appointmentsPage} of {appointmentsMeta.totalPages}</span>
                  <button
                    onClick={() => setAppointmentsPage((p) => Math.min(appointmentsMeta.totalPages, p + 1))}
                    disabled={appointmentsPage >= appointmentsMeta.totalPages}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl text-xs font-bold disabled:opacity-50 transition-all border border-slate-200/50"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
              <svg className="w-10 h-10 text-slate-350 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-slate-500 text-sm font-semibold">No appointments registered yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="glass-card rounded-[2rem] border border-slate-100 p-8 md:p-10 clinical-shadow-hover transition-all duration-300 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Daily Queue Timeline</h2>
              <p className="text-slate-500 text-xs mt-0.5">Chronological list of patient consultations for the chosen day</p>
            </div>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => handleScheduleDateChange(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {scheduleLoading ? (
            <LoadingSpinner text="Retrieving daily timeline..." />
          ) : schedule.length > 0 ? (
            <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
              {schedule.map((item) => (
                <div key={item.id} className="relative">
                  {/* Timeline point indicator */}
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm"></span>
                  
                  <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-100/30 space-y-2">
                    <span className="text-xs text-teal-600 font-bold">
                      {new Date(item.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-base">{item.patient.name}</h4>
                    <p className="text-xs text-slate-500">Contact: {item.patient.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-8 h-8 text-slate-350 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 text-sm font-semibold">No appointments scheduled for this date.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
