// Two accounts that are easy to remember (Clarence, 2026-10-26), next to the
// @demo.test ones: marjun@gmail.com on the team as the owner, clar@gmail.com
// as a client with nothing sent yet. Both "password". Safe to re-run.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const db = createClient("https://kqhbealgcicjhpyzgjzy.supabase.co", env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: list, error: listErr } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listErr) throw listErr;

async function user(email, fullName) {
  const found = list.users.find((u) => u.email === email);
  if (found) {
    const { error } = await db.auth.admin.updateUserById(found.id, {
      password: "password",
      email_confirm: true,
    });
    if (error) throw error;
    return found.id;
  }
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: "password",
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw new Error(`create ${email}: ${error.message}`);
  return data.user.id;
}

const marjun = await user("marjun@gmail.com", "Marjun Lopez");
const { error: staffErr } = await db
  .from("staff")
  .upsert({ user_id: marjun, name: "Marjun Lopez", role: "owner", active: true });
if (staffErr) throw staffErr;
const clar = await user("clar@gmail.com", "Clar");
console.log("marjun@gmail.com (owner)", marjun);
console.log("clar@gmail.com (client)", clar);
