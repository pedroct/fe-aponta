# Workflow de desenvolvimento

## Setup local
- `npm install`
- `npm run dev` inicia Express + Vite middleware
- `npm run dev:client` inicia apenas Vite

## Build e start
- `npm run build` gera build
- `npm run start` inicia servidor em modo producao

## Checagem de tipos
- `npm run check` (tsc)

## Contribuicao
- Adotar commits pequenos e revisao focada
- Adicionar testes em `client/src/*.test.tsx` quando houver logica

## Porta
- Padrao 5000 (override via `PORT`)
