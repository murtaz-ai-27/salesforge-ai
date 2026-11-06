/**
 * lib/api.ts — Centralized API client
 *
 * Single fetch wrapper used by ALL data hooks.
 * Guarantees:
 *   - Consistent JSON Content-Type header
 *   - Throws ApiError on HTTP errors AND on { error } response bodies
 *   - Full TypeScript generic inference on return type
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON — fall back to empty object if body is empty (e.g. 204)
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // no-op — 204 No Content etc.
  }

  if (!res.ok || data.error) {
    throw new ApiError(
      (data.error as string) ?? `HTTP ${res.status}`,
      res.status,
      data.code as string | undefined
    );
  }

  return data as T;
}

export const api = {
  get<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return request<T>(path, { method: "GET", ...options });
  },

  post<T>(path: string, body: unknown, options?: RequestOptions) {
    return request<T>(path, { method: "POST", body, ...options });
  },

  patch<T>(path: string, body: unknown, options?: RequestOptions) {
    return request<T>(path, { method: "PATCH", body, ...options });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "body">) {
    return request<T>(path, { method: "DELETE", ...options });
  },
};
