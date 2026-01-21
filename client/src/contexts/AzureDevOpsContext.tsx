/**
 * Context Provider para integração com Azure DevOps
 * 
 * Fornece:
 * - Cliente API configurado com autenticação
 * - Contexto da organização/projeto
 * - Estado de loading
 * - Detecção de ambiente (iframe vs standalone)
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAzureDevOps } from '@/hooks/use-azure-devops';
import { ApiClient } from '@/lib/api';

export interface AzureDevOpsContextType {
  /** Se está rodando dentro do iframe do Azure DevOps */
  isInAzureDevOps: boolean;
  /** Se está carregando/inicializando o SDK */
  isLoading: boolean;
  /** Nome da organização Azure DevOps */
  organization: string;
  /** Nome do projeto Azure DevOps */
  project: string;
  /** ID do projeto Azure DevOps */
  projectId: string;
  /** Cliente API configurado com autenticação */
  api: ApiClient;
  /** Token atual (para casos especiais) */
  token: string | null;
  /** Função para obter token (para hooks que precisam) */
  getToken: () => Promise<string>;
  /** Função para renovar token */
  refreshToken: () => Promise<string>;
  /** Erro de inicialização, se houver */
  error: Error | null;
}

const AzureDevOpsContext = createContext<AzureDevOpsContextType | null>(null);

interface AzureDevOpsProviderProps {
  children: ReactNode;
}

export function AzureDevOpsProvider({ children }: AzureDevOpsProviderProps) {
  const {
    isInAzureDevOps,
    isLoading,
    context,
    token,
    refreshToken,
    error,
  } = useAzureDevOps();

  // Criar função getToken que retorna o token atual
  const getToken = useMemo(() => {
    return async () => token || '';
  }, [token]);

  // Criar instância única do ApiClient
  // Usando useMemo para evitar re-criação a cada render
  const api = useMemo(() => {
    return new ApiClient(getToken, refreshToken);
  }, [getToken, refreshToken]);

  // Valores do contexto
  const contextValue = useMemo<AzureDevOpsContextType>(() => ({
    isInAzureDevOps,
    isLoading,
    organization: context?.organization || import.meta.env.VITE_AZURE_ORG || 'sefaz-ceara-lab',
    project: context?.project || import.meta.env.VITE_AZURE_PROJECT || 'DEV',
    projectId: context?.projectId || '',
    api,
    token,
    getToken,
    refreshToken,
    error,
  }), [isInAzureDevOps, isLoading, context, api, token, getToken, refreshToken, error]);

  return (
    <AzureDevOpsContext.Provider value={contextValue}>
      {children}
    </AzureDevOpsContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do Azure DevOps
 * 
 * @throws Error se usado fora do AzureDevOpsProvider
 */
export function useAzureContext(): AzureDevOpsContextType {
  const context = useContext(AzureDevOpsContext);
  
  if (!context) {
    throw new Error(
      'useAzureContext must be used within an AzureDevOpsProvider. ' +
      'Wrap your app with <AzureDevOpsProvider> in App.tsx'
    );
  }
  
  return context;
}

/**
 * Hook opcional que retorna null se fora do provider
 * Útil para componentes que podem existir dentro ou fora do contexto
 */
export function useAzureContextOptional(): AzureDevOpsContextType | null {
  return useContext(AzureDevOpsContext);
}

export default AzureDevOpsProvider;
