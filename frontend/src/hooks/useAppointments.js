import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "../services/api";

export function useAppointments(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["appointments", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/appointments", {
        params: { page, limit },
      });
      return data; // Returns { data: [...], meta: {...} }
    },
    placeholderData: keepPreviousData,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slotId) => {
      const { data } = await api.post("/appointments", { slotId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/appointments/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["dailySchedule"] });
    },
  });
}

export function useDailySchedule(date) {
  return useQuery({
    queryKey: ["dailySchedule", date],
    queryFn: async () => {
      const { data } = await api.get("/appointments/schedule/daily", {
        params: { date },
      });
      return data; // Returns slot array
    },
    enabled: !!date,
  });
}
