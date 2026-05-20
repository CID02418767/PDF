# Personal Tool Hub

This project is a personal web app hub containing small browser-based tools for study, productivity, and everyday use. The PDF tools run fully inside the browser, so no backend server is required.

## Current Features

- Personal tool dashboard for vibe-coding mini apps
- Merge PDF files in the browser
- Reorder and remove PDF files before merging
- Split/extract PDF pages in the browser using ranges like \(1\), \(1-3\), \(1,3,5\), or \(1-3,6,8-10\)
- Local browser-based processing
- No file upload to any server
- Placeholder sections for text, image, study, physics, and future tools

## Privacy

PDF files are processed locally in your browser and are not uploaded to any server.

## Tech Stack

- Vite
- React
- pdf-lib
- HTML/CSS/JavaScript

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages Deployment

This project is configured for GitHub Pages under the repository name `PDF`:

```js
export default defineConfig({
  base: "/PDF/",
  plugins: [react()],
});
```

To deploy:

1. Push the project to `CID02418767/PDF`.
2. In GitHub, open **Settings -> Pages**.
3. Choose GitHub Actions or deploy the `dist/` output with a Pages workflow.

## Archived Backend

The old FastAPI backend has been moved to `archive-backend/`. It is kept only as reference and is no longer required.

## Limitations

- Very large PDFs may be slow.
- Browser memory may limit processing.
- Advanced PDF editing, OCR, compression, and encryption may require more complex frontend logic or a local desktop app.
- Some unusual PDF files may not behave perfectly depending on browser and library support.

## Future Plans

- Text tools
- Image tools
- Study tools
- Physics calculators
- More PDF tools
- Personal utilities for friends and small shared workflows
