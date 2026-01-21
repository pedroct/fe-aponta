# Fluxo de dados

## Visao geral
1. UI React renderiza a tela e controla estado local.
2. Chamadas HTTP usam `apiRequest` ou React Query.
3. Express recebe em `/api`, registra log, e delega ao storage.
4. Respostas retornam JSON e sao consumidas no client.

## Client
- Estado local via `useState` (ex: tela de apontamentos).
- Estado remoto via React Query (config padrao em `queryClient`).
- Requests usam `fetch` com `credentials: include`.

## Server
- `server/index.ts` define middleware JSON, log e error handler.
- `server/routes.ts` esta vazio, mas padrao e prefixo `/api`.
- `server/storage.ts` usa memoria (Map) como stub de persistencia.

## Persistencia
- Schema Drizzle em `shared/schema.ts` descreve tabela `users`.
- Ainda nao ha integracao com banco em runtime.

## Integracoes externas
- Nenhuma integracao externa ativa no momento.

## Observabilidade
- Logs em `/api` incluem metodo, path, status e body da resposta.
