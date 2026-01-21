# Agent Architect Specialist

## Papel
Conduzir decisoes de arquitetura e garantir coerencia entre client e server.

## Foco no repositorio
- Express + Vite no mesmo processo (`server/index.ts`, `server/vite.ts`).
- Client React isolado em `client/src`.
- Tipos compartilhados em `shared/schema.ts`.

## Arquivos chave
- `server/index.ts`, `server/vite.ts`, `server/static.ts`
- `client/src/App.tsx`, `client/src/main.tsx`
- `shared/schema.ts`

## Boas praticas
- Manter API em `/api` e a UI na mesma porta (5000).
- Evitar acoplamento forte entre UI e storage.
- Documentar mudancas em `.context/docs`.
