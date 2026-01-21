# Seguranca

## Estado atual
- Nao ha autenticacao ativa no codigo.
- Dependencias incluem `passport` e `express-session`, mas nao estao configuradas.

## Logging
- O middleware em `server/index.ts` registra o corpo da resposta de `/api`.
- Evitar enviar dados sensiveis ate que haja filtro ou redacao.

## Secrets
- Nenhum segredo versionado no repositorio.
- Variaveis de ambiente relevantes: `PORT`.

## Recomendações
- Definir estrategia de sessao e roles quando a API for implementada.
- Revisar logs antes de ativar dados reais.
