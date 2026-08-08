import { SignalPassExperience } from "@/components/SignalPassExperience";
import { EVENT, ORGANIZER } from "@/lib/constants";

export default function Home() {
  return (
    <div className="bg-paper flex flex-1 flex-col">
      <header className="border-line border-b px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-xl items-start justify-between gap-4">
          <p className="text-stamp font-mono text-[11px] tracking-[0.14em] uppercase">
            Hacker House Goa · {EVENT.year}
          </p>
          <div className="border-line-strong text-ink-soft flex h-14 w-14 shrink-0 -rotate-[9deg] items-center justify-center rounded-full border text-center font-mono text-[8px] leading-tight">
            <span>
              <b className="text-stamp block text-[9px] tracking-wide">HH·GOA</b>
              {EVENT.dateRange.split(" ").slice(0, 2).join(" ")}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6">
          <h1 className="text-ink text-6xl leading-[0.92] font-bold tracking-tight uppercase sm:text-7xl">
            The Signal
            <br />
            <span className="text-stamp">Pass</span>
          </h1>
          <p className="font-body text-ink-soft max-w-md text-lg italic">
            Upload a photo. Get your official {EVENT.name} {EVENT.year} builder credential — tiered,
            stamped, and ready to post.
          </p>

          <div className="mt-2 w-full">
            <SignalPassExperience />
          </div>
        </div>
      </main>

      <footer className="border-line border-t px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-3">
          <div className="text-ink-faint flex flex-wrap justify-between gap-2 font-mono text-[11px]">
            <span className="text-stamp uppercase">{EVENT.motto}</span>
            <span>{EVENT.coordinatesLabel}</span>
            <span>{EVENT.hashtag}</span>
          </div>
          <div className="text-ink-faint flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase">
            <span>Powered by {ORGANIZER.name}</span>
            <a
              href={ORGANIZER.x}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stamp -my-2 py-2 underline-offset-4 hover:underline"
            >
              X
            </a>
            <a
              href={ORGANIZER.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stamp -my-2 py-2 underline-offset-4 hover:underline"
            >
              Telegram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
