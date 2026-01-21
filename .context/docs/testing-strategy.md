# Estrategia de testes

## Framework
- Vitest + React Testing Library
- Ambiente `jsdom`

## Onde ficam os testes
- `client/src/*.test.tsx`

## Scripts
- `npm run test`
- `npm run test:watch`
- `npm run test:ui`

## Boas praticas
- Prefira testes de renderizacao e comportamento da UI
- Mock de chamadas HTTP usando `fetch` quando necessario

## Qualidade
- Tipagem via `npm run check`
- Ainda sem metas de cobertura definidas
