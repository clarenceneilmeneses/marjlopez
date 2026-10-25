/**
 * A labelled control that can say what is wrong with itself.
 *
 * -----------------------------------------------------------------------------
 * THE TWO TONES
 * -----------------------------------------------------------------------------
 *
 * `tone="blocking"`  — guest-facing. Red, and the form's submit button is
 *                      expected to be disabled while it is showing. The guest
 *                      is typing their own details once, and a wrong mobile
 *                      number is how a caretaker fails to reach them.
 *
 * `tone="advisory"`  — staff-facing. Amber, says "saved as typed", and stops
 *                      nothing. Staff are re-keying years of Google Sheets
 *                      history; a booking they cannot file is worse than an
 *                      oddly-shaped phone number.
 *
 * The owner chose this split on 2026-09-23. It is a presentation decision and
 * nothing else — `src/lib/validation.ts` decides what "wrong" means, the
 * server decides what it will accept, and neither of them knows about this
 * file.
 *
 * -----------------------------------------------------------------------------
 * WHAT IT WIRES UP FOR YOU
 * -----------------------------------------------------------------------------
 *
 * `<label for>`, `aria-invalid`, `aria-describedby` pointing at whichever of
 * the hint and the error is showing, `role="alert"` on the error so a screen
 * reader announces it when it appears, and `data-field-shell` so
 * `scrollToFirstProblem` can bring the whole block — label, control, message —
 * into view rather than just the input.
 *
 * The hint is shown BEFORE anything is wrong, not after. A rule a reader meets
 * as a rejection is a rule we kept from them.
 */

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { digitsOf, formatMobile, keepDecimal, keepDigits } from "@/lib/validation";

export type FieldTone = "blocking" | "advisory";

export function FormField({
  id,
  label,
  hint,
  problem,
  tone = "blocking",
  optional = false,
  /** Hold the message back until the field has been visited or the form submitted. */
  show = true,
  className,
  labelClassName,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  problem?: string | null | undefined;
  tone?: FieldTone;
  optional?: boolean;
  show?: boolean;
  className?: string;
  labelClassName?: string;
  children: (aria: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}) {
  const showing = Boolean(problem) && show;
  const messageId = showing ? `${id}-problem` : hint ? `${id}-hint` : undefined;

  return (
    <div data-field-shell="" className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn("text-sm font-semibold", labelClassName)}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>}
      </Label>

      {children({
        id,
        "aria-invalid": showing,
        "aria-describedby": messageId,
      })}

      {showing ? (
        <p
          id={`${id}-problem`}
          role="alert"
          className={cn("text-sm", tone === "blocking" ? "text-destructive" : "text-warning")}
        >
          {problem}
          {tone === "advisory" && <span className="text-muted-foreground"> — saved as typed.</span>}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * The summary that sits above a long form's button.
 *
 * On a three-screen checkout, "Reserve" going grey with the reason somewhere
 * above the fold is a form that looks broken rather than one that is waiting.
 * This says how many things are wrong and takes the reader to the first.
 */
export function ProblemSummary({
  problems,
  onGo,
  className,
}: {
  problems: string[];
  onGo?: () => void;
  className?: string;
}) {
  if (problems.length === 0) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm",
        className,
      )}
    >
      <p className="font-semibold text-destructive">
        {problems.length === 1
          ? "One thing needs fixing before you can continue."
          : `${problems.length} things need fixing before you can continue.`}
      </p>
      {onGo && (
        <button
          type="button"
          onClick={onGo}
          className="mt-1 font-semibold text-destructive underline underline-offset-4"
        >
          Take me to it
        </button>
      )}
    </div>
  );
}

/**
 * A number field that is actually a number field.
 *
 * `<input type="number">` accepts `e`, `E`, `+` and `-` (they are legal in a
 * float literal), reports an empty string for anything it cannot parse — so
 * the form reads "" and stores 0 — and shows a letter keyboard on iOS. This is
 * a text input with the right keyboard, sanitised on every keystroke and on
 * paste, so a letter never lands in the field at all.
 *
 * `value` stays a STRING. Parsing at the edge means an empty field is empty
 * rather than zero, which is the difference between "no target set" and "a
 * target of nothing".
 */
export const NumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
    value: string;
    onChange: (value: string) => void;
    /** 0 for counts and whole pesos; 2 for money that can carry centavos. */
    decimals?: number | undefined;
    allowNegative?: boolean | undefined;
    maxLength?: number | undefined;
  }
