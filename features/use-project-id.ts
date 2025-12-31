import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useGetProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await axios.get(`/api/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useGenerateDesignById = (projectId: string) => {
  return useMutation({
    mutationFn: async (prompt: string) =>
      await axios
        .post(`/api/project/${projectId}`, {
          prompt,
        })
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Generation Started");
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to generate screen");
    },
  });
};

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { themeId?: string; name?: string }) =>
      await axios
        .patch(`/api/project/${projectId}`, payload)
        .then((res) => res.data),
    onSuccess: () => {
      toast.success("Project updated");
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => {
      console.log("Project failed", error);
      toast.error("Failed to update project");
    },
  });
};

export const useDeleteProject = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/project/${projectId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.log("Project delete failed", error);
      toast.error("Failed to delete project");
    },
  });
};
