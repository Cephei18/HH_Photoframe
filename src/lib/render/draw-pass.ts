import { ACCESS_ZONES, CHAIN_STAMPS, EVENT, type ChainStampId } from "@/lib/constants";
import { computeAutoCrop } from "@/lib/image/autocrop";
import { mulberry32 } from "@/lib/identity/hash";
import { getClearPhoto } from "./clear-photo-cache";
import { drawChainGlyph } from "./chain-glyph";
import { CANVAS_FONTS } from "./font-refs";
import { drawGuilloche } from "./guilloche";
import { PASS_LAYOUT } from "./layout";
import { BRAND_LOGOS, loadLogo } from "./logo-cache";
import { buildMrzLines } from "./mrz";
import { hexToRgb, PALETTE, TIER_COLOR } from "./palette";
import { createGrainPattern } from "./texture";
import { fillTextTracked } from "./text";
import type { RenderInput } from "./types";

const L = PASS_LAYOUT;

/**
 * Draws the complete Builder Visa into `ctx`'s logical 1600×1040 space —
 * modeled directly on a real US visa sticker: two-tone header with a seal
 * on the seam, a mounted ID photo, a labeled field grid over a faint
 * watermark drawing, a highlighted document-number callout, and an
 * MRZ/OCR strip along the bottom. Called identically by the live preview
 * and the export pipeline — see canvas.ts — which is what makes the two
 * pixel-identical by construction rather than by coincidence.
 */
