# The Signal Pass

A builder credential generator for **Hacker House Goa 2026**. Upload a photo, add your name and stack, and get back a stamped, visa-style pass card — complete with a tier (Noise / Signal / Alpha), a deterministic archetype, an MRZ strip, chain stamps, and a duotone portrait — ready to download or share.

## How it works

1. **Upload** — drop or select a photo (HEIC is converted client-side); it's auto-cropped and compressed.
2. **Details** — enter a name, stack, up to four chain/stack stamps, and a domain.
3. **Generate** — a single seed (`name + stack + photo`) deterministically derives your tier, signal rank, archetype, and serial number, then the card is rendered to canvas.
4. **Download / Share** — export a retina PNG or share it directly via the Web Share API / X intent.

Everything about the event, tiers, access zones, and share copy lives in one place: [src/lib/constants.ts](src/lib/constants.ts).

## Tech stack

- [Next.js 16](node_modules/next/dist/docs) (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Canvas-based rendering for the pass artwork (no server-side image generation)
- Vitest for unit tests
- ESLint + Prettier

> **Note:** this repo pins a Next.js version with breaking changes from the version most tooling/training data expects. Before touching Next.js APIs, read the docs bundled at `node_modules/next/dist/docs/`.

## Getting started

Requires Node.js >= 20.18.0.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | Description                        |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start the dev server                |
| `npm run build`         | Production build                    |
| `npm run start`         | Run the production build            |
| `npm run lint`          | Lint with ESLint                    |
| `npm run format`        | Format with Prettier                |
| `npm run format:check`  | Check formatting without writing    |
| `npm run typecheck`     | Type-check with `tsc --noEmit`      |
| `npm test`              | Run unit tests with Vitest          |

## Project structure

```
src/
  app/                  # Next.js App Router entry (page, layout, OG image)
  components/
    pass/               # Pass canvas, identity form, generation stage, download/share bar
    upload/             # Photo upload dropzone, preview, stage
    ui/                 # Shared UI primitives (button, input, label)
  hooks/                # Upload, canvas render, export, and share hooks
  lib/
    identity/           # Deterministic identity generation (tier, archetype, serial, checksum)
    image/              # Decode, HEIC conversion, autocrop, face detection, compression
    render/              # Canvas drawing: layout, duotone, MRZ, palette, textures, export
    constants.ts        # Single source of truth for event/brand data
    share.ts            # Share text + Web Share / X intent helpers
```

## Testing

Unit tests live alongside their source files (`*.test.ts`) and cover the identity generation, autocrop, MRZ formatting, palette, and share logic:

```bash
npm test
```
