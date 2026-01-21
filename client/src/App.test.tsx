import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  describe("Renderização Principal", () => {
    it("renderiza a página FolhaDeHoras como rota principal", () => {
      render(<App />);

      expect(screen.getByText("Gestão de Apontamentos")).toBeInTheDocument();
    });

    it("renderiza o botão Novo Apontamento", () => {
      render(<App />);

      expect(screen.getByRole("button", { name: /Novo Apontamento/i })).toBeInTheDocument();
    });

    it("renderiza o botão Hoje", () => {
      render(<App />);

      expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    });

    it("renderiza a tabela de timesheet", () => {
      render(<App />);

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("renderiza os filtros de projeto", () => {
      render(<App />);

      expect(screen.getByText("Projeto Atual")).toBeInTheDocument();
      expect(screen.getByText("Somente meus itens")).toBeInTheDocument();
    });
  });

  describe("Modal de Apontamento", () => {
    it("abre o modal ao clicar em Novo Apontamento", async () => {
      render(<App />);

      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();
    });

    it("modal tem botão Salvar", async () => {
      render(<App />);

      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    });

    it("modal tem botão Cancelar", async () => {
      render(<App />);

      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    });

    it("fecha o modal ao clicar em Cancelar", async () => {
      render(<App />);

      // Abre o modal
      const newButton = screen.getByRole("button", { name: /Novo Apontamento/i });
      await userEvent.click(newButton);

      // Verifica que abriu
      expect(screen.getByText("Apontar Tempo Trabalhado")).toBeInTheDocument();

      // Fecha
      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await userEvent.click(cancelButton);

      // Verifica que fechou
      expect(screen.queryByText("Apontar Tempo Trabalhado")).not.toBeInTheDocument();
    });
  });

  describe("Navegação", () => {
    it("tem botões de navegação de semana", () => {
      render(<App />);

      expect(screen.getByTitle("Semana Anterior")).toBeInTheDocument();
      expect(screen.getByTitle("Próxima Semana")).toBeInTheDocument();
    });

    it("exibe intervalo de datas da semana", () => {
      render(<App />);

      // Verifica se há um intervalo de datas no formato dd/MM - dd/MM
      const dateRange = screen.getByText(/\d{2}\/\d{2} - \d{2}\/\d{2}/);
      expect(dateRange).toBeInTheDocument();
    });
  });

  describe("Hierarquia de Trabalho", () => {
    it("exibe Epic principal", () => {
      render(<App />);

      expect(screen.getByText(/01 GESTÃO DE PROJETOS/i)).toBeInTheDocument();
    });

    it("exibe Feature quando Epic está expandido", () => {
      render(<App />);

      expect(screen.getByText(/ATIVIDADES DE PROJETO/i)).toBeInTheDocument();
    });

    it("exibe Tasks quando Stories estão expandidas", () => {
      render(<App />);

      expect(screen.getByText(/#4 C01. Implementar Extensão/i)).toBeInTheDocument();
      expect(screen.getByText(/#5 C02. Documentação do Projeto/i)).toBeInTheDocument();
    });
  });
});
