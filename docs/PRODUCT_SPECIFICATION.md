# Especificação do Produto — Apontamentos

## 1. Propósito
O **Apontamentos** é uma aplicação web de registro de horas e acompanhamento de trabalho integrada ao Azure DevOps. O objetivo é centralizar o lançamento de tempo, sincronizar automaticamente com Work Items e oferecer visibilidade do progresso por equipe, projeto e tarefa.

## 2. Público-alvo
- Desenvolvedores e analistas que registram horas por tarefa.
- Líderes/gestores que precisam acompanhar esforço e progresso.
- Times que usam Azure DevOps para planejar e acompanhar entregas.

## 3. Principais funcionalidades

### 3.1 Registro de horas (Apontamento)
- Formulário para selecionar tarefa, data, duração, tipo de atividade e comentário.
- Atalhos de duração (ex.: 0,5h, 1h, 2h, 4h).
- Validação de dados (horas válidas, data não futura, tarefa obrigatória).

### 3.2 Grade semanal de horas
- Visão tipo planilha com dias da semana.
- Totais diários e semanal.
- Identificação visual de sobrecarga (ex.: > 8h/dia).

### 3.3 Hierarquia de Work Items
- Estrutura em árvore (Épico → Feature → User Story → Task/Bug).
- Totais agregados por nível.
- Expansão/colapso dos nós.

### 3.4 Busca de tarefas
- Autocomplete por ID ou título.
- Resultados paginados e cacheados.
- Debounce para reduzir chamadas.

### 3.5 Integração com Azure DevOps
- Atualiza automaticamente `CompletedWork` e `RemainingWork`.
- Sincroniza status após cada apontamento.
- Mantém dados locais mesmo se a API estiver indisponível.

## 4. Fluxos principais

### 4.1 Lançar horas
1. Usuário abre a aplicação.
2. Clica em “Novo apontamento”.
3. Seleciona tarefa, data, duração e tipo de atividade.
4. Salva.
5. Sistema grava localmente e sincroniza com Azure DevOps.

### 4.2 Revisar semana
1. Usuário visualiza a grade semanal.
2. Analisa totais diários e semanais.
3. Expande itens para ver detalhes.

## 5. Regras de negócio
- Não permitir horas negativas.
- Permiter apontamento de no mínomo 00:15 até 08:00 de duração por dia
- Total diário não pode exceder 08:00.
- `RemainingWork` não pode ficar negativo.
- Somente tarefas (Task/Bug) são atualizadas diretamente no Azure DevOps.

## 6. Requisitos não funcionais
- **Desempenho:** carregamento rápido e cache inteligente.
- **Confiabilidade:** salvar localmente se a sincronização falhar.
- **Segurança:** autenticação via Azure DevOps (PAT ou similar).
- **Usabilidade:** interface responsiva, com foco em rapidez no lançamento.

## 7. Como funciona (visão geral)
1. O front-end busca Work Items e apontamentos via API.
2. O usuário registra horas no modal.
3. O back-end grava o apontamento e atualiza o Azure DevOps.
4. A grade semanal reflete o novo total imediatamente.

## 8. Métricas de sucesso
- Tempo médio para registrar um apontamento < 30s.
- Taxa de sincronização bem-sucedida > 99%.
- Aumento da visibilidade de esforço por sprint/projeto.
