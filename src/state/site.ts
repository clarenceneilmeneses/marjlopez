/**
 * Admin → Website's reads and writes (supabase/migrations/2026-10-28-site-content.sql),
 * and the live preview's one message.
 *
 * PREVIEW: the editor shows the real page in a frame. The page asks its parent
 * for a draft ("site-preview-ready"); the editor answers with the unsaved
 * words ("site-draft") every time they change, and the page draws those
 * instead of the saved ones. Same origin only, and only inside a frame —
 * a visitor never sees a draft.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { MEDIA_BUCKET } from "@/lib/site-content";

export interface SiteRow {
  key: string;
  content: unknown;
  updated_at: string;
  updated_by_name: string | null;
}

export interface SiteVersion {
  id: string;
  key: string;
  content: unknown;
  saved_at: string;
  saved_by_name: string | null;
}

export function useSiteRow(key: string) {
  return useQuery({
    queryKey: ["site", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key,content,updated_at,updated_by_name")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data as SiteRow | null;
    },
  });
}

export function useSiteVersions(key: string, enabled: boolean) {
  return useQuery({
    queryKey: ["site-versions", key],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content_versions")
        .select("*")
        .eq("key", key)
        .order("saved_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SiteVersion[];
    },
  });
}

function useRefresh() {
  const qc = useQueryClient();
  return (key: string) => {
    void qc.invalidateQueries({ queryKey: ["site", key] });
    void qc.invalidateQueries({ queryKey: ["site-versions", key] });
  };
}

export function useSaveSite() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (v: { key: string; content: unknown; by: string | null; name: string }) => {
      const { error } = await supabase.from("site_content").upsert({
        key: v.key,
        content: v.content,
        updated_at: new Date().toISOString(),
        updated_by: v.by,
        updated_by_name: v.name,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => refresh(v.key),
  });
}

// ------------------------------------------------------------------- photos

export async function uploadSitePhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Photos the team uploaded before, newest first. */
export function useUploadedPhotos(enabled: boolean) {
  return useQuery({
    queryKey: ["site-photos"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return data
        .filter((f) => f.id)
        .map((f) => supabase.storage.from(MEDIA_BUCKET).getPublicUrl(f.name).data.publicUrl);
    },
  });
}

// ------------------------------------------------------------------ preview

/** On a public page: the editor's unsaved draft for `key`, when shown in its preview frame. */
export function usePreviewDraft(key: string): unknown {
  const [draft, setDraft] = useState<unknown>(undefined);
  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; key?: string; content?: unknown } | null;
      if (d?.type === "site-draft" && d.key === key) setDraft(d.content);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "site-preview-ready", key }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [key]);
  return draft;
}
