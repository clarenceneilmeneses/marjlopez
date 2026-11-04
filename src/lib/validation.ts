/**
 * One set of rules for every form, and the words the screens say when a field
 * is wrong.
 *
 * -----------------------------------------------------------------------------
 * WHY THIS EXISTS
 * -----------------------------------------------------------------------------
 *
 * Before this file, `BOOKING-VALIDATION-PLAN.md` §2.4 was true: the booking
 * endpoint checked that a mobile number was between 7 and 32 characters and
 * nothing else, so `"abcdefg"` was a valid Philippine mobile, `0995 516 6278`
 * and `+639955166278` and `09955166278` were three different guests to an
 * exact-match lookup, and `2026-02-31` passed a `YYYY-MM-DD` regex and was
 * then rolled to 3 March by `new Date()` — quoting the guest for nights they
 * had not asked for.
 *
 * Every rule here is written once and used twice: the browser uses it to say
 * what is wrong while the guest types, and the server uses the same function
 * to refuse the request. A rule that lives only in the browser is a
 * suggestion — the layers table at the top of BOOKING-VALIDATION-PLAN.md.
 *
 * -----------------------------------------------------------------------------
 * STRICT FOR GUESTS, SOFT FOR STAFF
 * -----------------------------------------------------------------------------
 *
 * The owner's decision, 2026-09-23. A guest-facing form BLOCKS on a bad field:
 * the guest is typing their own details, once, and a typo in the mobile number
 * is how a caretaker fails to reach them at the gate. A staff form SHOWS the
 * same message and still saves: staff are re-keying years of Google Sheets
 * history that will not all be clean, and a booking they cannot file is worse
 * than a phone number stored as it was written down.
 *
 * So these functions return a PROBLEM or null. They never decide what to do
 * about it — `<FormField tone="blocking" | "advisory">` does that, and the
 * server decides for itself.
 */

import { z } from "zod";

// =============================================================================
// Dates
// =============================================================================

/**
 * The villas are in Cavite and Tagaytay and the guests are in Manila; the
 * server is wherever Vercel put it. "Today" has to mean today THERE.
 *
 * `BOOKING-VALIDATION-PLAN.md` §2.3: between midnight and 8am Manila the
 * server's UTC date is still yesterday, so `checkIn < today` let a guest book
 * a check-in that had already passed.
 */
export const MANILA_TZ = "Asia/Manila";

/** Today's calendar date in Manila, as `YYYY-MM-DD`. */
export function manilaToday(now: Date = new Date()): string {
  // `en-CA` formats as YYYY-MM-DD, which is the one locale that gives the ISO
  // day without string surgery on the parts.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Is this a day that exists?
 *
 * `/^\d{4}-\d{2}-\d{2}$/` accepts `2026-02-31`, `2026-13-01` and `2026-00-10`.
 * `new Date()` then rolls them forward silently rather than refusing, which is
 * the dangerous half: the guest sees one range on the calendar and the quote
 * is built from another.
 */
export function isRealCalendarDay(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [never, number, number, number];
  if (m < 1 || m > 12 || d < 1) return false;
  // Day 0 of the next month is the last day of this one, and it is the only
  // way to get February right in every year without a leap-year branch.
  const lastOfMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= lastOfMonth;
}

export const DATE_HINT = "Use the calendar — dates are day, month, year.";

/** A real `YYYY-MM-DD` day. Use this everywhere a date crosses the wire. */
export const isoDaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be in YYYY-MM-DD form.")
  .refine(isRealCalendarDay, "That date doesn't exist — check the day and month.");

// =============================================================================
// Philippine mobile numbers
// =============================================================================

/**
 * Every shape the same number arrives in, and the one shape it is stored as.
 *
 *   0995 516 6278     what a guest types
 *   +63 995 516 6278  what a contact card holds
 *   639955166278      what a spreadsheet export holds
 *   09955166278       what this returns, always
 *
 * Storing one shape is what makes "have we met this guest before?" work:
 * `import-bookings.py` and `createPublicBooking` both look a guest up by exact
 * mobile match, and three spellings of one number is three guest records and
 * three halves of a history.
 */
export function digitsOf(value: string): string {
  return value.replace(/\D+/g, "");
}

/** `09955166278`, or null when it is not a Philippine mobile. */
export function normalisePhMobile(raw: string): string | null {
  let digits = digitsOf(raw);
  // +63 / 63 country code, with or without the trunk 0 after it.
  if (digits.startsWith("63")) digits = `0${digits.slice(2)}`;
  // A number typed without the trunk zero: 9955166278.
  if (digits.length === 10 && digits.startsWith("9")) digits = `0${digits}`;
  return /^09\d{9}$/.test(digits) ? digits : null;
}

/**
 * The same, for a guest who is not in the Philippines.
 *
 * Added 2026-09-23. The rule before it was 11 digits starting 09 and nothing
 * else, which refused a guest with a Singapore or Australian mobile at the
 * checkout — for a villa they could otherwise pay for. That is a real booking
 * lost to a rule about phone numbers.
 *
 * A number from abroad has to NAME ITS COUNTRY: a leading `+`, or `00`, the
 * international prefix. Bare digits are read as Philippine, because they
 * almost always are and because guessing a country from a length is how
 * `65 9123 4567` becomes a Philippine number nobody can ring.
 *
 * Returns the stored shape — `09XXXXXXXXX` for a PH mobile, `+<digits>` for
 * anywhere else — or null when it is not a number we could call.
 */
export function normaliseMobile(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  // A letter is never a phone number, and `+63 (Globe)` is a note, not a
  // number. Catching it here keeps the digit-count messages honest.
  if (/[A-Za-z]/.test(value)) return null;

  const ph = normalisePhMobile(value);
  if (ph) return ph;

  const declared = value.startsWith("+")
    ? digitsOf(value)
    : value.startsWith("00")
      ? digitsOf(value).slice(2)
      : null;
  if (declared === null) return null;

  // E.164: at most 15 digits including the country code. The floor is looser
  // than the standard's on purpose — some countries' numbers really are that
  // short, and this is a contact detail, not a billing identifier.
  if (declared.length < 8 || declared.length > 15) return null;
  return `+${declared}`;
}

/**
 * What the field shows as the guest types: `0995 516 6278`.
 *
 * Formats progressively — it has to be usable at four digits, not only at
 * eleven — and leaves anything that is not a Philippine mobile exactly as
 * typed, so a guest pasting `+65 9123 4567` and a staff member entering a
 * landline are not fought by the cursor.
 */
export function formatMobile(raw: string): string {
  const digits = digitsOf(raw);
  if (raw.trim().startsWith("+") || raw.trim().startsWith("00") || digits.startsWith("63")) {
    return raw;
  }
  if (!digits.startsWith("0") || digits.length > 11) return raw;
  const parts = [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)];
  return parts.filter(Boolean).join(" ");
}

