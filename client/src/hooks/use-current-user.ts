import { useQuery } from "@tanstack/react-query";
import { useAzureContext } from "@/contexts/AzureDevOpsContext";

export interface CurrentUser {
  id: string;
  displayName: string;
  emailAddress: string | null;
  avatarUrl?: string | null;
}

/**
 * Hook para obter o usuário autenticado no Azure DevOps
 */
export function useCurrentUser() {
  const { api } = useAzureContext();

  return useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      try {
        return await api.get<CurrentUser>("/user");
      } catch {
        // Retornar valores padrão em caso de erro
        return {
          id: "unknown",
          displayName: "Usuário",
          emailAddress: "",
          avatarUrl: null,
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
    retry: 1,
  });
}
