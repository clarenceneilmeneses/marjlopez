/**
 * The platforms' own marks, in their own colours — the credibility strip,
 * "Find me everywhere" and the footer. Paths from Malaya's
 * review-source-logo.tsx and social-marks.tsx.
 */
import { useId } from "react";

import { cn } from "@/lib/utils";

export type Platform = "airbnb" | "facebook" | "instagram" | "google" | "tiktok";

const PATHS: Record<Exclude<Platform, "google" | "instagram">, { hex: string; d: string }> = {
  airbnb: {
    hex: "#FF5A5F",
    d: "M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z",
  },
  facebook: {
    hex: "#0866FF",
    d: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  tiktok: {
    hex: "#111111",
    d: "M16.6 5.82a4.28 4.28 0 0 1-1.03-2.82h-3.2v12.6a2.6 2.6 0 1 1-1.86-2.5V9.83a5.77 5.77 0 1 0 5.06 5.72V9.4a7.4 7.4 0 0 0 4.33 1.39V7.6a4.28 4.28 0 0 1-3.3-1.78Z",
  },
};

const INSTAGRAM =
  "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z";

export const PLATFORM_NAME: Record<Platform, string> = {
  airbnb: "Airbnb",
  facebook: "Facebook",
  instagram: "Instagram",
  google: "Google",
  tiktok: "TikTok",
};

/** A platform's mark. `mono` paints it in the current text colour (the footer). */
export function PlatformLogo({
  platform,
  mono = false,
  className,
}: {
  platform: Platform;
  mono?: boolean;
  className?: string;
}) {
  const box = cn("size-5 shrink-0", className);
  const label = PLATFORM_NAME[platform];
  // One gradient per mark: a shared id breaks every copy once the first is hidden.
  const gradId = `ig-${useId().replace(/:/g, "")}`;

  if (platform === "google") {
    return (
      <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
        <path
          fill={mono ? "currentColor" : "#4285F4"}
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        />
        <path
          fill={mono ? "currentColor" : "#34A853"}
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill={mono ? "currentColor" : "#FBBC05"}
          d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
        />
        <path
          fill={mono ? "currentColor" : "#EA4335"}
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38Z"
        />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
        {!mono && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#FEDA75" />
              <stop offset="0.3" stopColor="#FA7E1E" />
              <stop offset="0.6" stopColor="#D62976" />
              <stop offset="0.85" stopColor="#962FBF" />
              <stop offset="1" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
        )}
        <path fill={mono ? "currentColor" : `url(#${gradId})`} d={INSTAGRAM} />
      </svg>
    );
  }

  const mark = PATHS[platform];
  return (
    <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
      <path fill={mono ? "currentColor" : mark.hex} d={mark.d} />
    </svg>
  );
}

/**
 * Every company the inquiry form names — the platforms above, plus the
 * channels a host lists on and where people find Marj (Clarence, 2026-10-25:
 * "use logos of the mentioned companies"). YouTube and Threads are the
 * Simple Icons paths; Booking.com and Agoda are their app-icon forms (the
 * blue "B." tile, the five dots), drawn small enough to sit in a pill;
 * Malaya is the M from its logo on the logo's cream.
 */
export type Mark = Platform | "youtube" | "threads" | "booking" | "agoda" | "malaya";

export const MARK_NAME: Record<Mark, string> = {
  ...PLATFORM_NAME,
  youtube: "YouTube",
  threads: "Threads",
  booking: "Booking.com",
  agoda: "Agoda",
  malaya: "Malaya Villas",
};

const YOUTUBE =
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z";

const THREADS =
  "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z";

/** Any company's mark, in its own colours. */
export function BrandMark({ mark, className }: { mark: Mark; className?: string }) {
  const box = cn("size-5 shrink-0", className);
  const label = MARK_NAME[mark];
  switch (mark) {
    case "youtube":
      return (
        <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
          <path fill="#FF0000" d={YOUTUBE} />
        </svg>
      );
    case "threads":
      return (
        <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
          <path fill="#000000" d={THREADS} />
        </svg>
      );
    case "booking":
      return (
        <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
          <rect width="24" height="24" rx="5" fill="#003580" />
          <text
            x="5.2"
            y="17.4"
            fill="#FFFFFF"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="15"
            fontWeight="700"
          >
            B
          </text>
          <circle cx="17.4" cy="16.2" r="1.9" fill="#00A1E4" />
        </svg>
      );
    case "agoda":
      return (
        <svg className={box} viewBox="0 0 24 24" role="img" aria-label={label}>
          {["#EC1C24", "#F7941D", "#7AC143", "#A3238E", "#00A1DE"].map((fill, i) => (
            <circle key={fill} cx={3 + i * 4.5} cy={i % 2 ? 14 : 10} r="2.4" fill={fill} />
          ))}
        </svg>
      );
    case "malaya":
      return <img src="/brand/malaya-mark.png" alt={label} className={cn(box, "rounded-[28%]")} />;
    default:
      return <PlatformLogo platform={mark} className={box} />;
  }
}