export const MOBILE_HINT =
  "11 digits starting 09 — or + and the country code from abroad. We text the gate directions here.";
export const MOBILE_EXAMPLE = "0995 516 6278";
export const MOBILE_EXAMPLE_ABROAD = "+65 9123 4567";

export function mobileProblem(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Please give a contact number.";
  if (/[A-Za-z]/.test(value)) return "A contact number is digits only.";
  if (normaliseMobile(value)) return null;

  const digits = digitsOf(value);
  const abroad = value.startsWith("+") || value.startsWith("00");
  if (abroad) {
    if (digits.length < 8) {
      return `That is ${digits.length} digits — an international number needs its country code and at least 8.`;
    }
    return `That number doesn't look right — check the country code. Example: ${MOBILE_EXAMPLE_ABROAD}`;
  }
  if (digits.length !== 11) {
    return `That is ${digits.length} digits — a Philippine mobile has 11. From another country, start with + and the country code.`;
  }
  return `That doesn't look like a Philippine mobile. Example: ${MOBILE_EXAMPLE}, or ${MOBILE_EXAMPLE_ABROAD} from abroad.`;
}

/** Server-side, guest: accepts every spelling above, stores the one. */
export const mobileSchema = z
  .string()
  .trim()
  .min(1, "Please give a contact number.")
  .transform((v) => normaliseMobile(v) ?? v)
  .refine(
    (v) => normaliseMobile(v) !== null,
    `Give an 11-digit mobile, e.g. ${MOBILE_EXAMPLE} — or + and the country code from abroad.`,
  );

/**
 * The staff version: normalises when it can, keeps what was typed when it
 * cannot, and never refuses. Sheet history contains landlines, overseas
 * numbers and "09XX (globe) / 09YY (smart)" in one cell.
 */
export const looseMobileSchema = z
  .string()
  .trim()
  .max(32)
  .transform((v) => normaliseMobile(v) ?? v);

// =============================================================================
// Email
// =============================================================================

