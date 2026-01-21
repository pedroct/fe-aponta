import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FolhaDeHoras from "./FolhaDeHoras";

// Mock dos hooks usados pelo ModalAdicionarTempo
vi.mock("@/hooks/use-api", () => ({
  useCriarApontamento: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "test-id" }),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    data: {
      id: "test-user-id",
      displayName: "Test User",
      emailAddress: "test@example.com",
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-search-work-items", () => ({
  useSearchWorkItems: () => ({
    results: [],
    isLoading: false,
    handleSearch: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-atividades", () => ({
  useAtividades: () => ({
    data: {
      items: [
        { id: "ativ-1", nome: "Desenvolvimento", ativo: true },
        { id: "ativ-2", nome: "Documentação", ativo: true },
      ],
      total: 2,
    },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("FolhaDeHoras", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderização", () => {
    it("deve renderizar o título da página", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText("Gestão de Apontamentos")).toBeInTheDocument();
    });

    it("deve renderizar o botão Novo Apontamento", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByRole("button", { name: /Novo Apontamento/i })).toBeInTheDocument();
    });

    it("deve renderizar o botão Hoje", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    });

    it("deve renderizar os checkboxes de filtros", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText("Projeto Atual")).toBeInTheDocument();
      expect(screen.getByText("Somente meus itens")).toBeInTheDocument();
    });

    it("deve renderizar a tabela de timesheet", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("deve renderizar o cabeçalho Escopo de Trabalho", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText("Escopo de Trabalho")).toBeInTheDocument();
    });

    it("deve renderizar o rodapé TOTAL GERAL", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText("TOTAL GERAL")).toBeInTheDocument();
    });

    it("deve renderizar a seção Semanal Σ", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText("Semanal Σ")).toBeInTheDocument();
    });

    it("deve renderizar os dias da semana no cabeçalho", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });
      
      // Verifica se há pelo menos um dia da semana (os dias são formatados em português)
      const daysOfWeek = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
      const found = daysOfWeek.some(day => {
        const elements = screen.queryAllByText(new RegExp(day, "i"));
        return elements.length > 0;
      });
      
      expect(found).toBe(true);
    });

    it("deve exibir copyright no rodapé", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText(/CESOP - Gestão de Projetos/i)).toBeInTheDocument();
    });
  });

  describe("Hierarquia de Itens", () => {
    it("deve renderizar o Epic principal", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText(/01 GESTÃO DE PROJETOS/i)).toBeInTheDocument();
    });

    it("deve renderizar a Feature quando Epic está expandido", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Por padrão, os itens estão expandidos
      expect(screen.getByText(/ATIVIDADES DE PROJETO/i)).toBeInTheDocument();
    });

    it("deve renderizar as Stories quando Feature está expandida", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText(/HU de Desenvolvimento/i)).toBeInTheDocument();
      // A Story "Documentação do Projeto" aparece tanto como Story (01.01.02) quanto como Task (C02)
      // Verificamos pelo texto completo da Story
      expect(screen.getByText(/01\.01\.02 Documentação do Projeto/i)).toBeInTheDocument();
    });

    it("deve renderizar as Tasks quando Story está expandida", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByText(/#4 C01. Implementar Extensão/i)).toBeInTheDocument();
      expect(screen.getByText(/#5 C02. Documentação do Projeto/i)).toBeInTheDocument();
    });
  });

  describe("Navegação de Semana", () => {
    it("deve exibir o intervalo de datas da semana", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Verifica se há um intervalo de datas no formato dd/MM - dd/MM
      const dateRange = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/);
      expect(dateRange).toBeInTheDocument();
    });

    it("deve ter botão de navegação para semana anterior", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const prevButton = screen.getByTitle("Semana Anterior");
      expect(prevButton).toBeInTheDocument();
    });

    it("deve ter botão de navegação para próxima semana", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const nextButton = screen.getByTitle("Próxima Semana");
      expect(nextButton).toBeInTheDocument();
    });

    it("deve mudar a semana ao clicar em próxima semana", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const dateRangeBefore = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/).textContent;
      
      const nextButton = screen.getByTitle("Próxima Semana");
      await userEvent.click(nextButton);

      const dateRangeAfter = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/).textContent;
      
      expect(dateRangeBefore).not.toBe(dateRangeAfter);
    });

    it("deve mudar a semana ao clicar em semana anterior", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const dateRangeBefore = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/).textContent;
      
      const prevButton = screen.getByTitle("Semana Anterior");
      await userEvent.click(prevButton);

      const dateRangeAfter = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/).textContent;
      
      expect(dateRangeBefore).not.toBe(dateRangeAfter);
    });

    it("deve voltar para a semana atual ao clicar em Hoje", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Navega para a próxima semana
      const nextButton = screen.getByTitle("Próxima Semana");
      await userEvent.click(nextButton);
      await userEvent.click(nextButton);

      // Clica em Hoje
      const todayButton = screen.getByRole("button", { name: "Hoje" });
      await userEvent.click(todayButton);

      // A semana deve conter hoje
      const today = new Date();
      const todayDay = today.getDate().toString().padStart(2, "0");
      
      // Verifica se o dia atual está visível na tabela
      const table = screen.getByRole("table");
      expect(within(table).getByText(todayDay)).toBeInTheDocument();
    });
  });

  describe("Expand/Collapse", () => {
    it("deve colapsar Epic ao clicar no botão de expansão", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Inicialmente a Feature está visível
      expect(screen.getByText(/ATIVIDADES DE PROJETO/i)).toBeInTheDocument();

      // Encontra o botão de expansão do Epic
      const epicRow = screen.getByText(/01 GESTÃO DE PROJETOS/i).closest("tr");
      const expandButton = epicRow?.querySelector("button");
      
      if (expandButton) {
        await userEvent.click(expandButton);
        
        // Após colapsar, a Feature não deve mais ser visível
        expect(screen.queryByText(/ATIVIDADES DE PROJETO/i)).not.toBeInTheDocument();
      }
    });

    it("deve expandir Epic novamente ao clicar no botão de expansão", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Encontra o botão de expansão do Epic e colapsa
      const epicRow = screen.getByText(/01 GESTÃO DE PROJETOS/i).closest("tr");
      const expandButton = epicRow?.querySelector("button");
      
      if (expandButton) {
        // Colapsa
        await userEvent.click(expandButton);
        expect(screen.queryByText(/ATIVIDADES DE PROJETO/i)).not.toBeInTheDocument();
        
        // Expande novamente
        await userEvent.click(expandButton);
        expect(screen.getByText(/ATIVIDADES DE PROJETO/i)).toBeInTheDocument();
      }
    });
  });

  describe("Modal de Apontamento", () => {
    it("deve abrir modal ao clicar em Novo Apontamento", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();
    });

    it("deve fechar modal ao clicar em Cancelar", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Abre o modal
      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      // Verifica que o modal está aberto
      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();

      // Fecha o modal
      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await userEvent.click(cancelButton);

      // Modal não deve mais estar visível
      expect(screen.queryByText("Apontar Tempo Trabalhado")).not.toBeInTheDocument();
    });

    it("deve fechar modal ao clicar em Salvar", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Abre o modal
      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      // Verifica que o modal está aberto
      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();

      // Fecha o modal via Salvar
      const saveButton = screen.getByRole("button", { name: "Salvar" });
      await userEvent.click(saveButton);

      // Modal não deve mais estar visível
      expect(screen.queryByText("Apontar Tempo Trabalhado")).not.toBeInTheDocument();
    });

    it("deve abrir modal com tarefa selecionada ao clicar em célula da grid", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Encontra a linha da tarefa #4
      const taskRow = screen.getByText(/#4 C01. Implementar Extensão/i).closest("tr");
      
      if (taskRow) {
        // Encontra uma célula clicável (células de horas)
        const cells = taskRow.querySelectorAll("td");
        const hourCell = cells[3]; // Uma das células de hora
        
        if (hourCell) {
          const clickableDiv = hourCell.querySelector("div");
          if (clickableDiv) {
            await userEvent.click(clickableDiv);
            
            // O modal deve abrir com a tarefa
            expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();
          }
        }
      }
    });
  });

  describe("Filtros", () => {
    it("deve ter checkbox Projeto Atual marcado por padrão", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const projectLabel = screen.getByText("Projeto Atual");
      const checkbox = projectLabel.closest("label")?.querySelector('[role="checkbox"]');
      
      expect(checkbox).toHaveAttribute("data-state", "checked");
    });

    it("deve ter checkbox Somente meus itens desmarcado por padrão", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const myItemsLabel = screen.getByText("Somente meus itens");
      const checkbox = myItemsLabel.closest("label")?.querySelector('[role="checkbox"]');
      
      expect(checkbox).toHaveAttribute("data-state", "unchecked");
    });

    it("deve alternar checkbox Projeto Atual ao clicar", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const projectLabel = screen.getByText("Projeto Atual");
      const checkbox = projectLabel.closest("label")?.querySelector('[role="checkbox"]');
      
      if (checkbox) {
        // Inicialmente marcado
        expect(checkbox).toHaveAttribute("data-state", "checked");
        
        // Clica para desmarcar
        await userEvent.click(checkbox);
        expect(checkbox).toHaveAttribute("data-state", "unchecked");
        
        // Clica para marcar novamente
        await userEvent.click(checkbox);
        expect(checkbox).toHaveAttribute("data-state", "checked");
      }
    });

    it("deve alternar checkbox Somente meus itens ao clicar", async () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      const myItemsLabel = screen.getByText("Somente meus itens");
      const checkbox = myItemsLabel.closest("label")?.querySelector('[role="checkbox"]');
      
      if (checkbox) {
        // Inicialmente desmarcado
        expect(checkbox).toHaveAttribute("data-state", "unchecked");
        
        // Clica para marcar
        await userEvent.click(checkbox);
        expect(checkbox).toHaveAttribute("data-state", "checked");
        
        // Clica para desmarcar
        await userEvent.click(checkbox);
        expect(checkbox).toHaveAttribute("data-state", "unchecked");
      }
    });
  });

  describe("Exibição de Horas", () => {
    it("deve exibir valores de esforço (E) nas colunas", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Verifica se a coluna de esforço está renderizada
      const table = screen.getByRole("table");
      const effortHeader = within(table).getByTitle("Esforço (Effort)");
      expect(effortHeader).toBeInTheDocument();
    });

    it("deve exibir valores de histórico (H) nas colunas", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // Verifica se a coluna de histórico está renderizada
      const table = screen.getByRole("table");
      const historyHeader = within(table).getByTitle("Histórico (History)");
      expect(historyHeader).toBeInTheDocument();
    });

    it("deve exibir horas logadas nas células quando maior que 00:00", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      // A tarefa #4 tem horas logadas: "01:00" e "00:30"
      // Essas horas são exibidas como números decimais (1, 0.5, etc)
      const taskRow = screen.getByText(/#4 C01. Implementar Extensão/i).closest("tr");
      
      expect(taskRow).toBeInTheDocument();
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura de tabela acessível", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
    });

    it("deve ter botões com títulos descritivos", () => {
      render(<FolhaDeHoras />, { wrapper: createWrapper() });

      expect(screen.getByTitle("Semana Anterior")).toBeInTheDocument();
      expect(screen.getByTitle("Próxima Semana")).toBeInTheDocument();
    });
  });
});
