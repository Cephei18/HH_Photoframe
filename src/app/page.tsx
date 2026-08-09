import Image from "next/image";
import { SignalPassExperience } from "@/components/SignalPassExperience";
import { EVENT, ORGANIZER } from "@/lib/constants";

export default function Home() {
  return (
    <div className="bg-paper flex flex-1 flex-col">
      <header className="border-line border-b px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-xl items-start justify-between gap-4">
          <Image
            src="/brand/hacker-house.png"
            alt="Hacker House"
            width={1148}
            height={237}
            priority
            className="h-8 w-auto sm:h-9"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG credit mark, no optimization needed */}
          <img
            src="/brand/247pm-studio.svg"
            alt={ORGANIZER.name}
            className="h-8 w-auto shrink-0 sm:h-9"
          />
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
            <span className="flex items-center gap-1.5">
              Powered by
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG credit mark, no optimization needed */}
              <img src="/brand/247pm-studio.svg" alt={ORGANIZER.name} className="h-4 w-auto" />
            </span>
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
