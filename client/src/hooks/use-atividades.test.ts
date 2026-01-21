import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAtividades } from "./use-atividades";
import React from "react";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useAtividades", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar lista de atividades com sucesso", async () => {
    const mockData = {
      items: [
        { id: "1", nome: "Desenvolvimento", ativo: true },
        { id: "2", nome: "Teste", ativo: true },
      ],
      total: 2,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useAtividades(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("deve filtrar por ativo=true", async () => {
    const mockData = {
      items: [{ id: "1", nome: "Desenvolvimento", ativo: true }],
      total: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useAtividades({ ativo: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("ativo=true"),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it("deve filtrar por id_projeto", async () => {
    const mockData = {
      items: [],
      total: 0,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(
      () => useAtividades({ id_projeto: "projeto-123" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("id_projeto=projeto-123"),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
  });

  it("deve lidar com erro na requisição", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useAtividades(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it("deve ter staleTime de 5 minutos", async () => {
    const mockData = { items: [], total: 0 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useAtividades(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifica que os dados estão em cache
    expect(result.current.isStale).toBe(false);
  });
});
