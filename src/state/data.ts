/**
 * Every read and write the two inboxes make. Row-level security does the
 * scoping (schema.sql): the same `messages` query returns one thread to a
 * client and every thread to the team.
 *
 * LIVE, WITH A FALLBACK — Malaya's realtime-messages.sql rule. Both screens
 * subscribe to Supabase Realtime and refetch the moment a row lands; if the
 * socket never connects they still poll (30 s team, 20 s client).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import type {
  Conversation,
  Lead,
  LeadType,
  Meeting,
  Message,
  Profile,
  QuickReply,
  Reaction,
  Staff,
  StaffNote,
} from "@/lib/types";
import { useAuth } from "./auth";

// ------------------------------------------------------------------- live

export function useLiveUpdates(enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["thread"] });
      void queryClient.invalidateQueries({ queryKey: ["mine"] });
    };
    const channel = supabase
      .channel(`live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, refresh)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

// ------------------------------------------------------------- the team

export type ConversationWithPerson = Conversation & { profile: Profile | null };

export interface InboxData {
  conversations: ConversationWithPerson[];
  leads: Lead[];
  /** Newest message per conversation, for the list preview. */
  last: Map<string, Message>;
  /** The latest 1,500 messages, newest first — the dashboard and the bell read these. */
  messages: Message[];
  meetings: Meeting[];
}

export function useInbox(enabled: boolean) {
  return useQuery({
    queryKey: ["inbox"],
    enabled,
    refetchInterval: 30_000,
    queryFn: async (): Promise<InboxData> => {
      const [convs, leads, msgs, meetings] = await Promise.all([
        supabase
          .from("conversations")
          .select("*, profile:profiles(*)")
          .order("last_activity", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("messages").select("*").order("sent_at", { ascending: false }).limit(1500),
        supabase.from("meetings").select("*").order("starts_at"),
      ]);
      if (convs.error) throw convs.error;
      if (meetings.error) throw meetings.error;
      if (leads.error) throw leads.error;
      if (msgs.error) throw msgs.error;
      const last = new Map<string, Message>();
      for (const m of msgs.data as Message[]) {
        if (!last.has(m.conversation_id)) last.set(m.conversation_id, m);
      }
      return {
        conversations: convs.data as ConversationWithPerson[],
        leads: leads.data as Lead[],
        last,
        messages: msgs.data as Message[],
        meetings: meetings.data as Meeting[],
      };
    },
  });
}

export function useStaffList(enabled: boolean) {
  return useQuery({
    queryKey: ["staff"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("staff").select("*").order("role");
      if (error) throw error;
      return data as Staff[];
    },
  });
}

export function useNotes(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["thread", conversationId, "notes"],
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_notes")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at");
      if (error) throw error;
      return data as StaffNote[];
    },
  });
}

export function useQuickReplies(enabled: boolean) {
  return useQuery({
    queryKey: ["quick-replies"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_replies")
        .select("*")
        .order("sort")
        .order("title");
      if (error) throw error;
      return data as QuickReply[];
    },
  });
}

// ---------------------------------------------------------------- a thread

export interface ThreadData {
  messages: Message[];
  reactions: Reaction[];
  meetings: Map<string, Meeting>;
}

export function useThread(conversationId: string | undefined, pollMs = 30_000) {
  return useQuery({
    queryKey: ["thread", conversationId],
    enabled: Boolean(conversationId),
    refetchInterval: pollMs,
    queryFn: async (): Promise<ThreadData> => {
      const [msgs, meetings] = await Promise.all([
        supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId!)
          .order("sent_at"),
        supabase.from("meetings").select("*").eq("conversation_id", conversationId!),
      ]);
      if (msgs.error) throw msgs.error;
      if (meetings.error) throw meetings.error;
      const messages = msgs.data as Message[];
      const ids = messages.map((m) => m.id);
      let reactions: Reaction[] = [];
      if (ids.length) {
        const r = await supabase.from("message_reactions").select("*").in("message_id", ids);
        if (r.error) throw r.error;
        reactions = r.data as Reaction[];
      }
      return {
        messages,
        reactions,
        meetings: new Map((meetings.data as Meeting[]).map((m) => [m.id, m])),
      };
    },
  });
}

// ------------------------------------------------------------- the client

export interface MineData {
  conversation: Conversation | null;
  leads: Lead[];
}

export function useMine(enabled: boolean) {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ["mine", uid],
    enabled: enabled && Boolean(uid),
    refetchInterval: 20_000,
    queryFn: async (): Promise<MineData> => {
      const [conv, leads] = await Promise.all([
        supabase.from("conversations").select("*").eq("person_id", uid!).maybeSingle(),
        supabase
          .from("leads")
          .select("*")
          .eq("person_id", uid!)
          .order("created_at", { ascending: false }),
      ]);
      if (conv.error) throw conv.error;
      if (leads.error) throw leads.error;
      return {
        conversation: (conv.data as Conversation | null) ?? null,
        leads: leads.data as Lead[],
      };
    },
  });
}

