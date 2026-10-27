/**
 * Demo data for the presentation: Marj and two assistants, a client account to
 * demo the client side with, ten inquiries across every type and stage, and
 * the quick replies.
 *
 *   node scripts/seed.mjs
 *
 * Needs supabase/schema.sql applied first, and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (never committed). Re-running replaces the demo rows; it never
 * touches anybody who isn't an @demo.test account.
 *
 * Every demo account's password is `password`.
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
const url = vars.VITE_SUPABASE_URL;
const key = vars.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Need VITE_SUPABASE_URL (.env) and SUPABASE_SERVICE_ROLE_KEY (.env.local)");

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const PASSWORD = "password";
const NOW = Date.now();
const ago = (hours) => new Date(NOW - hours * 3_600_000).toISOString();
const ahead = (hours) => new Date(NOW + hours * 3_600_000).toISOString();
/** Tomorrow (or N days) at a Manila hour, as an instant. */
function manilaAt(daysAhead, hour) {
  const d = new Date(NOW + 8 * 3_600_000 + daysAhead * 86_400_000);
  const ymd = d.toISOString().slice(0, 10);
  return new Date(`${ymd}T${String(hour).padStart(2, "0")}:00:00+08:00`).toISOString();
}

async function must(p, what) {
  const { data, error } = await p;
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

// ------------------------------------------------------------------ users
async function allUsers() {
  const out = [];
  for (let page = 1; page < 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    out.push(...data.users);
    if (data.users.length < 200) break;
  }
  return out;
}

const existing = await allUsers();
async function user(email, fullName) {
  const found = existing.find((u) => u.email === email);
  if (found) {
    await db.auth.admin.updateUserById(found.id, { password: PASSWORD, email_confirm: true });
    return found.id;
  }
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(`create ${email}: ${error.message}`);
  return data.user.id;
}

console.log("Clearing old demo rows…");
const demoIds = existing.filter((u) => u.email?.endsWith("@demo.test")).map((u) => u.id);
if (demoIds.length) {
  await must(db.from("profiles").delete().in("id", demoIds), "clear profiles");
  await must(db.from("staff").delete().in("user_id", demoIds), "clear staff");
}
await must(db.from("quick_replies").delete().neq("id", "00000000-0000-0000-0000-000000000000"), "clear replies");

// ------------------------------------------------------------------ team
console.log("Team…");
const marj = await user("marj@demo.test", "Marj Lopez");
const bea = await user("bea@demo.test", "Bea Santos");
const paolo = await user("paolo@demo.test", "Paolo Cruz");
await must(
  db.from("staff").insert([
    { user_id: marj, name: "Marj Lopez", role: "owner" },
    { user_id: bea, name: "Bea Santos", role: "assistant" },
    { user_id: paolo, name: "Paolo Cruz", role: "assistant" },
  ]),
  "staff",
);
const STAFF = { marj: [marj, "Marj Lopez"], bea: [bea, "Bea Santos"], paolo: [paolo, "Paolo Cruz"] };

// ---------------------------------------------------------- quick replies
console.log("Quick replies…");
const AUTO = {
  management:
    "Salamat, {first_name}! We got your request about managing your property. The team will reply here within a day.\n\nTo get ahead: send a few photos of the place and its location pin, and tell us if it's on Airbnb already — it makes the walkthrough much quicker.",
  seminar:
    "Salamat, {first_name}! You're on the list for the seminar. The team will send the next batch's date, venue and fee here within a day.\n\nWhile waiting: write down the areas you're eyeing and how much you're ready to put in — bring them, the day is built around your numbers.",
  invest:
    "Salamat, {first_name}! We got your message about investing. Marj's team will reply here within a day to set a call with him.\n\nNothing is committed — the call is to walk you through current projects and their numbers.",
  system:
    "Salamat, {first_name}! We got your request about a system for your resort. The team will reply here within a day to set a demo.\n\nA quick question to get ahead: what do you use today for bookings and payments — Airbnb only, a spreadsheet, GCash?",
  other:
    "Salamat, {first_name}! We got your message and the team will get back to you here within a day.",
};
await must(
  db.from("quick_replies").insert([
    ...Object.entries(AUTO).map(([t, body], i) => ({
      title: `Auto-reply · ${t[0].toUpperCase()}${t.slice(1)}`,
      body,
      auto_for_type: t,
      sort: 90 + i,
    })),
    {
      title: "How much do I need to start?",
      body: "Hi {first_name}! Depende sa setup:\n\n• Rental arbitrage (you lease a unit and list it): around ₱150k–₱300k for deposit, furnishing and the first months.\n• Your own property: furnishing and setup, usually ₱300k–₱1M depending on size.\n• Building from scratch: ₱3M and up.\n\nWant to go through your numbers on a quick call?",
      sort: 1,
    },
    {
      title: "Do you offer management?",
      body: "Yes, {first_name} — we can manage it for you the way we run Malaya Villas: listing, guest messages, cleaning and turnovers, and a monthly report. Fees depend on the property; let's set a call so we can look at yours.",
      sort: 2,
    },
    {
      title: "How long does a build take?",
      body: "For a 2–3 bedroom villa, plan for about 6–9 months from final design to first guest. Permits and the lot's condition move that the most. Can you send the lot's location pin and a few photos?",
      sort: 3,
    },
    {
      title: "How much is a system like Malaya's?",
      body: "It depends on the number of units and what you need (website, inbox, payments, finance). We'll send you a proposal after a short call — when are you free this week?",
      sort: 4,
    },
    {
      title: "Let's set a call",
      body: "Let's talk it through, {first_name}! I'll send you a time here — just tap Confirm if it works, or ask for another time.",
      sort: 5,
    },
    {
      title: "Following up",
      body: "Hi {first_name}! Following up on your request — are you still looking into this? Happy to help whenever you're ready.",
      sort: 6,
    },
  ]),
  "quick replies",
);

// ---------------------------------------------------------- conversations
const fill = (body, name) => body.replaceAll("{first_name}", name.split(" ")[0]);

/**
 * One person. `msgs` are [hoursAgo, who, body, extra?] in order; who is
 * "client", a staff key, "auto", or "meeting".
 */
async function person(p) {
  const id = await user(p.email, p.name);
  await must(
    db.from("profiles").insert({ id, full_name: p.name, mobile: p.mobile, email: p.email, source: p.source }),
    `profile ${p.name}`,
  );
  const conv = await must(
    db.from("conversations").insert({ person_id: id }).select("id").single(),
    `conversation ${p.name}`,
  );

  const leadIds = [];
  for (const l of p.leads) {
    const row = await must(
      db
        .from("leads")
        .insert({
          person_id: id,
          conversation_id: conv.id,
          type: l.type,
          answers: { ...l.answers, ...(l.note ? { note: l.note } : {}) },
          location: l.answers.location ?? null,
          budget: l.answers.budget ?? l.answers.capital ?? null,
          timeline: l.answers.timeline ?? l.answers.start_when ?? l.answers.when ?? null,
          source: p.source,
          created_at: ago(l.at),
          ...(l.hotOverride !== undefined ? { hot_override: l.hotOverride } : {}),
        })
        .select("id")
        .single(),
      `lead ${p.name}`,
    );
    leadIds.push({ id: row.id, ...l });
  }
  const current = leadIds[leadIds.length - 1];

  let lastClient = null;
  let lastStaff = null;
  for (const m of p.msgs) {
    const [h, who, body, extra = {}] = m;
    const sent_at = ago(h);
    const lead = extra.lead !== undefined ? leadIds[extra.lead] : current;
    if (who === "request") {
      await must(
        db.from("messages").insert({
          conversation_id: conv.id,
          author: "client",
          author_id: id,
          author_name: p.name,
          kind: "request",
          body: lead.note ?? "",
          lead_id: lead.id,
          sent_at,
        }),
        "request",
      );
      lastClient = sent_at;
    } else if (who === "auto") {
      await must(
        db.from("messages").insert({
          conversation_id: conv.id,
          author: "staff",
          author_name: "Team Marj",
          kind: "auto",
          body: fill(AUTO[lead.type], p.name),
          lead_id: lead.id,
          sent_at,
        }),
        "auto",
      );
    } else if (who === "client") {
      await must(
        db.from("messages").insert({ conversation_id: conv.id, author: "client", author_id: id, author_name: p.name, body, sent_at }),
        "client msg",
      );
      lastClient = sent_at;
    } else if (who === "meeting") {
      const [sid] = STAFF[extra.by ?? "marj"];
      const meeting = await must(
        db
          .from("meetings")
          .insert({
            conversation_id: conv.id,
            lead_id: current.id,
            proposed_by: sid,
            starts_at: extra.startsAt,
            duration_min: extra.minutes ?? 30,
            mode: extra.mode ?? "google_meet",
            link: extra.mode === "phone" || extra.mode === "in_person" ? null : "https://meet.google.com/abc-defg-hij",
            location: extra.location ?? null,
            note: body || null,
            status: extra.status ?? "proposed",
            responded_at: extra.status && extra.status !== "proposed" ? ago(h - 0.5) : null,
            created_at: sent_at,
          })
          .select("id")
          .single(),
        "meeting",
      );
      await must(
        db.from("messages").insert({
          conversation_id: conv.id,
          author: "staff",
          author_id: sid,
          author_name: STAFF[extra.by ?? "marj"][1],
          kind: "meeting",
          body,
          meeting_id: meeting.id,
          lead_id: current.id,
          sent_at,
        }),
        "meeting msg",
      );
      lastStaff = sent_at;
    } else {
      const [sid, sname] = STAFF[who];
      await must(
        db.from("messages").insert({ conversation_id: conv.id, author: "staff", author_id: sid, author_name: sname, body, sent_at }),
        "staff msg",
      );
      lastStaff = sent_at;
    }
  }

  const lastAt = ago(Math.min(...p.msgs.map((m) => m[0])));
  const waiting = lastClient && (!lastStaff || lastClient > lastStaff) ? (p.waitingSince ?? lastClient) : null;
  await must(
    db
      .from("conversations")
      .update({
        current_lead_id: current.id,
        assigned_to: p.assigned ? STAFF[p.assigned][0] : null,
        unread: p.unread ?? Boolean(waiting),
        starred: p.starred ?? false,
        last_activity: lastAt,
        waiting_since: waiting,
        created_at: ago(Math.max(...p.msgs.map((m) => m[0]))),
        client_seen_at: p.clientSeen === false ? null : lastAt,
        staff_seen_at: waiting ? lastStaff : lastAt,
      })
      .eq("id", conv.id),
    "conversation update",
  );
  for (const l of leadIds) {
    await must(
      db
        .from("leads")
        .update({ stage: l.stage ?? "new", lost_reason: l.lostReason ?? null })
        .eq("id", l.id),
      "lead stage",
    );
  }
  for (const n of p.notes ?? []) {
    const [sid, sname] = STAFF[n.by];
    await must(
      db.from("staff_notes").insert({ conversation_id: conv.id, staff_id: sid, author_name: sname, body: n.body, created_at: ago(n.at) }),
      "note",
    );
  }
  console.log(`  ${p.name}`);
}

console.log("Inquiries…");

// The account to demo the client side with.
await person({
  email: "client@demo.test",
  name: "Carla Mendoza",
  mobile: "0917 555 0142",
  source: "instagram",
  assigned: "marj",
  starred: true,
  clientSeen: false,
  leads: [
    {
      type: "invest",
      at: 74,
      stage: "talking",
      note: "May lote po ako sa Tagaytay, 600 sqm. Gusto ko po sana ng 2-bedroom villa with pool, parang Malaya, kayo na po mag-run. Pwede po ba makita yung costing?",
      answers: { amount: "3-10m", interest: "my-land", properties: "1", location: "cavite-tagaytay", ready: "3-6m" },
    },
  ],
  msgs: [
    [74, "request"],
    [74, "auto"],
    [70, "marj", "Hi Carla! Marj here. 600 sqm in Tagaytay is a great start — that fits a 2BR villa with a pool and parking. Can you send the location pin and a few photos of the lot?"],
    [52, "client", "Hello po! Eto po yung pin: https://maps.app.goo.gl/tagaytay-lot — near Crosswinds po. Medyo sloping po yung lot."],
    [50, "marj", "Sloping is fine, it can even give you a better view deck. Let's do a quick call so I can walk you through costing based on our own builds."],
    [49, "meeting", "Let's go through the costing and the timeline.", { startsAt: manilaAt(1, 10), minutes: 45, status: "proposed" }],
  ],
  notes: [{ by: "marj", at: 50, body: "Owns 600 sqm near Crosswinds, sloping. Budget ₱5–10M. Wants 2 villas eventually — good long-term client." }],
});

await person({
  email: "rico.villanueva@demo.test",
  name: "Rico Villanueva",
  mobile: "0928 410 7731",
  source: "facebook",
  leads: [
    {
      type: "management",
      at: 9,
      note: "OFW po ako, uuwi na this December. May 2 units po ako sa Batangas, gusto ko na po ipa-manage agad.",
      answers: { properties: "2-3", status: "ready", location: "batangas", run_by: "nobody", ready: "asap", property_note: "2 condo units, newly turned over" },
    },
  ],
  msgs: [
    [9, "request"],
    [9, "auto"],
    [5, "client", "Hello po, available pa po ba kayo for a call this week? Nasa Dubai pa po ako pero pwede po ako evenings PH time."],
  ],
  waitingSince: ago(9),
});

await person({
  email: "jessa.lim@demo.test",
  name: "Jessa Lim",
  mobile: "0917 882 3390",
  source: "tiktok",
  assigned: "paolo",
  leads: [
    {
      type: "system",
      at: 50,
      stage: "call_booked",
      answers: { kind: "villas", units: "6-15", channels: ["airbnb", "booking", "social"], pains: ["messages", "double-bookings", "payments"], ready: "1-3m", website: "https://facebook.com/staycationsbyjessa" },
    },
  ],
  msgs: [
    [50, "request"],
    [50, "auto"],
    [46, "paolo", "Hi Jessa! Paolo from Marj's team. 8 units across Airbnb, Booking and FB — that's exactly the setup Malaya's system was built for. Let's show you a demo?"],
    [44, "client", "Yes please!! Sobrang hirap na po mag-reply sa lahat ng inquiries 😅"],
    [43, "meeting", "A 30-minute demo of the inbox, calendar and payments.", { by: "paolo", startsAt: manilaAt(1, 14), status: "confirmed" }],
    [42.5, "client", "Confirmed the call ✅"],
    [42, "paolo", "See you tomorrow, Jessa! I'll bring sample numbers for 8 units."],
  ],
});

await person({
  email: "markanthony.reyes@demo.test",
  name: "Mark Anthony Reyes",
  mobile: "0995 120 4478",
  source: "facebook",
  assigned: "bea",
  leads: [
    {
      type: "seminar",
      at: 30,
      stage: "talking",
      answers: { stage_now: "exploring", properties: "0", format: "online", capital: "lt100k", ready: "exploring" },
    },
  ],
  msgs: [
    [30, "request"],
    [30, "auto"],
    [27, "bea", "Hi Mark! Bea from Marj's team. Depende sa setup:\n\n• Rental arbitrage: around ₱150k–₱300k for deposit, furnishing and the first months.\n• Your own property: ₱300k–₱1M.\n\nIf you're still researching, the seminar is the best start — want me to let you know when the next batch opens?"],
    [25, "client", "Ay ganun po pala. Sige po, pa-notify na lang po. Salamat!"],
  ],
});

await person({
  email: "patricia.gomez@demo.test",
  name: "Patricia Gomez",
  mobile: "0918 664 2015",
  source: "instagram",
  leads: [
    {
      type: "invest",
      at: 27,
      answers: { amount: "1-3m", interest: "co-own", properties: "0", location: "cebu", ready: "3-6m" },
    },
  ],
  msgs: [
    [27, "request"],
    [27, "auto"],
  ],
});

await person({
  email: "joel.santos@demo.test",
  name: "Joel Santos",
  mobile: "0927 300 9182",
  source: "tiktok",
  leads: [
    {
      type: "other",
      at: 2.2,
      answers: {
        topic: "collab",
        details: "Travel vlogger po ako (120k on TikTok). Gusto ko po sana i-feature ang Malaya Villas at si Sir Marj — interview + villa tour.",
      },
    },
  ],
  msgs: [
    [2.2, "request"],
    [2.2, "auto"],
  ],
});

await person({
  email: "grace.tan@demo.test",
  name: "Grace Tan",
  mobile: "0917 778 6023",
  source: "referral",
  assigned: "paolo",
  leads: [
    {
      type: "seminar",
      at: 900,
      stage: "won",
      answers: { stage_now: "has-property", properties: "1", format: "in-person", capital: "300k-1m", ready: "1-3m" },
    },
    {
      type: "system",
      at: 80,
      stage: "proposal_sent",
      answers: { kind: "villas", units: "2-5", channels: ["airbnb", "social"], pains: ["messages", "payments", "finance"], ready: "asap" },
    },
  ],
  msgs: [
    [900, "request", "", { lead: 0 }],
    [900, "auto", "", { lead: 0 }],
    [895, "marj", "Hi Grace! Welcome — let's get your Laguna place listed. I'll walk you through it on a call."],
    [80, "request", "", { lead: 1 }],
    [80, "auto", "", { lead: 1 }],
    [76, "paolo", "Hi Grace! Nice to see you again 😊 Now that you have 3 units, the system makes a lot of sense. I'll prepare a proposal."],
    [30, "paolo", "Sent the proposal to your email — 3 units, website + inbox + Xendit payments. Let me know if you have questions!"],
    [28, "client", "Got it, thank you! Will review with my husband this weekend."],
  ],
  notes: [{ by: "paolo", at: 30, body: "Proposal sent: 3 units, website + inbox + payments. Follow up Monday." }],
});

await person({
  email: "daniel.cruz@demo.test",
  name: "Daniel Cruz",
  mobile: "0936 501 2288",
  source: "youtube",
  assigned: "bea",
  leads: [
    {
      type: "seminar",
      at: 220,
      stage: "lost",
      lostReason: "Budget",
      answers: { stage_now: "has-property", properties: "1", format: "in-person", capital: "100-300k", ready: "1-3m" },
    },
  ],
  msgs: [
    [220, "request"],
    [220, "auto"],
    [216, "bea", "Hi Daniel! The next seminar batch is ₱15,000, in Tagaytay. Would that work for you?"],
    [200, "client", "Medyo mahal pa po for me ngayon. Babalik na lang po ako next year. Thank you po!"],
    [199, "bea", "No worries, Daniel! We'll be here 🙏"],
  ],
});

await person({
  email: "kim.aquino@demo.test",
  name: "Kim Aquino",
  mobile: "0917 230 5561",
  source: "malaya-guest",
  assigned: "marj",
  starred: true,
  leads: [
    {
      type: "invest",
      at: 400,
      stage: "won",
      note: "Nag-stay kami sa Malaya last summer, gusto namin ng ganun sa lote namin sa Nasugbu (1,200 sqm).",
      answers: { amount: "10m+", interest: "my-land", properties: "2-3", location: "batangas", ready: "asap" },
    },
  ],
  msgs: [
    [400, "request"],
    [400, "auto"],
    [396, "marj", "Hi Kim! Salamat for staying with us. 1,200 sqm in Nasugbu — let's do this. I'll visit the lot this week."],
    [300, "meeting", "Site visit at the lot.", { startsAt: ago(298), minutes: 90, mode: "in_person", location: "Nasugbu, Batangas", status: "confirmed" }],
    [120, "marj", "Contract signed — welcome to the build, Kim! I'll send the design schedule here."],
    [118, "client", "Super excited! Thank you Marj and team! 🎉"],
  ],
});

await person({
  email: "liza.fernandez@demo.test",
  name: "Liza Fernandez",
  mobile: "0998 441 3307",
  source: "threads",
  leads: [
    {
      type: "seminar",
      at: 0.8,
      answers: { stage_now: "arbitrage", properties: "0", format: "either", capital: "100-300k", ready: "asap" },
    },
  ],
  msgs: [
    [0.8, "request"],
    [0.8, "auto"],
  ],
});

await person({
  email: "ben.torres@demo.test",
  name: "Ben Torres",
  mobile: "0919 772 0154",
  source: "facebook",
  assigned: "bea",
  leads: [
    {
      type: "system",
      at: 60,
      stage: "talking",
      answers: { kind: "resort", units: "1", channels: ["social"], pains: ["website", "messages"], ready: "exploring" },
    },
  ],
  msgs: [
    [60, "request"],
    [60, "auto"],
    [56, "bea", "Hi Ben! For one unit, a simple booking page with a chat like this one might be enough to start. Want me to send a few examples?"],
    [20, "client", "Sige po, pa-send po. Thanks!"],
    [19, "bea", "Sent! Check your email 😊 Tell me which one you like."],
  ],
});

await person({
  email: "tess.ramirez@demo.test",
  name: "Tess Ramirez",
  mobile: "0917 604 2219",
  source: "facebook",
  leads: [
    {
      type: "management",
      at: 3,
      note: "5 condo units po sa Tagaytay, naka-Airbnb na pero ako lang nagha-handle. Hirap na po.",
      answers: { properties: "4-10", status: "running", location: "cavite-tagaytay", run_by: "self", ready: "1-3m", property_note: "5 condo units near Sky Ranch" },
    },
  ],
  msgs: [
    [3, "request"],
    [3, "auto"],
  ],
  waitingSince: ago(3),
});

console.log("\nDone. Every demo account's password is `password`:");
console.log("  Team:   marj@demo.test (owner) · bea@demo.test · paolo@demo.test");
console.log("  Client: client@demo.test (Carla Mendoza — has a call waiting to confirm)");
