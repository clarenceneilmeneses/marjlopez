/**
 * A month of older, finished inquiries, so the dashboard's charts have
 * something to show. Every one is archived — out of the Inbox's default view —
 * and answered, so first-reply times count.
 *
 *   node scripts/seed-history.mjs
 *
 * Only touches history-NN@demo.test accounts; safe to re-run, and it leaves
 * the main demo (scripts/seed.mjs) and anything typed while testing alone.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function env(file) {
  try {
    return Object.fromEntries(
      readFileSync(file, "utf8")
        .split(/\r?\n/)
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
    );
  } catch {
    return {};
  }
}
const vars = { ...env(".env"), ...env(".env.local"), ...process.env };
const db = createClient(vars.VITE_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const must = async (p, what) => {
  const { data, error } = await p;
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
};

// A fixed sequence, so re-running gives the same month.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (xs) => xs[Math.floor(rand() * xs.length)];
const NOW = Date.now();
const ago = (h) => new Date(NOW - h * 3_600_000).toISOString();

const FIRST = ["Andrea", "Paolo", "Mika", "Josh", "Bianca", "Carlo", "Denise", "Enzo", "Faith", "Gab", "Hannah", "Ivan", "Jasmine", "Karl", "Lara", "Migs", "Nicole", "Owen", "Pia", "Raffy", "Sam", "Trisha", "Vince", "Wena", "Yani", "Zed"];
const LAST = ["Reyes", "Santos", "Cruz", "Bautista", "Garcia", "Mendoza", "Torres", "Flores", "Ramos", "Villanueva", "Aquino", "Navarro"];
const SOURCES = ["facebook", "facebook", "facebook", "instagram", "instagram", "tiktok", "tiktok", "threads", "referral", "youtube", "malaya-guest"];
const STAGES = ["talking", "talking", "talking", "call_booked", "proposal_sent", "proposal_sent", "won", "won", "won", "lost", "lost", "lost"];
const LOCS = ["cavite-tagaytay", "batangas", "metro-manila", "laguna", "pampanga", "cebu", "bataan-zambales"];
const PROPS = ["0", "1", "1", "2-3", "2-3", "4-10", "11+"];
const READY = ["asap", "1-3m", "1-3m", "3-6m", "exploring"];
const ANSWERS = {
  management: () => ({ properties: pick(PROPS.slice(1)), status: pick(["running", "ready", "building"]), location: pick(LOCS), run_by: pick(["self", "family", "manager", "nobody"]), ready: pick(READY) }),
  seminar: () => ({ stage_now: pick(["exploring", "has-property", "hosting", "arbitrage"]), properties: pick(PROPS), format: pick(["in-person", "online", "either"]), capital: pick(["lt100k", "100-300k", "300k-1m", "1m+"]), ready: pick(READY) }),
  invest: () => ({ amount: pick(["500k-1m", "1-3m", "3-10m", "10m+", "discuss"]), interest: pick(["co-own", "next-villa", "my-land", "open"]), properties: pick(PROPS), location: pick(LOCS), ready: pick(READY) }),
  system: () => ({ kind: pick(["resort", "villas", "hotel", "glamping"]), units: pick(["1", "2-5", "6-15", "16+"]), channels: ["airbnb", pick(["booking", "social", "website"])], pains: [pick(["messages", "double-bookings", "payments", "finance"])], ready: pick(READY) }),
  other: () => ({ topic: pick(["collab", "partnership", "media"]), details: "Hello po! Gusto ko po sanang mag-collab." }),
};
const TYPES = ["management", "management", "management", "seminar", "seminar", "seminar", "invest", "invest", "system", "system", "other"];
const STAFF = await must(db.from("staff").select("user_id,name"), "staff");

const users = [];
for (let page = 1; page < 20; page++) {
  const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
  users.push(...data.users);
  if (data.users.length < 200) break;
}
const old = users.filter((u) => /^history-\d+@demo\.test$/.test(u.email ?? "")).map((u) => u.id);
if (old.length) await must(db.from("profiles").delete().in("id", old), "clear history");

for (let i = 0; i < 26; i++) {
  const email = `history-${String(i + 1).padStart(2, "0")}@demo.test`;
  const name = `${FIRST[i]} ${pick(LAST)}`;
  let id = users.find((u) => u.email === email)?.id;
  if (!id) {
    const { data, error } = await db.auth.admin.createUser({ email, password: "password", email_confirm: true });
    if (error) throw error;
    id = data.user.id;
  }
  const source = pick(SOURCES);
  const type = pick(TYPES);
  const hoursAgo = 24 + rand() * 29 * 24; // spread over the last 30 days, none today
  await must(db.from("profiles").insert({ id, full_name: name, mobile: `0917 ${100 + i} ${4000 + i}`, email, source }), "profile");
  const conv = await must(db.from("conversations").insert({ person_id: id }).select("id").single(), "conv");
  const lead = await must(
    db.from("leads").insert({ person_id: id, conversation_id: conv.id, type, answers: ANSWERS[type](), source, created_at: ago(hoursAgo) }).select("id").single(),
    "lead",
  );
  const [sid, sname] = (({ user_id, name: n }) => [user_id, n])(pick(STAFF));
  const replyAfter = 0.3 + rand() * 7; // hours
  await must(
    db.from("messages").insert([
      { conversation_id: conv.id, author: "client", author_id: id, author_name: name, kind: "request", body: "", lead_id: lead.id, sent_at: ago(hoursAgo) },
      { conversation_id: conv.id, author: "staff", author_id: sid, author_name: sname, kind: "message", body: `Hi ${name.split(" ")[0]}! Salamat for reaching out — let's talk about it.`, sent_at: ago(hoursAgo - replyAfter) },
      { conversation_id: conv.id, author: "client", author_id: id, author_name: name, kind: "message", body: "Sige po, thank you!", sent_at: ago(hoursAgo - replyAfter - 1) },
    ]),
    "messages",
  );
  const stage = pick(STAGES);
  await must(db.from("leads").update({ stage, lost_reason: stage === "lost" ? pick(["Budget", "Timing", "No reply"]) : null }).eq("id", lead.id), "stage");
  await must(
    db.from("conversations").update({
      current_lead_id: lead.id,
      assigned_to: sid,
      archived: true,
      unread: false,
      waiting_since: null,
      created_at: ago(hoursAgo),
      last_activity: ago(hoursAgo - replyAfter - 1),
      client_seen_at: ago(hoursAgo - replyAfter - 1),
      staff_seen_at: ago(hoursAgo - replyAfter - 1),
    }).eq("id", conv.id),
    "conv update",
  );
}
console.log("Added 26 archived inquiries over the last 30 days.");
