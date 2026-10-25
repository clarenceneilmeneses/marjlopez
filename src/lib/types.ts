/** Rows as the database returns them — supabase/schema.sql is the source. */

export type LeadType = "start" | "build" | "system" | "other";
export type LeadStage = "new" | "talking" | "call_booked" | "proposal_sent" | "won" | "lost";

export interface Profile {
  id: string;
  full_name: string;
  mobile: string | null;
  email: string | null;
  source: string | null;
  created_at: string;
}

export interface Staff {
  user_id: string;
  name: string;
  role: "owner" | "assistant";
  active: boolean;
}

export interface Conversation {
  id: string;
  code: string;
  person_id: string;
  current_lead_id: string | null;
  assigned_to: string | null;
  unread: boolean;
  starred: boolean;
  archived: boolean;
  last_activity: string;
  waiting_since: string | null;
  client_seen_at: string | null;
  staff_seen_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  code: string;
  person_id: string;
  conversation_id: string | null;
  type: LeadType;
  answers: Record<string, unknown>;
  location: string | null;
  budget: string | null;
  timeline: string | null;
  source: string | null;
  stage: LeadStage;
  lost_reason: string | null;
  hot: boolean;
  hot_reason: string | null;
  hot_override: boolean | null;
  created_at: string;
}

export type MessageKind = "message" | "request" | "meeting" | "auto";

export interface Message {
  id: string;
  conversation_id: string;
  author: "client" | "staff" | "system";
  author_id: string | null;
  author_name: string;
  kind: MessageKind;
  body: string;
  lead_id: string | null;
  meeting_id: string | null;
  media_path: string | null;
  media_type: "image" | "video" | null;
  reply_to_id: string | null;
  edited_at: string | null;
  unsent_at: string | null;
  sent_at: string;
}

export interface Meeting {
  id: string;
  conversation_id: string;
  lead_id: string | null;
  starts_at: string;
  duration_min: number;
  mode: "google_meet" | "zoom" | "phone" | "in_person";
  link: string | null;
  location: string | null;
  note: string | null;
  status: "proposed" | "confirmed" | "declined" | "cancelled";
  responded_at: string | null;
}

export interface Reaction {
  message_id: string;
  user_id: string;
  emoji: string;
}

export interface StaffNote {
  id: string;
  conversation_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface QuickReply {
  id: string;
  title: string;
  body: string;
  auto_for_type: LeadType | null;
  sort: number;
}
