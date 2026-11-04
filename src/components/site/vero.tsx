/**
 * The landing's type voice, after verostudio.com (Clarence, 2026-11-04:
 * "pretty much copy vero's landing page but with the contents of marjun"):
 * a display serif in capitals, with the small words set in lowercase italic,
 * "where *your* WEDDING DRESS BECOMES *art.*"
 *
 * `Vero` applies that to any sentence, so words edited in Admin → Website
 * come out in the same voice without anyone marking them up. A word wrapped
 * in *asterisks* is forced italic; everything else follows the small-words
 * list. The face is Cormorant Garamond (`font-vero`, styles.css).
 */
import { Link } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Words set in lowercase italic; every other word is set in capitals. */
const SMALL = new Set(
  (
    "a an the of to in on at for with and or & that your you is by from it be will so " +
    "where meets as into our his her its are was not no than then this up out who what " +
    "through how one's we us"
  ).split(" "),
);

export function Vero({ text, className }: { text: string; className?: string }) {
  const words = text.split(/(\s+)/);
  return (
    <span className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <Fragment key={i}>{w}</Fragment>;
        const forced = /^\*(.+)\*([.,!?;:]*)$/.exec(w);
        if (forced) {
          return (
            <em key={i} className="vero-italic">
              {forced[1]}
              {forced[2]}
            </em>
          );
        }
        const bare = w.toLowerCase().replace(/[^a-z&']/g, "");
        return SMALL.has(bare) ? (
          <em key={i} className="vero-italic">
            {w.toLowerCase()}
          </em>
        ) : (
          <Fragment key={i}>{w.toUpperCase()}</Fragment>
        );
      })}
    </span>
  );
}

/** The small white button, its label in the same voice: "Work *with* MARJ". */
export function VeroButton({
  children,
  href,
  to,
  search,
  dark = false,
  className,
}: {
  children: string;
  href?: string;
  to?: string;
  search?: Record<string, unknown>;
  dark?: boolean;
  className?: string;
}) {
  const cls = cn(
    "vero-button inline-flex h-11 items-center justify-center px-6 font-vero text-[15px] transition-colors duration-300",
    dark
      ? "bg-[#181615] text-white hover:bg-primary"
      : "bg-white text-[#181615] shadow-[0_2px_18px_rgba(24,22,21,0.07)] hover:bg-[#181615] hover:text-white",
    className,
  );
  const label: ReactNode = <Vero text={children} />;
  if (to) {
    return (
      <Link to={to} search={search as never} className={cls}>
        {label}
      </Link>
    );
  }
  const external = href?.startsWith("http");
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className={cls}>
      {label}
    </a>
  );
}
