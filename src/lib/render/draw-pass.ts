import { CHAIN_STAMPS, EVENT, type ChainStampId } from "@/lib/constants";
import { computeAutoCrop } from "@/lib/image/autocrop";
import { mulberry32 } from "@/lib/identity/hash";
import { drawChainGlyph } from "./chain-glyph";
import { getDuotonePhoto } from "./duotone-cache";
import { CANVAS_FONTS } from "./font-refs";
import { drawGuilloche } from "./guilloche";
import { PASS_LAYOUT } from "./layout";
import { BRAND_LOGOS, loadLogo } from "./logo-cache";
import { buildMrzLines } from "./mrz";
import { hexToRgb, PALETTE, TIER_COLOR } from "./palette";
import { drawScallopWave, drawSunburst } from "./retro-motifs";
import { createGrainPattern, createHalftonePattern } from "./texture";
import { fillTextTracked, repeatToWidth } from "./text";
import type { RenderInput } from "./types";

const L = PASS_LAYOUT;

/** Draws the complete Builder Pass into `ctx`'s logical 1080×1512 space.
 * Called identically by the live preview and the export pipeline — see
 * canvas.ts — which is what makes the two pixel-identical by construction
 * rather than by coincidence. */
export async function drawPass(ctx: CanvasRenderingContext2D, input: RenderInput): Promise<void> {
  const { identity, image } = input;
  const tierColor = TIER_COLOR[identity.tier];

  ctx.clearRect(0, 0, L.width, L.height);
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.fillRect(0, 0, L.width, L.height);

  // Logos load in parallel with the (slower) photo processing — loading
  // them serially afterward would just add their fetch/decode time on top
  // for no reason.
  const [photo, hackerHouseLogo, goaMarkLogo] = await Promise.all([
    getDuotonePhoto(image.dataUrl),
    loadLogo(BRAND_LOGOS.hackerHouse),
    loadLogo(BRAND_LOGOS.goaMark),
  ]);
  const crop = computeAutoCrop(
    photo.width,
    photo.height,
    L.photo.width / L.photo.height,
    image.focal,
  );
  const duotoneSource = photo.canvas;

  drawPhoto(ctx, duotoneSource, crop);
  drawHalftoneOverlay(ctx, identity.seed);
  drawLatentWatermark(ctx);
  drawGhost(ctx, duotoneSource, crop);
  drawSealBacking(ctx);
  drawGuilloche(
    ctx,
    L.seal.cx,
    L.seal.cy,
    L.seal.radius,
    identity.sealVariation,
    tierColor,
    CANVAS_FONTS.display,
  );
  drawMasthead(ctx, hackerHouseLogo, goaMarkLogo);
  drawBoardingBadge(ctx);
  drawBarcode(ctx, identity);
  drawTierWord(ctx, identity.tier, tierColor);
  drawVisaStamps(ctx, identity);
  drawRegistrationTicks(ctx);
  drawEdgeMicroprint(ctx);
  drawWaveDivider(ctx);

  drawStrip(ctx, identity);
  drawMrz(ctx, identity);
  drawPerforation(ctx);
  drawMicroBand(ctx);

  drawStampSunburst(ctx);
  drawTierStamp(ctx, identity, tierColor);
  drawGrain(ctx, identity.seed);
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  crop: { x: number; y: number; width: number; height: number },
): void {
  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    L.photo.x,
    L.photo.y,
    L.photo.width,
    L.photo.height,
  );
}

function drawHalftoneOverlay(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(L.photo.x, L.photo.y, L.photo.width, L.photo.height);
  ctx.clip();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = createHalftonePattern(ctx, PALETTE.ink, seed);
  ctx.fillRect(L.photo.x, L.photo.y, L.photo.width, L.photo.height);
  ctx.restore();
}

