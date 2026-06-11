import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "../services/api";

export function useSlots(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["slots", { page, limit }],
    queryFn: async () => {
      const { data } = await api.get("/slots", {
        params: { page, limit },
      });
      return data; // Returns { data: [...], meta: {...} }
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ startTime, endTime }) => {
      const { data } = await api.post("/slots", { startTime, endTime });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/slots/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
    },
  });
}
