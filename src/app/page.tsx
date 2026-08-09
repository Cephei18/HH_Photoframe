import Image from "next/image";
import { SignalPassExperience } from "@/components/SignalPassExperience";
import { ACCESS_ZONES, EVENT, ORGANIZER } from "@/lib/constants";

const TICKER_ITEMS = [
  "GOA INTERNATIONAL TERMINAL",
  "NOW BOARDING",
  ...ACCESS_ZONES.map((zone) => `GATE ${zone.code} → ${zone.name.toUpperCase()}`),
  `FLIGHT HH${EVENT.yearShort}`,
  EVENT.motto.toUpperCase(),
  EVENT.coordinatesLabel,
  EVENT.hashtag,
];

const STUB_FIELDS = [
  { label: "Flight", value: `HH${EVENT.yearShort}` },
  { label: "Gate", value: "A–D" },
  { label: "Class", value: "Open boarding" },
  { label: "Terminal", value: "HH Goa" },
];

export default function Home() {
  return (
    <div className="bg-paper flex flex-1 flex-col">
      <Ticker />

      <header className="border-line border-b px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-4 lg:max-w-3xl xl:max-w-4xl">
          <div className="flex items-start justify-between gap-4">
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

          <div className="border-line flex flex-wrap gap-2 border-t pt-3">
            {ACCESS_ZONES.map((zone) => (
              <span
                key={zone.code}
                className="border-line-strong bg-paper-raised text-ink-soft inline-block border px-2 py-1 font-mono text-[10px] tracking-wide uppercase"
              >
                Gate {zone.code} &rarr; {zone.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 lg:max-w-4xl xl:max-w-6xl">
          <div className="text-ink-soft flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase">
            <span className="bg-stamp inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
            Boarding pass &middot; Terminal HH
          </div>

          <h1 className="font-official text-ink text-6xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Hacker House
            <br />
            <span className="text-stamp inline-flex items-center gap-3 italic">
              {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG mark, no optimization needed */}
              <img
                src="/brand/goa-mark.svg"
                alt="Goa"
                className="h-[0.8em] w-auto shrink-0 -rotate-3"
              />
              Terminal
            </span>
          </h1>

          <span className="border-stamp text-stamp font-display inline-block -rotate-6 border-2 px-3 py-1 text-sm font-bold tracking-widest uppercase">
            Cleared for Goa
          </span>

          <p className="font-body text-ink-soft max-w-md text-lg">
            Upload a photo. Receive your official {EVENT.name} {EVENT.year} builder credential.
            Tiered, stamped, and cleared for takeoff.
          </p>

          <div className="border-line-strong bg-paper-raised relative mt-2 w-full border">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3 sm:px-6">
              {STUB_FIELDS.map((field) => (
                <div key={field.label} className="font-mono text-[10px] tracking-wide uppercase">
                  <span className="text-ink-faint block">{field.label}</span>
                  <span className="text-ink">{field.value}</span>
                </div>
              ))}
            </div>

            <Perforation />

            <div className="px-5 py-6 sm:px-6">
              <SignalPassExperience />
            </div>
          </div>
        </div>
      </main>

      <div className="bg-hazard h-2 w-full" />

      <footer className="border-line border-t px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-3 lg:max-w-3xl xl:max-w-4xl">
          <div className="text-ink-faint flex flex-wrap justify-between gap-2 font-mono text-[11px]">
            <span className="text-stamp uppercase">{EVENT.motto}</span>
            <span>{EVENT.coordinatesLabel}</span>
            <span>{EVENT.hashtag}</span>
          </div>
          <div className="text-ink-faint flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase">
            <span className="flex items-center gap-1.5">
              Ground services by
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

/** A dark departure-board strip scrolling gate/terminal info, doubled so the
 * loop is seamless at the halfway point of the animation (see .animate-marquee). */
function Ticker() {
  return (
    <div className="bg-ink overflow-hidden">
      <div className="animate-marquee flex w-max gap-10 py-1.5 whitespace-nowrap">
        <TickerRow />
        <TickerRow aria-hidden />
      </div>
    </div>
  );
}

function TickerRow({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="text-gold flex gap-10 font-mono text-[10px] tracking-[0.2em] uppercase"
    >
      {TICKER_ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          {item}
          <span aria-hidden className="text-paper-raised/40">
            &#10022;
          </span>
        </span>
      ))}
    </div>
  );
}

/** A die-cut ticket perforation: a dashed tear line with round punch notches
 * at each edge, same physical detail as a real boarding-pass stub. */
function Perforation() {
  return (
    <div className="border-line-strong relative border-t border-dashed">
      <span className="bg-paper border-line-strong absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border" />
      <span className="bg-paper border-line-strong absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border" />
    </div>
  );
}
