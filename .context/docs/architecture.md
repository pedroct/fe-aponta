# Arquitetura

## Visao geral
O projeto e um monorepo simples com client React e server Express. Em dev, o Express cria um server HTTP e injeta o Vite em modo middleware para servir o app. Em producao, o Express serve arquivos estaticos gerados.

## Camadas
- **Client**: `client/src` com React, rotas via Wouter, estado local e React Query.
- **Server**: `server` com Express, middleware de log e placeholder de rotas.
- **Shared**: `shared/schema.ts` com schema Drizzle e tipos compartilhados.

## Componentes chave
- `client/src/App.tsx`: rotas e providers
- `client/src/pages/Apontamentos.tsx`: tela principal
- `client/src/lib/queryClient.ts`: wrapper de fetch e React Query
- `server/index.ts`: boot do servidor e log de requests
- `server/vite.ts`: Vite middleware (dev)
- `server/static.ts`: servico estatico (prod)

## Decisoes e padroes
- Vite integrado ao Express para unificar API e client na mesma porta.
- Alias de import: `@` para `client/src` e `@shared` para `shared`.
- Storage em memoria como stub inicial (`server/storage.ts`).

## Riscos e trade-offs
- Sem persistencia real ainda (storage em memoria).
- Rotas de API nao implementadas, mas estrutura ja pronta.
- Middleware de log captura payload de resposta em `/api` (cuidado com dados sensiveis).
