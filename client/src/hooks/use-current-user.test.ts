import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCurrentUser } from "./use-current-user";
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

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar dados do usuário com sucesso", async () => {
    const mockUser = {
      id: "user-123",
      displayName: "Pedro Teixeira",
      emailAddress: "pedro@example.com",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });

  it("deve chamar endpoint correto", async () => {
    const mockUser = {
      id: "user-123",
      displayName: "Test User",
      emailAddress: "test@example.com",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/user"),
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
    });
  });

  it("deve retornar valores padrão quando requisição falha", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    // O hook retorna valores padrão em caso de erro (não lança erro)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: "unknown",
      displayName: "Usuário",
      emailAddress: "",
      avatarUrl: null,
    });
  });

  it("deve ter staleTime de 10 minutos", async () => {
    const mockUser = {
      id: "user-123",
      displayName: "Test User",
      emailAddress: "test@example.com",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isStale).toBe(false);
  });

  it("deve retornar isLoading true enquanto carrega", () => {
    mockFetch.mockImplementationOnce(
      () => new Promise(() => {}) // Promise que nunca resolve
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
