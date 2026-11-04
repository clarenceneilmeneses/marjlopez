/**
 * Device frames for screenshots — a browser window and an iPhone — drawn in
 * CSS so they stay sharp at any size and need no image of their own.
 */
import { cn } from "@/lib/utils";

export function Browser({
  src,
  url,
  className,
  eager = false,
}: {
  src: string;
  url: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-white shadow-level-3 ring-1 ring-black/10",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#f4f1ec] px-3 py-2">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-neutral-500">
          {url}
        </span>
        <span className="w-10" />
      </div>
      <img src={src} alt="" loading={eager ? "eager" : "lazy"} className="block w-full" />
    </div>
  );
}

/**
 * An iPhone: titanium edge, black bezel, the Dynamic Island, side buttons.
 * Width comes from the caller; the screen keeps the phone's 19.5 : 9 shape
 * and the screenshot fills it from the top.
 */
export function IPhone({
  src,
  className,
  children,
}: {
  src?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Side buttons, peeking past the frame. */}
      <span className="absolute -left-[3px] top-[18%] h-[5%] w-[3px] rounded-l bg-[#6e6a66]" />
      <span className="absolute -left-[3px] top-[26%] h-[9%] w-[3px] rounded-l bg-[#6e6a66]" />
      <span className="absolute -left-[3px] top-[37%] h-[9%] w-[3px] rounded-l bg-[#6e6a66]" />
      <span className="absolute -right-[3px] top-[29%] h-[13%] w-[3px] rounded-r bg-[#6e6a66]" />
      <div className="rounded-[18%/8.5%] bg-gradient-to-b from-[#8d8984] via-[#5f5b57] to-[#8d8984] p-[2px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
        <div className="rounded-[17.5%/8.2%] bg-[#0b0b0c] p-[3.6%]">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[13.5%/6.3%] bg-white [container-type:inline-size]">
            {/* A screenshot gets the iOS status bar above it, clear of the
                Dynamic Island, the way the page sits on a real phone. Sized in
                cqw (% of the screen's width), so a small phone gets a small
                status bar instead of one that runs into the island. */}
            {src && (
              <>
                <span
                  className="absolute inset-x-0 top-0 flex h-[6.2%] items-end justify-between bg-white px-[9%] pb-[1.5%] text-[4.2cqw] font-semibold leading-none text-black"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
                >
                  <span>9:41</span>
                  <span className="flex items-center gap-[1.6cqw]">
                    <span className="flex items-end gap-[0.4cqw]">
                      {[1.2, 2, 2.8, 3.6].map((h) => (
                        <span
                          key={h}
                          className="w-[0.8cqw] rounded-[0.3cqw] bg-black"
                          style={{ height: `${h}cqw` }}
                        />
                      ))}
                    </span>
                    <span className="relative h-[3.6cqw] w-[7.2cqw] rounded-[1.1cqw] border-[0.4cqw] border-black/40 p-[0.4cqw]">
                      <span className="block h-full w-[75%] rounded-[0.4cqw] bg-black" />
                    </span>
                  </span>
                </span>
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-x-0 bottom-0 top-[6.2%] h-[93.8%] w-full object-cover object-top"
                />
              </>
            )}
            {children}
            <span className="absolute left-1/2 top-[1.6%] h-[3.6%] w-[31%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A laptop, deliberately generic (Clarence, 2026-11-04: "dont use a macbook
 * and remove the notch"): a charcoal lid with even bezels and a pin-dot
 * webcam, a thicker chin, and a flat dark base with a slim front lip.
 * Width comes from the caller; the screen takes the screenshot's own shape,
 * so nothing of it is cropped.
 */
export function Laptop({ src, className }: { src: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative mx-[6%] rounded-[1.8%/2.8%] bg-gradient-to-b from-[#2a2a2c] to-[#1c1c1e] px-[1.8%] pb-[3.2%] pt-[2.4%] ring-1 ring-black/40 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]">
        <span className="absolute left-1/2 top-[0.9%] size-[0.7%] min-h-[3px] min-w-[3px] -translate-x-1/2 rounded-full bg-[#0c0c0d] ring-1 ring-white/10" />
        <div className="relative overflow-hidden bg-white">
          <img src={src} alt="" loading="lazy" className="block h-auto w-full" />
        </div>
      </div>
      <div className="relative h-0 pb-[2.6%]">
        <div className="absolute inset-0 rounded-b-[30%_100%] bg-gradient-to-b from-[#3a3a3d] via-[#2a2a2c] to-[#161617] shadow-[0_18px_30px_-12px_rgba(0,0,0,0.55)]" />
        <span className="absolute inset-x-0 top-0 h-px bg-white/15" />
      </div>
    </div>
  );
}
