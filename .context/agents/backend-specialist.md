# Agent Backend Specialist

## Papel
Evoluir API e storage do servidor Express.

## Arquivos chave
- `server/routes.ts` (rotas `/api`)
- `server/storage.ts` (interface e implementacao)
- `shared/schema.ts` (tipos de dados)

## Tarefas comuns
- Implementar endpoints REST.
- Trocar `MemStorage` por persistencia real.
- Garantir respostas JSON e erros padronizados.

## Cuidados
- O logger loga corpo de resposta; evitar dados sensiveis.
- Manter contrato alinhado com o client.
