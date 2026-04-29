"use client";

import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Flag,
  LogOut,
  MessageCirclePlus,
  MoreHorizontal,
  Pin,
  Plus,
  Send,
  Settings,
  Star,
  Trash2,
  User2,
  X,
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
  if (!email) return "U";
  return email.slice(0, 2).toUpperCase();
}

function getPriorityTone(priority?: string | null) {
  switch ((priority ?? "").toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getStatusTone(status?: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "done":
    case "completed":
      return "bg-green-100 text-green-700";
    case "in_progress":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const taskCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadWorkspace() {
      try {
        const [currentUser, fetchedConversations] = await Promise.all([
          api.currentUser(),
          api.listConversations(),
        ]);
        if (cancelled) return;
        setUser(currentUser);
        setConversations(sortConversations(fetchedConversations));
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoadingWorkspace(false);
      }
    }
    loadWorkspace();
    return () => { cancelled = true; };
  }, [router]);

  const activeConversation = useMemo(() => {
    if (isDraftingNew) return null;
    return conversations.find(c => c.id === activeConversationId) ?? conversations[0];
  }, [activeConversationId, conversations, isDraftingNew]);

  const visibleTasks = useMemo(() => activeConversation?.tasks ?? [], [activeConversation]);

  const completedTasksCount = useMemo(() => visibleTasks.filter(t => t.status === "done").length, [visibleTasks]);

  function upsertConversation(nextConversation: ConversationRecord) {
    setConversations(current => sortConversations([nextConversation, ...current.filter(c => c.id !== nextConversation.id)]));
  }

  function updateConversationInState(conversationId: string, updater: (conversation: ConversationRecord) => ConversationRecord) {
    setConversations(current => sortConversations(current.map(c => c.id === conversationId ? updater(c) : c)));
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
    setCurrentTaskIndex(0);
  }

  async function handleConversationPreference(conversation: ConversationRecord, field: "is_pinned" | "is_favorite") {
    const updatedConversation = await api.updateConversation(conversation.id, { [field]: !conversation[field] });
    upsertConversation(updatedConversation);
    setConversationMenuId(null);
  }

  async function handleDeleteConversation(conversationId: string) {
    await api.deleteConversation(conversationId);
    setConversations(current => current.filter(c => c.id !== conversationId));
    setConversationMenuId(null);
    if (activeConversation?.id === conversationId) {
      setActiveConversationId(null);
      setIsDraftingNew(false);
    }
  }

  async function handleTaskStatus(task: TaskRecord) {
    if (!activeConversation) return;
    const nextStatus = task.status === "done" ? "todo" : "done";
    const updatedTask = await api.updateTask(task.id, { status: nextStatus });
    updateConversationInState(activeConversation.id, (conversation) => ({
      ...conversation,
      tasks: conversation.tasks.map(item => item.id === task.id ? updatedTask : item),
    }));
  }

  async function handleDeleteTask(taskId: string) {
    if (!activeConversation) return;
    await api.deleteTask(taskId);
    updateConversationInState(activeConversation.id, (conversation) => ({
      ...conversation,
      tasks: conversation.tasks.filter(task => task.id !== taskId),
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
      upsertConversation({ ...conversation, title: conversation.title || sentenceTitle(trimmedPrompt) });
      setActiveConversationId(conversation.id);
      setIsDraftingNew(false);
      setCurrentTaskIndex(0);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send that message.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    setPrompt("");
    await submitPrompt(trimmedPrompt);
  }

  async function handleRegenerate() {
    const lastUserMessage = [...(activeConversation?.messages ?? [])].reverse().find(m => m.role === "user");
    if (!lastUserMessage || submitting) return;
    await submitPrompt(lastUserMessage.content);
  }

  const slideTask = (direction: "prev" | "next") => {
    if (visibleTasks.length === 0) return;
    setCurrentTaskIndex(prev => {
      if (direction === "next") return (prev + 1) % visibleTasks.length;
      return prev === 0 ? visibleTasks.length - 1 : prev - 1;
    });
  };

  if (loadingWorkspace) {
    return (
      <main className="flex h-[100dvh] items-center justify-center px-4">
        <div className="glass-panel soft-border rounded-xl px-6 py-5 text-sm text-[var(--muted)]">
          Loading workspace...
        </div>
      </main>
    );
  }

  const latestAssistantMessageId = [...(activeConversation?.messages ?? [])].reverse().find(m => m.role === "assistant")?.id;

  return (
    <main className="h-[100dvh] overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <div className="grid h-full lg:grid-cols-[290px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="soft-border-r flex h-full flex-col p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.05em]">Conversations</h1>
            <Button type="button" size="icon" variant="outline" onClick={handleStartDraftConversation} aria-label="Start new conversation" className="rounded-xl">
              <MessageCirclePlus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {conversations.length ? (
              conversations.map(conversation => {
                const selected = conversation.id === activeConversation?.id;
                const menuOpen = conversationMenuId === conversation.id;
                return (
                  <div key={conversation.id} className={cn("cursor-pointer relative rounded-xl border bg-white/72 p-3 transition", selected ? "border-blue-500 bg-blue-50" : "border-white/55 hover:border-gray-300")}>
                    <div className="flex items-start gap-2">
                      <button type="button" onClick={() => handleSelectConversation(conversation.id)} className="flex min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="line-clamp-1 font-semibold text-sm truncate max-w-[180px]" title={conversation.title}>
                            {conversation.title}
                          </span>
                          {conversation.is_pinned && <Pin className="h-3 w-3 text-blue-600 shrink-0" />}
                          {conversation.is_favorite && <Star className="h-3 w-3 fill-current text-yellow-500 shrink-0" />}
                        </div>
                      </button>
                      <div className="relative shrink-0">
                        <Button type="button" size="icon" variant="ghost" className="h-6 w-6 rounded-lg" onClick={() => setConversationMenuId(menuOpen ? null : conversation.id)} aria-label="Conversation actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {menuOpen && (
                          <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => handleConversationPreference(conversation, "is_favorite")}>
                              <Star className="h-4 w-4" />{conversation.is_favorite ? "Unfavorite" : "Favorite"}
                            </button>
                            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => handleConversationPreference(conversation, "is_pinned")}>
                              <Pin className="h-4 w-4" />{conversation.is_pinned ? "Unpin" : "Pin"}
                            </button>
                            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => handleDeleteConversation(conversation.id)}>
                              <Trash2 className="h-4 w-4" />Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500">No conversations yet.</div>
            )}
          </div>

          {/* User section - dropdown */}
          <div className="mt-3 flex flex-col gap-3">
            <div className="relative flex items-center gap-3 rounded-xl bg-white/70 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
                {getInitials(user?.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{user?.name || user?.email}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="relative">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {userMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      <Settings className="h-4 w-4" />Settings
                    </button>
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <section className="flex h-full flex-col overflow-y-auto">
          <div className="flex-1">
            <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-5 px-3 py-4 sm:px-5">
              {activeConversation?.messages.length ? (
                activeConversation.messages.map(message => {
                  const showTaskBoard = message.id === latestAssistantMessageId && message.role === "assistant" && visibleTasks.length > 0;
                  return (
                    <div key={message.id} className="fade-up">
                      <article className={cn("flex items-start gap-3", message.role === "user" ? "ml-auto max-w-3xl flex-row-reverse" : "max-w-5xl")}>
                        <div className={cn("mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", message.role === "user" ? "bg-yellow-100 text-yellow-700" : "bg-gray-800 text-white")}>
                          {message.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={cn("w-full rounded-xl border px-4 py-4 sm:px-5", message.role === "user" ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-white")}>
                          <div className="mb-2 flex items-center gap-3">
                            <p className="font-mono text-[11px] uppercase tracking-wider text-gray-500">{message.role === "user" ? "You" : "TaskForge AI"}</p>
                            <span className="text-[11px] text-gray-400">{formatTime(message.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                        </div>
                      </article>

                      {showTaskBoard && visibleTasks.length > 0 && (
                        <section className="mt-4 pl-0 sm:pl-[3.25rem]">
                          <div className="rounded-xl border border-gray-200 bg-white p-4">
                            {/* Carousel Navigation */}
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Tasks ({currentTaskIndex + 1}/{visibleTasks.length})</span>
                              <div className="flex gap-1">
                                <button onClick={() => slideTask("prev")} className="rounded-lg p-2 hover:bg-gray-100" disabled={visibleTasks.length <= 1}>
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button onClick={() => slideTask("next")} className="rounded-lg p-2 hover:bg-gray-100" disabled={visibleTasks.length <= 1}>
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Animated Task Card */}
                            <div className="relative overflow-hidden">
                              <div className="transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentTaskIndex * 100}%)` }}>
                                <div className="flex gap-4">
                                  {visibleTasks.map(task => (
                                    <div key={task.id} className="min-w-full">
                                      <Card className={cn("min-h-[260px] flex flex-col", task.status === "done" && "border-green-300 bg-green-50")}>
                                        <CardHeader className="pb-2">
                                          <CardTitle className={cn("line-clamp-2 text-base", task.status === "done" && "opacity-60 line-through")}>
                                            {task.title}
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-1 flex-col pt-2">
                                          <p className="text-sm text-gray-600 mb-3">{task.description || "No description."}</p>
                                          <div className="mt-auto flex flex-wrap gap-2">
                                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", getPriorityTone(task.priority))}>
                                              <Flag className="h-3 w-3" />{task.priority}
                                            </span>
                                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium", getStatusTone(task.status))}>
                                              {task.status === "done" ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}{task.status}
                                            </span>
                                            {task.estimated_minutes && (
                                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                <Clock3 className="h-3 w-3" />{task.estimated_minutes}m
                                              </span>
                                            )}
                                          </div>
                                          <div className="mt-3 flex gap-2">
                                            <Button type="button" size="sm" variant={task.status === "done" ? "default" : "outline"} onClick={() => handleTaskStatus(task)} className="flex-1">
                                              <Check className="h-3 w-3 mr-1" />{task.status === "done" ? "Done" : "Mark Done"}
                                            </Button>
                                            <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Dots indicator */}
                            <div className="mt-3 flex justify-center gap-1.5">
                              {visibleTasks.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentTaskIndex(idx)} className={cn("h-2 w-2 rounded-full transition-colors", idx === currentTaskIndex ? "bg-blue-600" : "bg-gray-300")} />
                              ))}
                            </div>
                          </div>
                        </section>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="grid min-h-full place-items-center px-2 py-10">
                  <div className="max-w-xl text-center">
                    <p className="font-mono text-xs uppercase tracking-wider text-blue-600">Prompt starter</p>
                    <h3 className="mt-4 text-3xl font-semibold">What should we break down next?</h3>
                    <p className="mt-4 text-sm text-gray-500">Click the plus icon to start a draft.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {SUGGESTED_PROMPTS.map(suggestion => (
                        <Button key={suggestion} type="button" variant="outline" onClick={() => { setPrompt(suggestion); setIsDraftingNew(true); setActiveConversationId(null); }}>
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto flex max-w-4xl flex-col">
              <div className="relative flex rounded-xl border border-gray-300 bg-white p-3">
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the goal you want turned into tasks..." rows={3} className="min-h-[80px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0" />
                <Button type="submit" variant="default" disabled={submitting} className="absolute right-2 bottom-2 rounded-lg">
                  {submitting ? "..." : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}