/**
 * Deliberately not an RFC 5322 regex. The only thing worth catching here is a
 * typo the guest can see and fix; anything subtler is caught by the
 * confirmation email not arriving, which is a better test than any pattern.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export const EMAIL_HINT = "Your booking confirmation and receipt go here.";

export function emailProblem(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Please give an email address.";
  if (value.length > 254) return "That email is too long.";
  if (!value.includes("@")) return "An email address needs an @.";
  if (!EMAIL_RE.test(value)) return "That email doesn't look right — check for a typo.";
  return null;
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email is too long.")
  .refine((v) => EMAIL_RE.test(v), "That email doesn't look right.");

// =============================================================================
// Passwords
// =============================================================================

/**
 * Eight characters, and that is the whole rule.
 *
 * Not a character-class checklist: those push people to `Password1!`, which is
 * weaker than a long ordinary phrase and much harder to type on a phone at a
 * gate. The screen says the rule before they type rather than after they
 * submit — the panel already did this well and it is kept.
 *
 * SIGN-IN NEVER CHECKS THIS. An account made when the rule was six characters
 * still signs in; tightening a rule must not lock out the people who followed
 * the old one.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_HINT = `At least ${PASSWORD_MIN} characters. A short phrase you'll remember beats a clever word.`;

export function passwordProblem(raw: string): string | null {
  if (!raw) return "Please choose a password.";
  if (raw.length < PASSWORD_MIN) {
    return `${raw.length} character${raw.length === 1 ? "" : "s"} — it needs at least ${PASSWORD_MIN}.`;
  }
  if (raw.length > 72) return "That password is too long (72 characters maximum).";
  if (/^\s|\s$/.test(raw)) return "A password can't start or end with a space.";
  return null;
}

// =============================================================================
// Names and free text
// =============================================================================

export function nameProblem(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Please give your full name.";
  if (value.length < 2) return "That name is too short.";
  if (value.length > 120) return "That name is too long.";
  if (!/\p{L}/u.test(value)) return "A name needs at least one letter.";
  if (/https?:\/\/|www\./i.test(value)) return "That looks like a web address, not a name.";
  return null;
}

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please give your full name.")
  .max(120)
  .refine((v) => /\p{L}/u.test(v), "A name needs at least one letter.");

// =============================================================================
// Numbers
// =============================================================================

/**
 * `<input type="number">` is not a number field.
 *
 * It accepts `e`, `E`, `+`, `-` and multiple dots in most browsers (they are
 * valid in a float literal), silently reports an empty string for anything it
 * cannot parse — so a form reads "" and stores 0 — and on iOS it shows a
 * keyboard with letters on it. Every money and count field in the admin was
 * one of these.
 *
 * `keepDigits` / `keepDecimal` are what the replacement uses: the input is a
 * text field, the value is sanitised on every keystroke and on paste, and the
 * caret stays where the typist put it because nothing is reformatted
 * mid-entry.
 */
export function keepDigits(value: string, maxLength?: number): string {
  const digits = digitsOf(value);
  return maxLength === undefined ? digits : digits.slice(0, maxLength);
}

/** Digits and at most one decimal point. `allowNegative` for ledger corrections. */
export function keepDecimal(
  value: string,
  { decimals = 2, allowNegative = false }: { decimals?: number; allowNegative?: boolean } = {},
): string {
  const negative = allowNegative && value.trim().startsWith("-");
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  const fraction = rest.join("").slice(0, decimals);
  const body = rest.length > 0 ? `${whole}.${fraction}` : whole;
  return negative ? `-${body}` : body;
}

export function numberProblem(
  raw: string,
  {
    label = "This",
    min,
    max,
    integer = false,
    required = true,
  }: { label?: string; min?: number; max?: number; integer?: boolean; required?: boolean } = {},
): string | null {
  const value = raw.trim();
  if (!value) return required ? `${label} is required.` : null;
  if (!/^-?\d*\.?\d*$/.test(value) || value === "." || value === "-") {
    return `${label} must be a number.`;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (integer && !Number.isInteger(n)) return `${label} must be a whole number.`;
  if (min !== undefined && n < min) {
    return min === 0 ? `${label} cannot be negative.` : `${label} must be at least ${min}.`;
  }
  if (max !== undefined && n > max) return `${label} cannot be more than ${max}.`;
  return null;
}

// =============================================================================
// Putting a form together
// =============================================================================

/** What every `*Problem` function returns, keyed by field id. */
export type FieldProblems = Record<string, string | null | undefined>;

/** The ids of the fields that are wrong, in the order they were given. */
export function problemFields(problems: FieldProblems): string[] {
  return Object.keys(problems).filter((key) => Boolean(problems[key]));
}

export function hasProblem(problems: FieldProblems): boolean {
  return problemFields(problems).length > 0;
}

/**
 * Take the reader to the first thing that is wrong.
 *
 * A long form that refuses to submit with the reason three screens above the
 * button is a form that looks broken. This scrolls the first bad field into
 * the middle of the viewport and focuses it, so the error message, the field
 * and the caret are all in the same place.
 *
 * Returns the id it went to, or null when nothing was wrong.
 */
export function scrollToFirstProblem(problems: FieldProblems): string | null {
  const first = problemFields(problems)[0];
  if (!first || typeof document === "undefined") return null;

  const field =
    document.getElementById(first) ??
    document.querySelector<HTMLElement>(`[data-field="${first}"]`);
  if (!field) return null;

  const anchor = field.closest<HTMLElement>("[data-field-shell]") ?? field;
  anchor.scrollIntoView({ behavior: "smooth", block: "center" });

  // Focus after the scroll starts, not before: focusing first makes the
  // browser jump the field to the top of the viewport and the smooth scroll
  // then fights it.
  window.setTimeout(() => {
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.focus({ preventScroll: true });
    }
  }, 250);

  return first;
}
