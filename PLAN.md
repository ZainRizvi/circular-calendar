# Migration Plan: Python to Next.js Calendar Generator

## Overview
This document outlines the plan to migrate the existing Python-based calendar generator to a Next.js web application hosted on Vercel.

## High-Level Plan

1. **Repository Restructuring**
   - Create new directory structure
   - Move existing Python code to archive
   - Set up Next.js project structure

2. **Dependencies Analysis & Migration**
   - Identify core dependencies
   - Find Node.js equivalents
   - Set up package.json

3. **Core Logic Migration**
   - Implement core logic as node package
   - Convert Python SVG generation to JavaScript
   - Implement PDF generation in Node.js
   - Create API endpoints

4. **Frontend Development**
   - Create Next.js UI components
   - Implement form for calendar customization
   - Add preview functionality

5. **Deployment Setup**
   - Configure Vercel deployment
   - Set up environment variables
   - Add deployment documentation

## Detailed Implementation Steps

### Phase 1: Repository Restructuring

1. Create new directory structure:
```bash
mkdir python app
```

2. Move existing Python files to archive:
```bash
mv *.py *.ipynb *.scss python/
mv Dockerfile python/
mv requirements.txt python/
```

3. Initialize Next.js project:
```bash
cd app
npx create-next-app@latest . --typescript --tailwind --eslint
```

### Phase 2: Dependencies Analysis & Migration

1. Core dependencies to migrate:
   - `svgwrite` → Use `svg.js` or `@svgdotjs/svg.js`
   - PDF generation → Use `pdfkit` or `puppeteer`
   - ImageMagick/Inkscape → Use `sharp` for image processing

2. Create package.json with required dependencies:
```json
{
  "dependencies": {
    "@svgdotjs/svg.js": "^3.1.2",
    "pdfkit": "^0.14.0",
    "sharp": "^0.33.2",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
```

### Phase 3: Core Logic Migration

1. Create API route structure:
```
app/
  ├── api/
  │   └── generate/
  │       └── route.ts
  ├── lib/
  │   ├── calendar.ts
  │   ├── svg.ts
  │   └── pdf.ts
```

2. Convert Python SVG generation:
   - Port `arc_drawing.py` to TypeScript
   - Port `calendar_drawings.py` to TypeScript
   - Create SVG generation utilities

3. Implement PDF generation:
   - Create PDF generation service
   - Handle SVG to PDF conversion
   - Implement file download

### Phase 4: Frontend Development

1. Create main page components:
```
app/
  ├── components/
  │   ├── CalendarForm.tsx
  │   ├── CalendarPreview.tsx
  │   └── DownloadButton.tsx
  ├── page.tsx
```

2. Implement form for calendar customization:
   - Year selection
   - Color scheme selection
   - Layout options

3. Add preview functionality:
   - Live SVG preview
   - Responsive design
   - Loading states

### Phase 5: Deployment Setup

1. Configure Vercel:
   - Create `vercel.json`
   - Set up build configuration
   - Configure environment variables

2. Add deployment documentation:
   - Update README.md
   - Add setup instructions
   - Document API endpoints

3. Set up CI/CD:
   - Add GitHub Actions workflow
   - Configure automated testing
   - Set up deployment pipeline

## Additional Considerations

### Error Handling
- Implement proper error boundaries
- Add input validation
- Create error logging

### Performance Optimization
- Implement caching
- Optimize SVG generation
- Add loading states

### Testing
- Add unit tests for core logic
- Add integration tests
- Set up E2E testing

### Documentation
- Add JSDoc comments
- Create API documentation
- Add usage examples

## Timeline
Each phase should take approximately 1-2 weeks, with the entire migration expected to take 6-8 weeks depending on complexity and available resources.

## Success Criteria
1. All existing Python functionality is successfully ported to Next.js
2. The web application is successfully deployed on Vercel
3. The application performs at least as well as the Python version
4. All tests pass
5. Documentation is complete and up-to-date 