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
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[13.5%/6.3%] bg-white">
            {/* A screenshot gets the iOS status bar above it, clear of the
                Dynamic Island, the way the page sits on a real phone. */}
            {src && (
              <>
                <span
                  className="absolute inset-x-0 top-0 flex h-[6.2%] items-end justify-between bg-white px-[9%] pb-[1.5%] text-[10px] font-semibold text-black"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
                >
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <span className="flex items-end gap-px">
                      {[3, 5, 7, 9].map((h) => (
                        <span
                          key={h}
                          className="w-[2px] rounded-sm bg-black"
                          style={{ height: h }}
                        />
                      ))}
                    </span>
                    <span className="relative h-[9px] w-[18px] rounded-[3px] border border-black/40 p-px">
                      <span className="block h-full w-[75%] rounded-[1px] bg-black" />
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
