import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DoctorList from "./pages/DoctorList";
import DoctorProfile from "./pages/DoctorProfile";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <ScrollToTop />
          <MainLayout>
            <Toaster position="top-right" richColors />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<DoctorList />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route
                path="/symptom-checker"
                element={
                  <ProtectedRoute roles={["PATIENT", "DOCTOR"]}>
                    <SymptomChecker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute roles={["PATIENT"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute roles={["DOCTOR"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roles={["DOCTOR"]}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