>(function NumberInput(
  { value, onChange, decimals = 0, allowNegative = false, maxLength, className, ...rest },
  ref,
) {
  return (
    <Input
      {...rest}
      ref={ref}
      type="text"
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      autoComplete="off"
      value={value}
      onChange={(e) => {
        const next =
          decimals > 0
            ? keepDecimal(e.target.value, { decimals, allowNegative })
            : allowNegative && e.target.value.trim().startsWith("-")
              ? `-${keepDigits(e.target.value, maxLength)}`
              : keepDigits(e.target.value, maxLength);
        onChange(next);
      }}
      className={className}
    />
  );
});

/**
 * The same field for a form that models its value as a NUMBER.
 *
 * Most of the admin keeps numeric state and converted on every keystroke:
 *
 *     value={draft.base_rate === 0 ? "" : draft.base_rate}
 *     onChange={(e) => set(k, e.target.value === "" ? 0 : Number(e.target.value))}
 *
 * With `type="number"` that is a trap. The browser reports an EMPTY STRING for
 * anything it cannot parse — including the `e` it happily let the typist
 * enter — so `12e` arrives here as `""` and is stored as **0**. A rate of zero
 * and a rate nobody has set are the same value, and the field looks empty
 * either way.
 *
 * So this keeps the typed text in its own buffer and only tells the parent the
 * number. The buffer is what makes `12.` survive: re-deriving the text from
 * the number on every render would delete the decimal point the moment it was
 * typed, which is the other half of why these fields felt hostile.
 */
export const AmountInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
    value: number;
    onChange: (value: number) => void;
    decimals?: number | undefined;
    allowNegative?: boolean | undefined;
    /** Show nothing rather than `0` for an unset amount. The usual case. */
    blankWhenZero?: boolean | undefined;
  }
>(function AmountInput(
  { value, onChange, decimals = 0, allowNegative = false, blankWhenZero = true, ...rest },
  ref,
) {
  const asText = React.useCallback(
    (n: number) => (blankWhenZero && n === 0 ? "" : String(n)),
    [blankWhenZero],
  );
  const asNumber = (text: string) => {
    if (text === "" || text === "-" || text === ".") return 0;
    const n = Number(text);
    return Number.isFinite(n) ? n : 0;
  };

  const [raw, setRaw] = React.useState(() => asText(value));

  // Re-sync only when the parent's number is not what this field is already
  // showing — a reset, a row loaded from the database, a value another control
  // changed. Syncing on every render is what eats the decimal point.
  React.useEffect(() => {
    if (asNumber(raw) !== value) setRaw(asText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, asText]);

  return (
    <NumberInput
      {...rest}
      ref={ref}
      decimals={decimals}
      allowNegative={allowNegative}
      value={raw}
      onChange={(next) => {
        setRaw(next);
        onChange(asNumber(next));
      }}
    />
  );
});

/**
 * A mobile field that groups the digits as they are typed: `0995 516 6278`.
 *
 * Anything that is not a Philippine mobile — a landline, a `+65` a guest
 * pasted from a contact card, a `+63` from theirs — is left exactly as typed
 * rather than mangled. `normaliseMobile` in validation.ts is what puts it into
 * one shape at the point it is stored, which is the only place one shape
 * matters.
 */
export const MobileInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
    value: string;
    onChange: (value: string) => void;
  }
>(function MobileInput({ value, onChange, className, ...rest }, ref) {
  return (
    <Input
      {...rest}
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={(e) => {
        const input = e.currentTarget;
        let text = input.value;
        let caret = input.selectionStart ?? text.length;
        // Backspace on one of the grouping spaces: the formatter puts the space
        // straight back, so the key did nothing and the digit before it could
        // never be removed. Take that digit instead (the one after, for Delete).
        if (text.length === value.length - 1 && formatMobile(text) === value) {
          const inputType = (e.nativeEvent as InputEvent).inputType;
          if (inputType === "deleteContentBackward" && caret > 0) {
            text = text.slice(0, caret - 1) + text.slice(caret);
            caret -= 1;
          } else if (inputType === "deleteContentForward") {
            text = text.slice(0, caret) + text.slice(caret + 1);
          }
        }
        const next = formatMobile(text);
        // Regrouping changes the value under the caret, and React then drops
        // the caret at the end — so a fix in the middle of the number sends
        // the next key to the last digit. Keep it behind the same digit.
        if (next !== input.value) {
          caret = caretAfterDigits(next, digitsOf(text.slice(0, caret)).length);
          input.value = next;
          input.setSelectionRange(caret, caret);
        }
        onChange(next);
      }}
      className={className}
    />
  );
});

/** The caret position just after the `count`th digit of `text`. */
function caretAfterDigits(text: string, count: number): number {
  if (count === 0) return 0;
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]!) && ++seen === count) return i + 1;
  }
  return text.length;
}
