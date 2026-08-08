import type { BuilderIdentity } from "@/lib/identity/types";

const LINE_LENGTH = 36;

const MONTH_CODE: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

const TIER_LETTER: Record<BuilderIdentity["tier"], string> = {
  noise: "N",
  signal: "S",
  alpha: "A",
};

/** Uppercases and replaces anything outside A-Z0-9 with the MRZ filler
 * character, the same way a real machine-readable zone drops diacritics
 * and punctuation. */
function sanitize(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, "<");
}

function padLine(text: string): string {
  return text.length >= LINE_LENGTH ? text.slice(0, LINE_LENGTH) : text.padEnd(LINE_LENGTH, "<");
}

/** Turns `"28 Oct 2026"` into `"261028"` (YYMMDD) — the compact date code
 * used in place of the date on the MRZ's second line. */
function dateCode(label: string): string {
  const [day, monthName, year] = label.split(" ");
  const month = MONTH_CODE[monthName] ?? "00";
  return `${year.slice(2)}${month}${day.padStart(2, "0")}`;
}

/**
 * Builds two lines in the visual grammar of an ICAO 9303 machine-readable
 * zone — genuinely decodable by inspection (name, stack, serial, checksum,
 * date, tier, zone are all really in there), not random filler characters
 * pretending to be data.
 */
export function buildMrzLines(identity: BuilderIdentity): [string, string] {
  const name = sanitize(identity.name);
  const stack = sanitize(identity.stack || "BUILDER");
  const line1 = padLine(`P<HHG<${name}<<${stack}`);

  const serialDigits = identity.serial.split("-")[1] ?? "0000";
  const line2 = padLine(
    `${serialDigits}${identity.checksum}HHG${dateCode(identity.arrivalDate)}${TIER_LETTER[identity.tier]}${identity.accessZoneCode}<${identity.verificationId}`,
  );

  return [line1, line2];
}
