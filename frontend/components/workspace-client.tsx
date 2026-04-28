"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  MoreHorizontal,
  Pin,
  Plus,
  Send,
  Sparkles,
  Star,
  Trash2,
  User2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConversationRecord, TaskRecord, User } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Create a 30-day launch plan for my portfolio",
  "Help me organize my final-year project",
  "Break my product roadmap into weekly tasks",
];

function sortConversations(conversations: ConversationRecord[]) {
  return [...conversations].sort((first, second) => {
    if (first.is_pinned !== second.is_pinned) {
      return Number(second.is_pinned) - Number(first.is_pinned);
    }

    if (first.is_favorite !== second.is_favorite) {
      return Number(second.is_favorite) - Number(first.is_favorite);
    }

    return second.updated_at.localeCompare(first.updated_at);
  });
}

function formatRelativeDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function sentenceTitle(input: string) {
  return input.trim().slice(0, 52) || "New conversation";
}

function getInitials(email?: string) {
  if (!email) {
    return "U";
  }

  return email.slice(0, 2).toUpperCase();
}

function getPriorityTone(priority?: string | null) {
  switch ((priority ?? "").toLowerCase()) {
    case "high":
      return "bg-[#ffe1d7] text-[#a33a19]";
    case "low":
      return "bg-[#e9f7ef] text-[#166c4e]";
    default:
      return "bg-[#efe7da] text-[#5e554b]";
  }
}

function getStatusTone(status?: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "done":
    case "completed":
      return "bg-[#e6f3ee] text-[#166c4e]";
    case "in_progress":
    case "in progress":
      return "bg-[#fff0d6] text-[#996300]";
    default:
      return "bg-[#f1eadf] text-[#5f584e]";
  }
}