// --------------------------------------------------------------- writes

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["inbox"] });
    void queryClient.invalidateQueries({ queryKey: ["thread"] });
    void queryClient.invalidateQueries({ queryKey: ["mine"] });
  };
}

export function useSendMessage() {
  const { session, staff, profile } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      conversationId: string;
      body: string;
      replyToId?: string | null;
      media?: { path: string; type: "image" | "video" } | null;
    }) => {
      const uid = session?.user.id;
      if (!uid) throw new Error("Sign in first");
      const { error } = await supabase.from("messages").insert({
        conversation_id: input.conversationId,
        author: staff ? "staff" : "client",
        author_id: uid,
        author_name: staff?.name ?? profile?.full_name ?? session.user.email ?? "Client",
        body: input.body,
        reply_to_id: input.replyToId ?? null,
        media_path: input.media?.path ?? null,
        media_type: input.media?.type ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export async function uploadMedia(conversationId: string, file: File) {
  const ext =
    file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video") ? "mp4" : "jpg");
  const path = `${conversationId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("message-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { path, type: file.type.startsWith("video") ? ("video" as const) : ("image" as const) };
}

export function useMediaUrl(path: string | null) {
  return useQuery({
    queryKey: ["media", path],
    enabled: Boolean(path),
    staleTime: 50 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("message-media")
        .createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function useEditMessage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const { error } = await supabase
        .from("messages")
        .update({ body, edited_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUnsendMessage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ unsent_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useReact() {
  const { session } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({
      messageId,
      emoji,
      current,
    }: {
      messageId: string;
      emoji: string;
      current?: string;
    }) => {
      const uid = session?.user.id;
      if (!uid) return;
      // One reaction per person per message: same one again takes it off.
      if (current === emoji) {
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", uid);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("message_reactions")
          .upsert({ message_id: messageId, user_id: uid, emoji });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });
}

export function useMarkSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase.rpc("mark_seen", { p_conversation: conversationId });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      void queryClient.invalidateQueries({ queryKey: ["mine"] });
    },
  });
}

export function usePatchConversation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Conversation> }) => {
      const { error } = await supabase.from("conversations").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteConversation() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function usePatchLead() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Lead> }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useAddNote() {
  const { session, staff } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, body }: { conversationId: string; body: string }) => {
      const { error } = await supabase.from("staff_notes").insert({
        conversation_id: conversationId,
        staff_id: session?.user.id,
        author_name: staff?.name ?? "Team",
        body,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      void queryClient.invalidateQueries({ queryKey: ["thread", v.conversationId, "notes"] }),
  });
}

export function useProposeMeeting() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      conversationId: string;
      startsAt: string;
      duration: number;
      mode: Meeting["mode"];
      link: string;
      location: string;
      note: string;
    }) => {
      const { error } = await supabase.rpc("propose_meeting", {
        p_conversation: input.conversationId,
        p_starts_at: input.startsAt,
        p_duration: input.duration,
        p_mode: input.mode,
        p_link: input.link,
        p_location: input.location,
        p_note: input.note,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRespondMeeting() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, accept }: { id: string; accept: boolean }) => {
      const { error } = await supabase.rpc("respond_meeting", { p_meeting: id, p_accept: accept });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useCancelMeeting() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("meetings")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSubmitInquiry() {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: LeadType;
      answers: Record<string, unknown>;
      fullName: string;
      mobile: string;
      source: string;
      note: string;
    }) => {
      const { data, error } = await supabase.rpc("submit_inquiry", {
        p_type: input.type,
        p_answers: input.answers,
        p_full_name: input.fullName,
        p_mobile: input.mobile,
        p_source: input.source,
        p_note: input.note,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useSaveQuickReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (q: Partial<QuickReply> & { title: string; body: string }) => {
      const row = { title: q.title, body: q.body, auto_for_type: q.auto_for_type ?? null };
      const { error } = q.id
        ? await supabase.from("quick_replies").update(row).eq("id", q.id)
        : await supabase.from("quick_replies").insert(row);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["quick-replies"] }),
  });
}

export function useDeleteQuickReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quick_replies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["quick-replies"] }),
  });
}

/** Fill `{first_name}` and friends in a quick reply. */
export function fillReply(body: string, vars: { firstName: string; staffName: string }) {
  return body
    .replaceAll("{first_name}", vars.firstName || "there")
    .replaceAll("{my_name}", vars.staffName);
}

export function errorText(e: unknown, fallback = "Something went wrong."): string {
  if (e && typeof e === "object" && "message" in e && typeof e.message === "string") {
    return e.message;
  }
  return fallback;
}