function drawLatentWatermark(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(L.photo.x, L.photo.y, L.photo.width, L.photo.height);
  ctx.clip();

  ctx.font = `400 15px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = "rgba(250,244,228,0.09)";
  ctx.textAlign = "left";
  ctx.translate(L.photo.width / 2, L.photo.height / 2);
  ctx.rotate((-32 * Math.PI) / 180);

  // Rotating the fill grid means it needs to cover more than the photo's
  // own width/height to reach every corner post-rotation — sized off the
  // rect's diagonal (with margin) rather than its axis-aligned extent, so
  // there's no gap at the rotated corners.
  const label = `${EVENT.coordinatesLabel}   `;
  const lineWidth = ctx.measureText(label).width;
  const halfDiagonal = Math.hypot(L.photo.width, L.photo.height) / 2;
  const cols = Math.ceil(halfDiagonal / lineWidth) + 2;
  const rowSpacing = 42;
  const rows = Math.ceil(halfDiagonal / rowSpacing) + 2;
  for (let row = -rows; row < rows; row++) {
    for (let col = -cols; col < cols; col++) {
      ctx.fillText(label, col * lineWidth, row * rowSpacing);
    }
  }
  ctx.restore();
}

/** A translucent cream disc behind the guilloché seal — without it, fine
 * tier-colored engraving lines drawn directly over a similarly-toned
 * duotone photo (verified by actually rendering this: the "noise" tier's
 * sage-green lines all but vanished into the photo's own green shadows)
 * are nearly invisible regardless of what tier color ends up drawn there. */
function drawSealBacking(ctx: CanvasRenderingContext2D): void {
  const { cx, cy, radius } = L.seal;
  const [r, g, b] = hexToRgb(PALETTE.paperRaised);
  ctx.save();
  ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  crop: { x: number; y: number; width: number; height: number },
): void {
  const { size, cx, cy, opacity } = L.ghost;
  // The main crop's aspect ratio isn't square — take a centered square
  // sub-crop of it so the ghost doesn't stretch relative to the photo above it.
  const squareSide = Math.min(crop.width, crop.height);
  const squareX = crop.x + (crop.width - squareSide) / 2;
  const squareY = crop.y + (crop.height - squareSide) / 2;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.filter = "grayscale(1)";
  ctx.drawImage(
    source,
    squareX,
    squareY,
    squareSide,
    squareSide,
    cx - size / 2,
    cy - size / 2,
    size,
    size,
  );
  ctx.restore();
}

/** The two official marks, drawn as the real logo assets (public/brand/,
 * copied verbatim from reference/) rather than a typeset reconstruction —
 * every previous version of this function approximated them with canvas
 * text. Each is drawn at its own natural aspect ratio, only height fixed. */
function drawMasthead(
  ctx: CanvasRenderingContext2D,
  hackerHouseLogo: HTMLImageElement,
  goaMarkLogo: HTMLImageElement,
): void {
  const { insetTop, insetX, hackerHouseHeight, goaMarkHeight, captionSize } = L.masthead;
  ctx.save();

  const hhWidth =
    hackerHouseHeight * (hackerHouseLogo.naturalWidth / hackerHouseLogo.naturalHeight);
  ctx.drawImage(hackerHouseLogo, insetX, insetTop, hhWidth, hackerHouseHeight);

  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `500 ${captionSize}px ${CANVAS_FONTS.mono}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  fillTextTracked(
    ctx,
    `${EVENT.name.toUpperCase()} · ${EVENT.year}`,
    insetX,
    insetTop + hackerHouseHeight + 8,
    2,
  );

  const markWidth = goaMarkHeight * (goaMarkLogo.naturalWidth / goaMarkLogo.naturalHeight);
  ctx.drawImage(goaMarkLogo, L.width - insetX - markWidth, insetTop - 6, markWidth, goaMarkHeight);

  ctx.restore();
}

/** A small rotated "Boarding Pass" mark under the Goa mark — the one
 * place the card says outright what kind of document it is. */
