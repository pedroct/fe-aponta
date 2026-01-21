import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Apontamento,
  ApontamentoCreate,
  ApontamentoUpdate,
} from "@/lib/api-client";
import { useAzureContext } from "@/contexts/AzureDevOpsContext";

async function getErrorMessage(res: Response, fallback: string) {
  const errorData = await res.json().catch(() => ({}));
  return errorData.erro || errorData.detail || fallback;
}

// ============================================================================
// APONTAMENTOS
// ============================================================================

export function useCriarApontamento() {
  const queryClient = useQueryClient();
  const { api } = useAzureContext();

  return useMutation({
    mutationFn: async (data: ApontamentoCreate) => {
      return api.post<Apontamento>("/apontamentos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apontamentos"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useObterApontamento(id: string) {
  const { api } = useAzureContext();
  
  return useQuery({
    queryKey: ["apontamentos", id],
    queryFn: async () => {
      return api.get<Apontamento>(`/apontamentos/${id}`);
    },
    enabled: !!id,
  });
}

export function useAtualizarApontamento(id: string) {
  const queryClient = useQueryClient();
  const { api } = useAzureContext();

  return useMutation({
    mutationFn: async (data: ApontamentoUpdate) => {
      return api.put<Apontamento>(`/apontamentos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apontamentos"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useDeletarApontamento(id: string) {
  const queryClient = useQueryClient();
  const { api } = useAzureContext();

  return useMutation({
    mutationFn: async () => {
      return api.delete(`/apontamentos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apontamentos"] });
      queryClient.invalidateQueries({ queryKey: ["timesheet"] });
    },
  });
}

export function useListarApontamentosPorWorkItem(
  workItemId: number,
  organizationName: string,
  projectId: string,
  params?: { skip?: number; limit?: number }
) {
  const { api } = useAzureContext();

  return useQuery({
    queryKey: ["apontamentos", "work-item", workItemId, organizationName, projectId, params],
    queryFn: async () => {
      return api.get(`/apontamentos/work-item/${workItemId}`, {
        organization_name: organizationName,
        project_id: projectId,
        skip: params?.skip,
        limit: params?.limit,
      });
    },
    enabled: !!workItemId && !!organizationName && !!projectId,
  });
}

export function useResumoApontamentos(
  workItemId: number,
  organizationName: string,
  projectId: string
) {
  const { api } = useAzureContext();

  return useQuery({
    queryKey: ["apontamentos", "resumo", workItemId, organizationName, projectId],
    queryFn: async () => {
      return api.get(`/apontamentos/work-item/${workItemId}/resumo`, {
        organization_name: organizationName,
        project_id: projectId,
      });
    },
    enabled: !!workItemId && !!organizationName && !!projectId,
  });
}

export function useAzureInfo(
  workItemId: number,
  organizationName: string,
  projectId: string
) {
  const { api } = useAzureContext();

  return useQuery({
    queryKey: ["apontamentos", "azure-info", workItemId, organizationName, projectId],
    queryFn: async () => {
      return api.get(`/apontamentos/work-item/${workItemId}/azure-info`, {
        organization_name: organizationName,
        project_id: projectId,
      });
    },
    enabled: !!workItemId && !!organizationName && !!projectId,
  });
}
