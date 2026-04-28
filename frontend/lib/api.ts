import {
  AuthPayload,
  ConversationRecord,
  TaskRecord,
  User,
} from "@/lib/types";

function normalizeApiBaseUrl(rawBaseUrl?: string) {
  const fallback = "http://localhost:8000/api";
  const baseUrl = (rawBaseUrl ?? fallback).trim() || fallback;
  const withoutTrailingSlash = baseUrl.replace(/\/+$/, "");

  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_BASE = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const fallback = "Something went wrong. Please try again.";

    try {
      const errorBody = (await response.json()) as {
        detail?: string | { msg?: string }[] | Record<string, unknown>;
      };

      if (typeof errorBody.detail === "string") {
        throw new Error(errorBody.detail);
      }

      if (Array.isArray(errorBody.detail)) {
        const firstMessage = errorBody.detail[0]?.msg;
        throw new Error(firstMessage ?? fallback);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }

    throw new Error(fallback);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  register(payload: AuthPayload) {
    return request<{ message: string }>("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
  login(payload: AuthPayload) {
    return request<{ message: string }>("/auth/login", {
      method: "POST",
      body: payload,
    });
  },
  logout() {
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  },
  currentUser() {
    return request<User>("/users/current/me");
  },
  listConversations() {
    return request<ConversationRecord[]>("/conversations");
  },
  getConversation(conversationId: string) {
    return request<ConversationRecord>(`/conversations/${conversationId}`);
  },
  updateConversation(
    conversationId: string,
    payload: { title?: string; is_pinned?: boolean; is_favorite?: boolean }
  ) {
    return request<ConversationRecord>(`/conversations/${conversationId}`, {
      method: "PATCH",
      body: payload,
    });
  },
  deleteConversation(conversationId: string) {
    return request<{ message: string }>(`/conversations/${conversationId}`, {
      method: "DELETE",
    });
  },
  sendConversation(payload: { content: string; conversation_id?: string }) {
    return request<ConversationRecord>("/conversations/send", {
      method: "POST",
      body: payload,
    });
  },
  updateTask(taskId: string, payload: { status?: string }) {
    return request<TaskRecord>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: payload,
    });
  },
  deleteTask(taskId: string) {
    return request<{ message: string }>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};
