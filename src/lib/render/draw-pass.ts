import { EVENT } from "@/lib/constants";
import { computeAutoCrop } from "@/lib/image/autocrop";
import { getDuotonePhoto } from "./duotone-cache";
import { CANVAS_FONTS } from "./font-refs";
import { drawGuilloche } from "./guilloche";
import { PASS_LAYOUT } from "./layout";
import { buildMrzLines } from "./mrz";
import { hexToRgb, PALETTE, TIER_COLOR } from "./palette";
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

  const photo = await getDuotonePhoto(image.dataUrl);
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
  drawGuilloche(
    ctx,
    L.seal.cx,
    L.seal.cy,
    L.seal.radius,
    identity.sealVariation,
    tierColor,
    CANVAS_FONTS.display,
  );
  drawMasthead(ctx);
  drawTierWord(ctx, identity.tier, tierColor);
  drawRegistrationTicks(ctx);
  drawEdgeMicroprint(ctx);

  drawStrip(ctx, identity);
  drawMrz(ctx, identity);
  drawPerforation(ctx);
  drawMicroBand(ctx);

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
  ctx.fillStyle = "rgba(245,240,226,0.09)";
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

function drawMasthead(ctx: CanvasRenderingContext2D): void {
  const { insetTop, insetX, nameSize, markSize } = L.masthead;
  ctx.save();
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `500 ${nameSize}px ${CANVAS_FONTS.mono}`;
  ctx.textBaseline = "top";
  fillTextTracked(ctx, `${EVENT.name.toUpperCase()} · ${EVENT.year}`, insetX, insetTop, 2);

  ctx.font = `italic 400 ${markSize}px ${CANVAS_FONTS.body}`;
  ctx.textAlign = "right";
  ctx.fillText(EVENT.devanagariMark, L.width - insetX, insetTop - 4);
  ctx.restore();
}

function drawTierWord(ctx: CanvasRenderingContext2D, tier: string, tierColor: string): void {
  const { insetTop, insetX, size } = L.tierWord;
  ctx.save();
  ctx.fillStyle = PALETTE.paperRaised;
  ctx.font = `700 ${size}px ${CANVAS_FONTS.display}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(tier.toUpperCase(), insetX, insetTop);

  // A thin accent rule under the word, in the tier color — the one place
  // the tier color appears at full strength outside the stamp/seal.
  const width = ctx.measureText(tier.toUpperCase()).width;
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
  ctx.strokeStyle = "rgba(245,240,226,0.55)";
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
  ctx.fillStyle = "rgba(245,240,226,0.4)";
  ctx.textBaseline = "middle";

  ctx.translate(inset, L.photo.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(repeatToWidth(ctx, label, L.photo.height * 0.9), -L.photo.height * 0.45, 0);
  ctx.restore();

  ctx.save();
  ctx.font = `500 ${fontSize}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = "rgba(245,240,226,0.4)";
  ctx.textBaseline = "middle";
  ctx.translate(L.photo.width - inset, L.photo.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(repeatToWidth(ctx, label, L.photo.height * 0.9), -L.photo.height * 0.45, 0);
  ctx.restore();
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
  ctx.fillStyle = "rgba(245,240,226,0.65)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fillTextTracked(ctx, line1, L.margin, y + height * 0.36, 3);
  fillTextTracked(ctx, line2, L.margin, y + height * 0.72, 3);
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

  // Opaque-ish backing disc FIRST — the holo strip and text draw on top of
  // it, not the other way round, so the foil actually shows instead of
  // being muted underneath a translucent fill painted after it.
  ctx.fillStyle = `rgba(${r},${g},${b},0.78)`;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Holographic foil strip, clipped to the disc, in the gap between the
  // tier word and the coordinates/terminal lines below it — the one
  // moment of shimmer, and it never collides with text.
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
  ctx.fillRect(-radius, radius * 0.13, radius * 2, radius * 0.1);
  ctx.restore();

  ctx.strokeStyle = tierColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = tierColor;
  ctx.textAlign = "center";
  ctx.font = `700 ${Math.round(radius * 0.34)}px ${CANVAS_FONTS.display}`;
  ctx.textBaseline = "middle";
  ctx.fillText(identity.tier.toUpperCase(), 0, -radius * 0.08);

  ctx.font = `500 ${Math.round(radius * 0.09)}px ${CANVAS_FONTS.mono}`;
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.fillText(EVENT.coordinatesLabel, 0, radius * 0.28);
  ctx.fillText(`TERMINAL ${identity.terminal}`, 0, radius * 0.44);

  ctx.restore();
}

function drawGrain(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = createGrainPattern(ctx, seed);
  ctx.fillRect(0, 0, L.width, L.height);
  ctx.restore();
}
