# Visao geral do projeto

## Proposito
Frontend do aplicativo de apontamento de horas no Azure DevOps. O repositorio inclui um servidor Express que serve o app React no modo desenvolvimento (Vite middleware) e no modo producao (assets estaticos).

## Principais capacidades
- Tela principal de apontamentos com UI estilo Azure DevOps
- Componentes reutilizaveis de UI em `client/src/components/ui`
- Query client padrao com React Query para chamadas HTTP
- Estrutura basica de storage e schema compartilhado

## Stack
- React + Vite (client)
- Express (server)
- TypeScript
- React Query
- Tailwind CSS
- Drizzle (schema compartilhado)

## Entrada da aplicacao
- `client/src/main.tsx` monta `App`
- `client/src/App.tsx` define rotas via Wouter

## Como iniciar
- `npm install`
- `npm run dev` (servidor Express + Vite middleware)
- Alternativo: `npm run dev:client` (somente client em 5000)

## Observacoes
- Porta padrao: 5000 (variavel `PORT` tem prioridade)
- API segue prefixo `/api` (rotas ainda vazias)