export async function drawPass(ctx: CanvasRenderingContext2D, input: RenderInput): Promise<void> {
  const { identity, image } = input;
  const tierColor = TIER_COLOR[identity.tier];

  ctx.clearRect(0, 0, L.width, L.height);

  // Logos/watermark load in parallel with the (slower) photo decode —
  // loading them serially afterward would just add their fetch/decode
  // time on top for no reason.
  const [photo, hackerHouseLogo, goaMarkLogo, studioLogo, sceneArt] = await Promise.all([
    getClearPhoto(image.dataUrl),
    loadLogo(BRAND_LOGOS.hackerHouse),
    loadLogo(BRAND_LOGOS.goaMark),
    loadLogo(BRAND_LOGOS.studio),
    loadLogo(BRAND_LOGOS.goaScene),
  ]);
  const crop = computeAutoCrop(photo.width, photo.height, L.photo.width / L.photo.height, image.focal);

  // Everything below is clipped to the card's own rounded corners — a
  // laminated ID card's corners, not this brand's usual hard-edged UI
  // chrome (that rule is a website convention; the canvas pass has always
  // been its own deliberately-decoupled visual system — see palette.ts).
  ctx.save();
  roundedRectPath(ctx, 0, 0, L.width, L.height, L.cornerRadius);
  ctx.clip();

  ctx.fillStyle = PALETTE.visaBg;
  ctx.fillRect(0, 0, L.width, L.height);

  drawWatermark(ctx, sceneArt);
  drawHeader(
    ctx,
    hackerHouseLogo,
    goaMarkLogo,
    studioLogo,
    sealColorFor(identity.tier, tierColor),
    identity.sealVariation,
  );
  drawPhotoBox(ctx, photo.canvas, crop);
  drawVisaStamps(ctx, identity);
  drawFieldGrid(ctx, identity);
  drawAnnotation(ctx, identity);
  drawVisaNumberBox(ctx, identity);
  drawFooter(ctx, identity);
  drawGrain(ctx, identity.seed);

  ctx.restore();

  // The border is stroked outside the clip so the full line weight shows
  // — clipping first would shave its outer half off along every edge.
  roundedRectPath(ctx, 0, 0, L.width, L.height, L.cornerRadius);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The field grid's own background drawing — a real visa's Capitol-dome
 * watermark, played here by the actual Goa artwork supplied for this
 * card. Kept deliberately faint: this is security-paper texture, not an
 * illustration competing with the text drawn over it. */
function drawWatermark(ctx: CanvasRenderingContext2D, art: HTMLImageElement): void {
  const { x, y, width, height } = L.watermark;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  ctx.globalAlpha = 0.16;
  ctx.filter = "grayscale(0.6) sepia(0.35)";
  const scale = Math.max(width / art.naturalWidth, height / art.naturalHeight);
  const drawWidth = art.naturalWidth * scale;
  const drawHeight = art.naturalHeight * scale;
  ctx.drawImage(
    art,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  ctx.restore();
}

/** Alpha's tier color is bright gold, which fails line/text contrast on
 * the seal's cream backing below (same rule palette.ts documents for
 * text-on-cream generally, and the same bug already caught once on this
 * card's tier stamp before this redesign — verified again here by
 * actually rendering the Alpha tier: the seal nearly disappeared). This
 * darkened goldenrod is the exact substitution globals.css's own
 * light-mode `--alpha` token already makes for the identical reason —
 * reused here since the canvas renderer can't read that CSS variable. */
function sealColorFor(tier: RenderInput["identity"]["tier"], tierColor: string): string {
  return tier === "alpha" ? "#B8860B" : tierColor;
}

/** The two-tone header — a flamingo accent block carrying "HH VISA," a
 * jungle-green main block carrying the three official marks, and a
 * guilloché seal straddling the seam between them. Same composition as a
 * real US visa's blue "VISA" block + red country-name block + eagle. */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  hackerHouseLogo: HTMLImageElement,
  goaMarkLogo: HTMLImageElement,
  studioLogo: HTMLImageElement,
  sealColor: string,
  sealVariation: number,
): void {
  const { height, accentWidth } = L.header;

  ctx.fillStyle = PALETTE.stamp;
  ctx.fillRect(0, 0, accentWidth, height);
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(accentWidth, 0, L.width - accentWidth, height);

  ctx.save();
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `700 ${L.accentLabel.fontSize}px ${CANVAS_FONTS.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("HH VISA", L.accentLabel.x, L.accentLabel.y);
  ctx.restore();

  const { hackerHouseHeight, hackerHouseX, hackerHouseY, goaMarkHeight, studioHeight, inset } =
    L.masthead;
  const hhWidth = hackerHouseHeight * (hackerHouseLogo.naturalWidth / hackerHouseLogo.naturalHeight);
  ctx.drawImage(hackerHouseLogo, hackerHouseX, hackerHouseY, hhWidth, hackerHouseHeight);

  const goaWidth = goaMarkHeight * (goaMarkLogo.naturalWidth / goaMarkLogo.naturalHeight);
  ctx.drawImage(goaMarkLogo, L.width - inset - goaWidth, 14, goaWidth, goaMarkHeight);

  const studioWidth = studioHeight * (studioLogo.naturalWidth / studioLogo.naturalHeight);
  ctx.drawImage(
    studioLogo,
    L.width - inset - studioWidth,
    height - studioHeight - 14,
    studioWidth,
    studioHeight,
  );

  const { cx, cy, radius } = L.emblem;
  const [r, g, b] = hexToRgb(PALETTE.paperRaised);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fill();
  ctx.clip();
  drawGuilloche(ctx, cx, cy, radius - 4, sealVariation, sealColor, CANVAS_FONTS.display);
  ctx.restore();

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/** The mounted ID photo — plain and clear, the way an actual visa photo
 * has to be (see clear-photo-cache.ts), in a simple ink-framed box. */
function drawPhotoBox(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  crop: { x: number; y: number; width: number; height: number },
): void {
  const { x, y, width, height } = L.photo;
  ctx.drawImage(source, crop.x, crop.y, crop.width, crop.height, x, y, width, height);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
}

/** One ink stamp per chosen stack/chain flavor, filling PASS_LAYOUT's
 * fixed slots in pick order and spilling slightly past the photo's own
 * edge — a real re-entry stamp doesn't respect the photo's border either.
 * Rotation gets a small per-identity jitter (derived from the seed,
 * independent of the identity-generation stream) so the same stamp
 * choice doesn't look mechanically identical on every visa that picks it.
 *
 * Ink colors are fixed brand tones, deliberately NOT `tierColor` — the
 * "noise" tier color is a muted sage green that all but disappeared
 * against a duotone photo when tried in an earlier version of this card
 * (verified by actually rendering it), and every color here needs to
 * hold up regardless of what tier or photo it lands on. Each ring gets
 * its own label color too: three near-identical dark greens in a row
 * read as one washed-out color at this size (also verified by rendering
 * it), so gold gets a turn as a ring color here despite failing text
 * contrast on its own — paired with an ink-colored label instead. */
const VISA_STAMP_INKS: Array<{ ring: string; label: string }> = [
  { ring: PALETTE.stamp, label: PALETTE.stamp },
  { ring: PALETTE.teal, label: PALETTE.teal },
  { ring: PALETTE.gold, label: PALETTE.ink },
  { ring: PALETTE.inkDeep, label: PALETTE.inkDeep },
];

function drawVisaStamps(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const jitter = mulberry32(identity.seed ^ 0x2f6e2b1);
  identity.chainStamps.forEach((stampId, i) => {
    const slot = L.visaStampSlots[i];
    if (!slot) return;
    const rotation = slot.rotationDeg + (jitter() - 0.5) * 14;
    const theme = VISA_STAMP_INKS[i % VISA_STAMP_INKS.length];
    drawVisaStamp(ctx, slot.cx, slot.cy, slot.radius, rotation, theme, stampId);
  });
}

function drawVisaStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotationDeg: number,
  ink: { ring: string; label: string },
  glyphId: ChainStampId,
): void {
  const label = CHAIN_STAMPS.find((c) => c.id === glyphId)?.label ?? glyphId;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  // A paper-toned backing disc, mostly opaque — legible over whatever the
  // photo happens to show underneath. Kept just short of fully solid
  // (0.85, not 1) so it still reads as an ink wash on the page rather
  // than a sticker pasted over it.
  const [r, g, b] = hexToRgb(PALETTE.paperRaised);
  ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.92;
  ctx.strokeStyle = ink.ring;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius - 9, 0, Math.PI * 2);
  ctx.stroke();

  // Radial dial ticks between the two rings — the same customs-stamp
  // detail language as the header's guilloché seal, at a smaller scale.
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * (radius - 9), Math.sin(angle) * (radius - 9));
    ctx.lineTo(Math.cos(angle) * (radius - 3), Math.sin(angle) * (radius - 3));
    ctx.stroke();
  }

  drawChainGlyph(ctx, glyphId, 0, -radius * 0.2, radius * 0.34, ink.ring);

  ctx.fillStyle = ink.label;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(radius * 0.15)}px ${CANVAS_FONTS.mono}`;
  ctx.fillText(label.toUpperCase(), 0, radius * 0.46);

  ctx.restore();
}

type FieldRow = { label: string; value: string };

/** Splits a free-typed full name into given/surname the way a document
 * would — last word is the surname, everything before it is given
 * name(s). A single-word name (or an empty one, defaulted upstream to
 * "Builder") is used as both, rather than leaving one field blank. */
function splitName(name: string): { given: string; surname: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { given: parts[0] ?? "", surname: parts[0] ?? "" };
  return { given: parts.slice(0, -1).join(" "), surname: parts[parts.length - 1] };
}

/** Maps the identity onto the two field columns — every value here is a
 * real field from the identity model, reinterpreted into a visa's own
 * vocabulary (e.g. "Nationality" ← the archetype's tech-tribe category),
 * never invented filler. */
function buildFieldColumns(identity: RenderInput["identity"]): { colA: FieldRow[]; colB: FieldRow[] } {
  const { given, surname } = splitName(identity.name);
  const colA: FieldRow[] = [
    { label: "Issuing Post", value: identity.accessZoneName.toUpperCase() },
    { label: "Surname", value: surname.toUpperCase() },
    { label: "Given Name", value: given.toUpperCase() },
    { label: "Passport Number", value: identity.serial },
    { label: "Stack", value: (identity.stack || "Builder").toUpperCase() },
  ];
  const colB: FieldRow[] = [
    { label: "Control Number", value: identity.verificationId },
    { label: "Visa Type/Class", value: identity.tier.toUpperCase() },
    { label: "Nationality", value: identity.archetypeCategory.toUpperCase() },
    { label: "Issue Date", value: identity.arrivalDate.toUpperCase() },
    {
      label: "Expiration Date",
      value: ACCESS_ZONES[ACCESS_ZONES.length - 1].date.toUpperCase(),
    },
  ];
  return { colA, colB };
}

function drawFieldColumn(ctx: CanvasRenderingContext2D, x: number, rows: FieldRow[]): void {
  const { y0, rowHeight, labelSize, valueSize, colWidth } = L.fieldGrid;
  rows.forEach((row, i) => {
    const y = y0 + i * rowHeight;

    ctx.font = `600 ${labelSize}px ${CANVAS_FONTS.mono}`;
    ctx.fillStyle = PALETTE.inkFaint;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    fillTextTracked(ctx, row.label.toUpperCase(), x, y + labelSize, 1);

    // Clipped to the column's own width — a long stack string or archetype
    // name gets cut cleanly rather than overrunning into the next column.
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, colWidth, rowHeight);
    ctx.clip();
    ctx.font = `700 ${valueSize}px ${CANVAS_FONTS.mono}`;
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(row.value, x, y + labelSize + valueSize + 4);
    ctx.restore();
  });
}

