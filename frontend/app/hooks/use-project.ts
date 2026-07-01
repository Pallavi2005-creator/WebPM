import type { CreateProjectFormData } from "@/components/project/create-project";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectData: CreateProjectFormData;
      workspaceId: string;
    }) =>
      postData(
        `/projects/${data.workspaceId}/create-project`,
        data.projectData
      ),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", data.workspace],
      });
    },
  });
};

export const UseProjectQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/tasks`),
  });
};

export const UseProjectRiskQuery = (projectId: string) => {
  return useQuery({
    queryKey: ["project-risk", projectId],
    queryFn: () => fetchData(`/projects/${projectId}/risk`),
    retry: false, // a 404 (no risk data yet) is expected, not worth retrying
  });
};

export const UseRecomputeProjectRisk = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) =>
      postData(`/projects/${projectId}/risk/recompute`, {}),
    onSuccess: (data: any, projectId: string) => {
      queryClient.invalidateQueries({ queryKey: ["project-risk", projectId] });
    },
  });
};