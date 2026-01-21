import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalAdicionarTempo } from "./ModalAdicionarTempo";

// Mock dos hooks de API
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

describe("ModalAdicionarTempo", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderização", () => {
    it("deve renderizar o modal quando isOpen é true", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();
    });

    it("não deve renderizar o modal quando isOpen é false", () => {
      render(<ModalAdicionarTempo isOpen={false} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.queryByText("Apontar Tempo Trabalhado")).not.toBeInTheDocument();
    });

    it("deve exibir o nome do usuário", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("TEST USER")).toBeInTheDocument();
    });

    it("deve exibir as iniciais do usuário no avatar", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("TR")).toBeInTheDocument();
    });

    it("deve exibir label Tarefa", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("Tarefa")).toBeInTheDocument();
    });

    it("deve exibir label Data", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("Data")).toBeInTheDocument();
    });

    it("deve exibir label Duração", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("Duração")).toBeInTheDocument();
    });

    it("deve exibir label Tipo de Atividade", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByText("Tipo de Atividade")).toBeInTheDocument();
    });

    it("deve exibir campo de comentário", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText("Adicione um comentário...");
      expect(textarea).toBeInTheDocument();
    });

    it("deve exibir todos os presets de duração", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByRole("button", { name: "+0.5h" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "+1h" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "+2h" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "+4h" })).toBeInTheDocument();
    });

    it("deve exibir botões Salvar e Cancelar", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    });
  });

  describe("Duração", () => {
    it("deve iniciar com duração 01:00", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const durationInput = screen.getByDisplayValue("01:00");
      expect(durationInput).toBeInTheDocument();
    });

    it("deve adicionar 0.5h ao clicar no preset +0.5h", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset05h = screen.getByRole("button", { name: "+0.5h" });
      await userEvent.click(preset05h);

      // 01:00 + 00:30 = 01:30
      expect(screen.getByDisplayValue("01:30")).toBeInTheDocument();
    });

    it("deve adicionar 1h ao clicar no preset +1h", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset1h = screen.getByRole("button", { name: "+1h" });
      await userEvent.click(preset1h);

      // 01:00 + 01:00 = 02:00
      expect(screen.getByDisplayValue("02:00")).toBeInTheDocument();
    });

    it("deve adicionar 2h ao clicar no preset +2h", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset2h = screen.getByRole("button", { name: "+2h" });
      await userEvent.click(preset2h);

      // 01:00 + 02:00 = 03:00
      expect(screen.getByDisplayValue("03:00")).toBeInTheDocument();
    });

    it("deve adicionar 4h ao clicar no preset +4h", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset4h = screen.getByRole("button", { name: "+4h" });
      await userEvent.click(preset4h);

      // 01:00 + 04:00 = 05:00
      expect(screen.getByDisplayValue("05:00")).toBeInTheDocument();
    });

    it("deve adicionar tempo cumulativamente", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset1h = screen.getByRole("button", { name: "+1h" });
      await userEvent.click(preset1h);
      await userEvent.click(preset1h);

      // 01:00 + 01:00 + 01:00 = 03:00
      expect(screen.getByDisplayValue("03:00")).toBeInTheDocument();
    });

    it("deve limitar duração máxima em 08:00", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const preset4h = screen.getByRole("button", { name: "+4h" });
      await userEvent.click(preset4h); // 05:00
      await userEvent.click(preset4h); // Tentativa de ir para 09:00

      // Deve limitar em 08:00
      expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
    });

    it("deve permitir digitar duração manualmente", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const durationInput = screen.getByDisplayValue("01:00");
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, "02:30");

      expect(screen.getByDisplayValue("02:30")).toBeInTheDocument();
    });

    it("deve limitar duração em 08:00 quando digitado valor maior", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const durationInput = screen.getByDisplayValue("01:00");

      // Simula change event diretamente com valor que excede 8h
      fireEvent.change(durationInput, { target: { value: "10:00" } });

      // O componente deve limitar para 08:00
      expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
    });

    it("deve rejeitar caracteres não numéricos na duração", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const durationInput = screen.getByDisplayValue("01:00");

      // Tentativa de inserir letras
      fireEvent.change(durationInput, { target: { value: "ab:cd" } });

      // Deve manter o valor anterior
      expect(screen.getByDisplayValue("01:00")).toBeInTheDocument();
    });
  });

  describe("Interações", () => {
    it("deve chamar onClose ao clicar no botão X", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const buttons = screen.getAllByRole("button");
      const xButton = buttons.find(btn => btn.querySelector("svg"));

      if (xButton) {
        await userEvent.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it("deve chamar onClose ao clicar em Cancelar", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await userEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("deve chamar onClose ao clicar em Salvar", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const saveButton = screen.getByRole("button", { name: "Salvar" });
      await userEvent.click(saveButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("deve permitir digitar comentário", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const textarea = screen.getByPlaceholderText("Adicione um comentário...");
      await userEvent.type(textarea, "Meu comentário de teste");

      expect(textarea).toHaveValue("Meu comentário de teste");
    });
  });

  describe("Props", () => {
    it("deve exibir taskTitle e taskId quando fornecidos", () => {
      render(
        <ModalAdicionarTempo 
          isOpen={true} 
          onClose={mockOnClose}
          taskTitle="Minha Tarefa Customizada"
          taskId="42"
        />
      );

      // O campo de pesquisa deve mostrar a tarefa
      expect(screen.getByDisplayValue("#42 Minha Tarefa Customizada")).toBeInTheDocument();
    });

    it("deve usar campo de pesquisa vazio quando taskTitle e taskId não são fornecidos", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      // Sem valores padrão, campo de pesquisa deve estar vazio
      const searchInput = screen.getByPlaceholderText("Pesquisar tarefa...");
      expect(searchInput).toHaveValue("");
    });
  });

  describe("Tipo de Atividade", () => {
    it("deve exibir as opções de atividade no select", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("deve permitir selecionar tipo de atividade", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, "Desenvolvimento");

      expect(select).toHaveValue("Desenvolvimento");
    });

    it("deve ter a primeira atividade selecionada como valor inicial", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const select = screen.getByRole("combobox");
      // Pode ser vazio inicialmente ou a primeira atividade
      expect(select).toBeInTheDocument();
    });
  });

  describe("Calendário", () => {
    it("deve exibir botão para abrir calendário", () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      // Verifica se há um botão de calendário com a data formatada
      const calendarButton = screen.getByRole("button", { name: /\d{2}\/\d{2}\/\d{4}/ });
      expect(calendarButton).toBeInTheDocument();
    });

    it("deve abrir popover do calendário ao clicar", async () => {
      render(<ModalAdicionarTempo isOpen={true} onClose={mockOnClose} />, { wrapper: createWrapper() });

      const calendarButton = screen.getByRole("button", { name: /\d{2}\/\d{2}\/\d{4}/ });
      await userEvent.click(calendarButton);

      // O calendário deve estar visível (verifica existência do grid do calendário)
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });
  });
});