export function WorkspaceClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDraftingNew, setIsDraftingNew] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [conversationMenuId, setConversationMenuId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const [currentUser, fetchedConversations] = await Promise.all([
          api.currentUser(),
          api.listConversations(),
        ]);

        if (cancelled) {
          return;
        }

        const sortedConversations = sortConversations(fetchedConversations);
        setUser(currentUser);
        setConversations(sortedConversations);
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoadingWorkspace(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const activeConversation = useMemo(() => {
    if (isDraftingNew) {
      return null;
    }

    if (!conversations.length) {
      return null;
    }

    return (
      conversations.find((conversation) => conversation.id === activeConversationId) ??
      conversations[0]
    );
  }, [activeConversationId, conversations, isDraftingNew]);

  const visibleTasks = useMemo(
    () => activeConversation?.tasks ?? [],
    [activeConversation]
  );

  const completedTasksCount = useMemo(
    () => visibleTasks.filter((task) => task.status === "done").length,
    [visibleTasks]
  );

  function upsertConversation(nextConversation: ConversationRecord) {
    setConversations((current) =>
      sortConversations([
        nextConversation,
        ...current.filter((conversation) => conversation.id !== nextConversation.id),
      ])
    );
  }

  function updateConversationInState(conversationId: string, updater: (conversation: ConversationRecord) => ConversationRecord) {
    setConversations((current) =>
      sortConversations(
        current.map((conversation) =>
          conversation.id === conversationId ? updater(conversation) : conversation
        )
      )
    );
  }

  async function handleLogout() {
    await api.logout();
    router.replace("/login");
  }

  function handleStartDraftConversation() {
    setIsDraftingNew(true);
    setActiveConversationId(null);
    setPrompt("");
    setError("");
    setConversationMenuId(null);
  }

  function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setIsDraftingNew(false);
    setConversationMenuId(null);
    setError("");
  }

  async function handleConversationPreference(
    conversation: ConversationRecord,
    field: "is_pinned" | "is_favorite"
  ) {
    const updatedConversation = await api.updateConversation(conversation.id, {
      [field]: !conversation[field],
    });
    upsertConversation(updatedConversation);
    setConversationMenuId(null);
  }

  async function handleDeleteConversation(conversationId: string) {
    await api.deleteConversation(conversationId);
    setConversations((current) =>
      current.filter((conversation) => conversation.id !== conversationId)
    );
    setConversationMenuId(null);

    if (activeConversation?.id === conversationId) {
      setActiveConversationId(null);
      setIsDraftingNew(false);
    }
  }

  async function handleTaskStatus(task: TaskRecord) {
    if (!activeConversation) {
      return;
    }

    const nextStatus = task.status === "done" ? "todo" : "done";
    const updatedTask = await api.updateTask(task.id, { status: nextStatus });

    updateConversationInState(activeConversation.id, (conversation) => ({
      ...conversation,
      tasks: conversation.tasks.map((item) =>
        item.id === task.id ? updatedTask : item
      ),
    }));
  }

  async function handleDeleteTask(taskId: string) {
    if (!activeConversation) {
      return;
    }

    await api.deleteTask(taskId);
    updateConversationInState(activeConversation.id, (conversation) => ({
      ...conversation,
      tasks: conversation.tasks.filter((task) => task.id !== taskId),
    }));
  }

  async function submitPrompt(trimmedPrompt: string) {
    setSubmitting(true);
    setError("");

    try {
      const conversation = await api.sendConversation({
        content: trimmedPrompt,
        conversation_id: activeConversation?.id,
      });

      upsertConversation({
        ...conversation,
        title: conversation.title || sentenceTitle(trimmedPrompt),
      });
      setActiveConversationId(conversation.id);
      setIsDraftingNew(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not send that message."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    setPrompt("");
    await submitPrompt(trimmedPrompt);
  }

  async function handleRegenerate() {
    const lastUserMessage = [...(activeConversation?.messages ?? [])]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage || submitting) {
      return;
    }

    await submitPrompt(lastUserMessage.content);
  }

  if (loadingWorkspace) {
    return (
      <main className="flex h-[100dvh] items-center justify-center px-4">
        <div className="glass-panel soft-border rounded-xl px-6 py-5 text-sm text-[var(--muted)]">
          Loading workspace...
        </div>
      </main>
    );
  }

  const latestAssistantMessageId = [...(activeConversation?.messages ?? [])]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <main className="h-[100dvh] overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <div className="grid h-full lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="soft-border-r flex h-full flex-col p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-[-0.05em]">
                Conversations
              </h1>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleStartDraftConversation}
              aria-label="Start a new conversation"
              className="rounded-xl"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {conversations.length ? (
              conversations.map((conversation) => {
                const selected = conversation.id === activeConversation?.id;
                const menuOpen = conversationMenuId === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={cn(
                      "cursor-pointer relative rounded-xl border bg-white/72 p-3 transition",
                      selected
                        ? "border-[var(--accent)] bg-[#fff3e7]"
                        : "border-white/55 hover:border-[var(--line)]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conversation.id)}
                        className="flex min-w-0 flex-1 text-left"
                      >
                          <span className="line-clamp-1 font-semibold">{conversation.title}</span>
                          {conversation.is_pinned ? (
                            <Pin className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
                          ) : null}
                          {conversation.is_favorite ? (
                            <Star className="h-3.5 w-3.5 fill-current text-[#d97706]" />
                          ) : null}
                      </button>

                      <div className="relative shrink-0">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl"
                          onClick={() =>
                            setConversationMenuId((current) =>
                              current === conversation.id ? null : conversation.id
                            )
                          }
                          aria-label="Conversation actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>

                        {menuOpen ? (
                          <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[var(--line)] bg-white p-2 shadow-[0_14px_40px_rgba(24,33,39,0.14)]">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f6f1e8]"
                              onClick={() => handleConversationPreference(conversation, "is_favorite")}
                            >
                              <Star className="h-4 w-4" />
                              {conversation.is_favorite ? "Unfavorite" : "Favorite"}
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#f6f1e8]"
                              onClick={() => handleConversationPreference(conversation, "is_pinned")}
                            >
                              <Pin className="h-4 w-4" />
                              {conversation.is_pinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#b42318] hover:bg-[#fff1f1]"
                              onClick={() => handleDeleteConversation(conversation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--line)] px-4 py-8 text-sm leading-7 text-[var(--muted)]">
                No conversations yet. Use the plus button and send a message to create the first one.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/70 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-dark)] text-sm font-semibold text-white">
                {getInitials(user?.email)}
              </div>
                <h6 className="truncate text-sm font-semibold">{user?.email}</h6>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleLogout}
          >
            Log out
          </Button>
          </div>
        </aside>

        <section className="flex h-full flex-col overflow-y-auto">
          <div className="flex-1">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-5 px-3 py-4 sm:px-5">
              {activeConversation?.messages.length ? (
                activeConversation.messages.map((message) => {
                  const showTaskBoard =
                    message.id === latestAssistantMessageId &&
                    message.role === "assistant" &&
                    visibleTasks.length > 0;

                  return (
                    <div key={message.id} className="fade-up">
                      <article
                        className={cn(
                          "flex items-start gap-3",
                          message.role === "user" ? "ml-auto max-w-3xl flex-row-reverse" : "max-w-5xl"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                            message.role === "user"
                              ? "bg-[#efe3d5] text-[#6b584d]"
                              : "bg-[var(--surface-dark)] text-white"
                          )}
                        >
                          {message.role === "user" ? (
                            <User2 className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>

                        <div
                          className={cn(
                            "w-full rounded-xl border px-4 py-4 sm:px-5",
                            message.role === "user"
                              ? "border-[#ead9c7] bg-[#fff8ef]"
                              : "border-white/60 bg-white/82"
                          )}
                        >
                          <div className="mb-2 flex items-center gap-3">
                            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                              {message.role === "user" ? "You" : "TaskForge AI"}
                            </p>
                            <span className="text-[11px] text-[var(--muted)]">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-7">
                            {message.content}
                          </p>
                        </div>
                      </article>

                      {showTaskBoard ? (
                        <section className="mt-4 pl-0 sm:pl-[3.25rem]">
                          <div className="rounded-xl border border-[var(--line)] bg-white/82 p-3 sm:p-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                              {visibleTasks.map((task) => (
                                <Card
                                  key={task.id}
                                  className={cn(
                                    "flex min-h-[280px] flex-col",
                                    task.status === "done" && "border-[#b7dfcf] bg-[#f2fbf6]"
                                  )}
                                >
                                  <CardHeader className="pb-3">
                                      <CardTitle
                                        className={cn(
                                          "line-clamp-2",
                                          task.status === "done" && "opacity-60 line-through"
                                        )}
                                      >
                                        {task.title}
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent className="flex flex-1 flex-col">
                                    <p className="text-sm leading-7 text-[var(--muted)]">
                                      {task.description || "No description provided yet."}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", getPriorityTone(task.priority))}>
                                        <Flag className="h-3.5 w-3.5" />
                                        {task.priority}
                                      </span>
                                      <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", getStatusTone(task.status))}>
                                        {task.status === "done" ? (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                          <Circle className="h-3.5 w-3.5" />
                                        )}
                                        {task.status}
                                      </span>
                                      {task.estimated_minutes ? (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-medium text-[#3d5966]">
                                          <Clock3 className="h-3.5 w-3.5" />
                                          {task.estimated_minutes} min
                                        </span>
                                      ) : null}
                                    </div>
                                    </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </section>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="grid min-h-full place-items-center px-2 py-10">
                  <div className="max-w-xl text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                      Prompt starter
                    </p>
                    <h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
                      What should we break down next?
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                      Click the plus icon to start a draft, then send the first message. The conversation will only exist after that first prompt is saved to the database.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {SUGGESTED_PROMPTS.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPrompt(suggestion);
                            setIsDraftingNew(true);
                            setActiveConversationId(null);
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex flex-col mx-auto max-w-4xl ">
              <div className="relative flex rounded-xl border border-[var(--line)] bg-white/82 p-3">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Describe the goal you want turned into tasks..."
                  rows={4}
                  className="min-h-[110px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                />
                 <Button type="submit" variant="accent" disabled={submitting} className="m-4 absolute right-0 bottom-0 rounded-xl">
                      {submitting ? "Generating plan..." : <Send className="w-4 h-4"/>}
                </Button>
              </div>

              {error ? (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
