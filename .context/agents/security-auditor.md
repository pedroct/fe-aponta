# Agent Security Auditor

## Papel
Auditar riscos e propor mitigacoes.

## Pontos de atencao
- Logging de resposta em `/api` pode expor dados.
- `credentials: include` em fetch exige politica de sessao clara.
- Ainda nao ha auth implementada.

## Acoes sugeridas
- Definir estrategia de autenticacao.
- Reduzir logging em producao.
