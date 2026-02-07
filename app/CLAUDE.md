# Circle Calendar - Next.js Web App

## Running

```bash
cd app
npm install
npm run dev
```

**Dev server**: http://localhost:3000

## Building

```bash
npm run build
npm start
```

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start development server |
| `npm run build` | `next build` | Build for production |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `next lint` | Run ESLint |
| `npm run typecheck` | `tsc --noEmit` | TypeScript type checking |

## Architecture

### Directory Layout

```
app/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with fonts
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Design system (ported from web/)
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts     # PDF generation endpoint
│   ├── components/              # React components
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── CalendarPreview.tsx  # Interactive animation
│   │   ├── ProblemSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Benefits.tsx
│   │   ├── Testimonials.tsx
│   │   ├── PackageSection.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTA.tsx              # Download button wired to API
│   │   ├── Footer.tsx
│   │   ├── icons.tsx
│   │   └── index.ts             # Barrel export
│   └── hooks/
│       └── useScrollAnimation.ts
├── public/
│   └── favicon.svg
├── next.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

### Key Design Decisions

1. **Shared library via path aliases**: Uses `@calendar-lib/*` and `@calendar-renderers/*` to import from `../node/src/lib/*` and `../node/src/renderers/*`

2. **Server-side PDF generation**: The `/api/generate` route uses the serverless pipeline from the node library to generate PDFs in-memory

3. **CSS variables for theming**: All colors, spacing, and typography defined as CSS custom properties in `globals.css`

4. **Client components for interactivity**: Components that need browser APIs (scroll animations, FAQ accordion, calendar animation) use `'use client'` directive

## API Endpoint

### POST /api/generate

Generates a calendar PDF.

**Request body** (optional):
```json
{
  "gregorianDate": "2026-02-05",
  // OR
  "hijriDate": {
    "hijriYear": 1447,
    "hijriMonth": 8,
    "hijriDay": 17
  }
}
```

**Response**: PDF file (`application/pdf`)

## Deployment

Configured for Vercel deployment via `vercel.json`:
- API function has 1024MB memory and 60s timeout
- Uses `experimental.externalDir` to import from parent node library

## Dependencies

Uses the same core dependencies as the node library:
- `@resvg/resvg-js` - SVG → PNG rendering
- `pdf-lib` - PDF generation
- `qrcode` - QR code for instructions page