function drawFieldGrid(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { colAX, colBX } = L.fieldGrid;
  const { colA, colB } = buildFieldColumns(identity);
  drawFieldColumn(ctx, colAX, colA);
  drawFieldColumn(ctx, colBX, colB);
}

/** The one free-text field — the archetype phrase plus the event motto,
 * in the same italic officialese used on the site's own hero headline. */
function drawAnnotation(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { x, y, width, height } = L.annotation;
  const { labelSize } = L.fieldGrid;

  ctx.font = `600 ${labelSize}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.inkFaint;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  fillTextTracked(ctx, "ANNOTATION", x, y + labelSize, 1);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.font = `italic 500 25px ${CANVAS_FONTS.official}`;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillText(`${identity.archetype.toUpperCase()} · ${EVENT.motto.toUpperCase()}`, x, y + height - 6);
  ctx.restore();
}

/** The one highlighted callout — a real visa's own red-boxed visa number,
 * done here in the brand's stamp pink. Derived from the serial's own
 * digits and checksum rather than a fourth unrelated random number. */
function drawVisaNumberBox(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { x, y, width, height } = L.visaNumberBox;

  ctx.save();
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = PALETTE.stamp;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 12px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.stamp;
  fillTextTracked(ctx, "VISA NUMBER", x + 14, y + 22, 1.5);

  const serialDigits = identity.serial.split("-")[1] ?? "0000";
  ctx.font = `700 27px ${CANVAS_FONTS.mono}`;
  fillTextTracked(ctx, `V${serialDigits}${identity.checksum}`, x + 14, y + 52, 2);
  ctx.restore();
}

/** A chevron security-pattern row above the real MRZ/OCR lines — the same
 * two visual layers a real US visa's bottom strip carries: a repeating
 * `<` guilloché-style tiling, then the genuinely-decodable OCR text. */
function drawFooter(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { height, chevronY, mrzLine1Y, mrzLine2Y } = L.footer;
  const y = L.footer.y;

  ctx.fillStyle = PALETTE.visaBgDeep;
  ctx.fillRect(0, y, L.width, height);
  ctx.strokeStyle = PALETTE.visaLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(L.width, y);
  ctx.stroke();

  ctx.font = `700 15px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.visaLine;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const unit = "<<<< ";
  const unitWidth = ctx.measureText(unit).width;
  const rowWidth = L.width - L.margin * 2;
  ctx.fillText(unit.repeat(Math.ceil(rowWidth / unitWidth) + 1), L.margin, chevronY);

  const [line1, line2] = buildMrzLines(identity);
  ctx.font = `600 24px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.ink;
  fillTextTracked(ctx, line1, L.margin, mrzLine1Y, 3);
  fillTextTracked(ctx, line2, L.margin, mrzLine2Y, 3);
}

function drawGrain(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = createGrainPattern(ctx, seed);
  ctx.fillRect(0, 0, L.width, L.height);
  ctx.restore();
}
