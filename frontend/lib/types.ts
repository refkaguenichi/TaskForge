export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export type TaskRecord = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  estimated_minutes?: number | null;
  roadmap_id?: string | null;
  created_at: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type ConversationRecord = {
  id: string;
  title: string;
  is_pinned: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  messages: ConversationMessage[];
  tasks: TaskRecord[];
};
