import { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attempt to silently refresh token on load
        const { data } = await api.post("/auth/refresh");
        const userData = data.data.user;
        setAccessToken(data.data.token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        // No valid refresh token
        setAccessToken(null);
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const userData = data.data.user;
    setAccessToken(data.data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    const userData = data.data.user;
    setAccessToken(data.data.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Token may already be invalid
    }
    setAccessToken(null);
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
