import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("deve renderizar a página 404", () => {
    render(<NotFound />);

    expect(screen.getByText("404 Page Not Found")).toBeInTheDocument();
  });

  it("deve exibir mensagem sobre adicionar página ao router", () => {
    render(<NotFound />);

    expect(
      screen.getByText("Did you forget to add the page to the router?")
    ).toBeInTheDocument();
  });

  it("deve renderizar o ícone de alerta", () => {
    render(<NotFound />);

    // Verifica se há um SVG (ícone AlertCircle)
    const heading = screen.getByText("404 Page Not Found");
    const container = heading.closest("div");
    expect(container?.querySelector("svg")).toBeInTheDocument();
  });

  it("deve estar centralizado na tela", () => {
    render(<NotFound />);

    const heading = screen.getByText("404 Page Not Found");
    const outerContainer = heading.closest(".min-h-screen");
    expect(outerContainer).toHaveClass("flex", "items-center", "justify-center");
  });
});
