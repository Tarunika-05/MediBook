import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get("/analytics", {
        params: { from: dateRange.from, to: dateRange.to },
      });
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Failed to query analytics engine"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <LoadingSpinner text="Consulting business intelligence ledger..." />;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Insights Dashboard</h1>
          <p className="text-slate-500 font-medium">Visual metrics tracking doctor utilization, cancellations, and booking timelines</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
          />
          <span className="text-slate-400 text-xs font-bold uppercase">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}

      {data && (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-teal-50/70 to-teal-100/30 p-6 rounded-3xl border border-teal-200/50 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider block">Total Bookings</span>
                <span className="text-3xl font-extrabold text-slate-800">{data.kpiSummary.totalBookings}</span>
                <p className="text-slate-500 text-[11px] font-semibold">Confirmed clinical schedules</p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50">📊</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/70 to-indigo-100/30 p-6 rounded-3xl border border-indigo-200/50 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider block">Active Specialists</span>
                <span className="text-3xl font-extrabold text-indigo-700">{data.kpiSummary.activeDoctors}</span>
                <p className="text-slate-500 text-[11px] font-semibold">Registered in local network</p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50">👨‍⚕️</div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50/70 to-cyan-100/30 p-6 rounded-3xl border border-cyan-200/50 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider block">Average Utilization</span>
                <span className="text-3xl font-extrabold text-cyan-700">{data.kpiSummary.utilizationRate}%</span>
                <p className="text-slate-500 text-[11px] font-semibold">Booked vs total created slots</p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50">📅</div>
            </div>

            <div className="bg-gradient-to-br from-rose-50/70 to-rose-100/30 p-6 rounded-3xl border border-rose-200/50 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-black uppercase tracking-wider block">Cancellation Rate</span>
                <span className="text-3xl font-extrabold text-rose-700">{data.cancellationSummary.cancellationRate}%</span>
                <p className="text-slate-505 text-[11px] font-semibold">{data.cancellationSummary.cancelledAppointments} cancelled out of {data.cancellationSummary.totalAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-white/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50">❌</div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bookings Over Time (Line Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md hover:border-teal-200 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse block"></span>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Bookings Trend</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Daily volume of scheduled appointments</p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.bookingsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Line type="monotone" dataKey="bookings" name="Appointments" stroke="#0d9488" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Specialization Breakdown (Bar Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md hover:border-teal-200 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse block"></span>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Bookings by Specialty</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Distribution of consultations across disciplines</p>
                </div>
              </div>
              <div className="h-72">
                {data.specializationBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.specializationBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="specialization" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                      <Bar dataKey="count" name="Bookings" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">No specialty data available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Peak Hours (Bar Chart) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md hover:border-teal-200 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse block"></span>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Busy Slot Timings</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Total created slots categorized by hour of day</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" name="Slot Count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doctor Utilization rates list */}
            <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md hover:border-teal-200 hover:shadow-lg transition-all duration-300 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse block"></span>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Doctor Performance & Utilization</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Utilization percentage (booked/total slots) by practitioner</p>
                </div>
              </div>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {data.doctorUtilization.length > 0 ? (
                  data.doctorUtilization.map((doc, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{doc.doctor_name} ({doc.specialization})</span>
                        <span className="font-extrabold text-teal-600">{doc.utilization_rate}% ({doc.booked_slots}/{doc.total_slots} slots)</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full rounded-full" 
                          style={{ width: `${Math.min(100, doc.utilization_rate)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-12">No physician slots data available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
