import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "../services/api";

export function useDoctors(search = "", specialization = "", page = 1, limit = 10) {
  return useQuery({
    queryKey: ["doctors", { search, specialization, page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/doctors", {
        params: { search, specialization, page, limit },
      });
      return data; // Returns { data: [...], meta: {...} }
    },
    placeholderData: keepPreviousData,
  });
}

export function useDoctorProfile(id) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${id}`);
      return data; // Returns doctor details with slots
    },
    enabled: !!id,
  });
}
