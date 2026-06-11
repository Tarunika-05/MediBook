import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Alert from "../components/Alert";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["PATIENT", "DOCTOR"]),
  specialization: z.string().optional(),
  experienceYears: z.coerce.number().min(0, "Must be positive").optional(),
  consultationFee: z.coerce.number().min(0, "Must be positive").optional(),
  bio: z.string().optional(),
});

export default function Register() {
  const [error, setError] = useState("");
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "PATIENT",
      experienceYears: 0,
      consultationFee: 0,
    },
  });

  const selectedRole = useWatch({
    control,
    name: "role",
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      if (data.role === "DOCTOR") {
        payload.specialization = data.specialization || "General";
        payload.experienceYears = data.experienceYears;
        payload.consultationFee = data.consultationFee;
        payload.bio = data.bio;
      }

      const user = await registerAuth(payload);
      navigate(user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto my-3">
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-teal-50 rounded-xl text-teal-600 border border-teal-100/60 mb-2.5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Create your MediBook Account</h1>
          <p className="text-slate-500 text-xs mt-0.5">Register as a patient or list your practice as a doctor</p>
        </div>

        <Alert type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                {...register("name")}
                placeholder="Dr. John Doe"
                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-teal-500'} rounded-xl focus:ring-2 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all`} 
              />
              {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input 
                {...register("email")}
                type="email" 
                placeholder="john@example.com"
                className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-teal-500'} rounded-xl focus:ring-2 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all`} 
              />
              {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                {...register("password")}
                type="password" 
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-teal-500'} rounded-xl focus:ring-2 outline-none font-medium text-slate-700 placeholder-slate-400 transition-all`} 
              />
              {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Portal Role</label>
              <select 
                {...register("role")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-700 transition-all"
              >
                <option value="PATIENT">Patient Account</option>
                <option value="DOCTOR">Doctor Profile</option>
              </select>
            </div>
          </div>

          {selectedRole === "DOCTOR" && (
            <div className="bg-teal-50/40 border border-teal-100/60 p-4 rounded-2xl space-y-3 animate-fadeIn">
              <h3 className="text-sm font-bold text-teal-850">Physician Credentials Profile</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinical Specialization</label>
                <input 
                  {...register("specialization")}
                  placeholder="e.g. Cardiologist"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700 bg-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Experience (years)</label>
                  <input 
                    {...register("experienceYears")}
                    type="number" 
                    min="0" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700 bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Consultation Fee ($)</label>
                  <input 
                    {...register("consultationFee")}
                    type="number" 
                    min="0" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700 bg-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Professional Summary / Biography</label>
                <textarea 
                  {...register("bio")}
                  rows={2}
                  placeholder="Brief summary of practice focus..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-medium text-slate-700 bg-white" 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200"
          >
            {isSubmitting ? "Registering Practice..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pt-2">
          Already registered?{" "}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">Login to Portal</Link>
        </p>
      </div>
    </div>
  );
}