function drawBoardingBadge(ctx: CanvasRenderingContext2D): void {
  const { x, y, fontSize, rotationDeg } = L.boardingBadge;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = PALETTE.stamp;
  ctx.font = `italic 400 ${fontSize}px ${CANVAS_FONTS.official}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Boarding Pass", 0, 0);
  ctx.restore();
}

/** One ink stamp per chosen stack/chain flavor, filling PASS_LAYOUT's
 * fixed slots in pick order — a real passport page carries more than one
 * stamp, so the pass does too. Rotation gets a small per-identity jitter
 * (derived from the seed, independent of the identity-generation stream)
 * so the same stamp choice doesn't look mechanically identical on every
 * pass that picks it.
 *
 * Ink colors are fixed brand tones, deliberately NOT `tierColor` — the
 * "noise" tier color is a muted sage green that all but disappeared
 * against this same green duotone photo when tried (verified by actually
 * rendering it), and every color here needs to hold up against a photo
 * background whose content is unknown ahead of time. Each ring gets its
 * own label color too: three near-identical dark greens in a row read as
 * one washed-out color at this size (also verified by rendering it), so
 * gold gets a turn as a ring color here despite failing text contrast on
 * its own — paired with an ink-colored label instead of a gold one. */
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
  // detail language as the guilloché seal, at a smaller scale.
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

/** A paper-dart silhouette — the tier stamp's center glyph now that the
 * chosen stack/chain flavors have their own stamps (see drawVisaStamps).
 * This one is about departure, not personalization. */
function drawDepartureGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-38 * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -scale);
  ctx.lineTo(scale * 0.78, scale * 0.85);
  ctx.lineTo(0, scale * 0.4);
  ctx.lineTo(-scale * 0.78, scale * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTierWord(ctx: CanvasRenderingContext2D, tier: string, tierColor: string): void {
  const { insetTop, insetX, size } = L.tierWord;
  const label = tier.toUpperCase();
  ctx.save();
  ctx.font = `700 ${size}px ${CANVAS_FONTS.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // A dark offset shadow behind the yellow-cream word — the same poster
  // treatment as the real "HACKER HOUSE" wordmark (reference/Hacker house.png).
  ctx.fillStyle = PALETTE.inkDeep;
  ctx.fillText(label, insetX + size * 0.035, insetTop + size * 0.045);

  ctx.fillStyle = PALETTE.paperRaised;
  ctx.fillText(label, insetX, insetTop);

  // A thin accent rule under the word, in the tier color — the one place
  // the tier color appears at full strength outside the stamp/seal.
  const width = ctx.measureText(label).width;
  ctx.fillStyle = tierColor;
  ctx.fillRect(insetX, insetTop + size * 0.92, width, 6);
  ctx.restore();
}

function drawRegistrationTicks(ctx: CanvasRenderingContext2D): void {
  const { inset, arm } = L.registrationTick;
  const corners: Array<[number, number, number, number]> = [
    [inset, inset, 1, 1],
    [L.photo.width - inset, inset, -1, 1],
    [inset, L.photo.height - inset, 1, -1],
    [L.photo.width - inset, L.photo.height - inset, -1, -1],
  ];
  ctx.save();
  ctx.strokeStyle = "rgba(250,244,228,0.55)";
  ctx.lineWidth = 1.4;
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + arm * dx, y);
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + arm * dy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEdgeMicroprint(ctx: CanvasRenderingContext2D): void {
  const { inset, fontSize } = L.edgeMicroprint;
  const label = `${EVENT.motto.toUpperCase()} `;
  ctx.save();
  ctx.font = `500 ${fontSize}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = "rgba(250,244,228,0.4)";
  ctx.textBaseline = "middle";

  ctx.translate(inset, L.photo.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(repeatToWidth(ctx, label, L.photo.height * 0.9), -L.photo.height * 0.45, 0);
  ctx.restore();

  ctx.save();
  ctx.font = `500 ${fontSize}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = "rgba(250,244,228,0.4)";
  ctx.textBaseline = "middle";
  ctx.translate(L.photo.width - inset, L.photo.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(repeatToWidth(ctx, label, L.photo.height * 0.9), -L.photo.height * 0.45, 0);
  ctx.restore();
}

/** A cream scalloped wave lapping at the very bottom edge of the photo —
 * the site's own wave line art, standing in for a plain hairline. */
function drawWaveDivider(ctx: CanvasRenderingContext2D): void {
  drawScallopWave(ctx, 0, L.photo.height - 13, L.width, 13, PALETTE.paperRaised);
}

function drawStrip(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { x, y, width, height } = L.strip;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(x, y, width, height);

  ctx.font = `500 26px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(
    `${identity.name.toUpperCase()} · ${identity.archetype.toUpperCase()}`,
    L.margin,
    y + height / 2,
  );

  ctx.textAlign = "right";
  ctx.fillText(
    `№${identity.serial.split("-")[1]} / RANK ${String(identity.signalRank).padStart(3, "0")}`,
    L.width - L.margin,
    y + height / 2,
  );
}

function drawMrz(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { x, y, width, height } = L.mrz;
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(x, y, width, height);

  const [line1, line2] = buildMrzLines(identity);
  ctx.font = `400 22px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = "rgba(250,244,228,0.65)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fillTextTracked(ctx, line1, L.margin, y + height * 0.36, 3);
  fillTextTracked(ctx, line2, L.margin, y + height * 0.72, 3);
}

/** A faux Code128-style barcode stamped on the photo itself, under the
 * Boarding Pass badge — bar widths/gaps are derived from the
 * verification ID and serial digits (deterministic, not decodable), the
 * same "genuinely built from real fields" spirit as the MRZ text below.
 * Carries its own opaque backing card since, unlike the MRZ band, it
 * sits directly on unpredictable photo content. */
function drawBarcode(ctx: CanvasRenderingContext2D, identity: RenderInput["identity"]): void {
  const { x, y, width, height } = L.barcode;
  const padding = 10;

  ctx.save();
  const [r, g, b] = hexToRgb(PALETTE.paperRaised);
  ctx.fillStyle = `rgba(${r},${g},${b},0.92)`;
  ctx.fillRect(x - padding, y - padding, width + padding * 2, height + padding * 2);

  const barsHeight = height * 0.6;
  const source = `${identity.verificationId}${identity.serial.replace(/\D/g, "")}`;
  ctx.fillStyle = PALETTE.ink;
  let cursor = x;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    const barWidth = 1.5 + (code % 5);
    const gap = 1.5 + ((code >> 3) % 4);
    if (cursor + barWidth > x + width) break;
    ctx.fillRect(cursor, y, barWidth, barsHeight);
    cursor += barWidth + gap;
  }

  ctx.font = `500 11px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.inkFaint;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(identity.verificationId, x, y + height - 4);
  ctx.restore();
}

function drawPerforation(ctx: CanvasRenderingContext2D): void {
  const y = L.perforation.y;
  ctx.save();
  ctx.strokeStyle = PALETTE.lineStrong;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(L.width, y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = PALETTE.paperRaised;
  for (const x of [0, L.width]) {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMicroBand(ctx: CanvasRenderingContext2D): void {
  const { x, y, width, height } = L.micro;
  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = PALETTE.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(L.width, y);
  ctx.stroke();

  ctx.font = `500 9px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.inkFaint;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const label = `${EVENT.motto.toUpperCase()} `;
  ctx.fillText(repeatToWidth(ctx, label, width), L.margin * -0.3, y + height / 2);
}

function drawStampSunburst(ctx: CanvasRenderingContext2D): void {
  const { cx, cy, radius } = L.stamp;
  drawSunburst(ctx, cx, cy, radius * 0.78, radius * 1.55, 20, PALETTE.gold);
}

function drawTierStamp(
  ctx: CanvasRenderingContext2D,
  identity: RenderInput["identity"],
  tierColor: string,
): void {
  const { cx, cy, radius } = L.stamp;
  const [r, g, b] = hexToRgb(PALETTE.paperRaised);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((identity.stampRotationDeg * Math.PI) / 180);

  // Fully opaque backing disc — verified by actually rendering this: at
  // the previous 0.85 alpha, the strip band's own text underneath (which
  // this stamp's larger radius now overlaps) bled through and garbled
  // together with the stamp's own text. A "translucent ink" look isn't
  // worth trading away legibility for.
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Holographic foil strip, clipped to the disc, near the bottom edge —
  // below every text line, the one gap verified (by actually rendering
  // this) to be clear of everything else in the stamp.
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();
  const holoGradient = ctx.createLinearGradient(-radius, 0, radius, 0);
  holoGradient.addColorStop(0, PALETTE.gold);
  holoGradient.addColorStop(0.5, PALETTE.teal);
  holoGradient.addColorStop(1, PALETTE.stamp);
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = holoGradient;
  ctx.fillRect(-radius, radius * 0.64, radius * 2, radius * 0.07);
  ctx.restore();

  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Three content lines, generously spaced (verified by actually
  // rendering this — the first attempt crammed tier/glyph/label/coords
  // into overlapping text; this is deliberately sparser).
  ctx.fillStyle = tierColor;
  ctx.textAlign = "center";
  ctx.font = `700 ${Math.round(radius * 0.26)}px ${CANVAS_FONTS.display}`;
  ctx.textBaseline = "middle";
  ctx.fillText(identity.tier.toUpperCase(), 0, -radius * 0.44);

  drawDepartureGlyph(ctx, 0, 0, radius * 0.22, tierColor);
  // Deliberately PALETTE.ink, not tierColor — the Alpha tier's color is
  // gold, which fails text contrast on this same cream backing disc (see
  // palette.ts), and this line is exactly the small-text case that rule
  // warns about (verified by actually rendering the Alpha tier: "GATE B
  // · 09:02 IST" in gold was nearly unreadable). The big tier word above
  // keeps the pre-existing tierColor treatment — out of scope here.
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `500 ${Math.round(radius * 0.095)}px ${CANVAS_FONTS.mono}`;
  ctx.fillText(`GATE ${identity.accessZoneCode} · ${identity.arrivalTime}`, 0, radius * 0.34);

  ctx.font = `500 ${Math.round(radius * 0.07)}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.fillText(`15.30°N 74.12°E · ${identity.terminal}`, 0, radius * 0.49);

  ctx.restore();
}

function drawGrain(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = createGrainPattern(ctx, seed);
  ctx.fillRect(0, 0, L.width, L.height);
  ctx.restore();
}
