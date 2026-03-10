# Built with Claude Code

This document translation application was built using **Claude Code**, Anthropic's official CLI tool for Claude. It translates PDF and DOCX files into 20 supported languages while preserving document structure.

## What It Does

Upload a PDF or DOCX file, select a target language, and download the translated document in the same format. Translation is powered by the Anthropic Claude API (`claude-sonnet-4-6`).

## Setup

1. Install dependencies: `npm install`
2. Create `.env.local` with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```
3. Run dev server: `npm run dev`
4. Open `http://localhost:3000`

## Architecture

### Pipeline

Each translation request goes through three steps:

```
Upload → Extract → Translate → Generate → Download
  |          |          |           |
formidable  pdf-parse  Claude API  pdf-lib
            mammoth               docx
```

**API route**: `pages/api/translate.ts` — single POST endpoint that orchestrates the full pipeline.

### File Structure

```
pages/
  index.tsx               # Main UI
  api/translate.ts        # Translation API endpoint
components/
  UploadZone.tsx          # Drag-and-drop file upload
  LanguageSelector.tsx    # Target language dropdown
  ProgressIndicator.tsx   # Step-by-step progress display
  DownloadButton.tsx      # Download translated file
lib/
  types.ts                # Shared TypeScript interfaces
  constants.ts            # Supported languages, file size limits
  extraction/
    extractPdf.ts         # PDF → DocumentBlock[] (pdf-parse)
    extractDocx.ts        # DOCX → DocumentBlock[] (mammoth)
  translation/
    translateDocument.ts  # Calls Claude API
    buildPrompt.ts        # Constructs translation prompt
  generation/
    generatePdf.ts        # DocumentBlock[] → PDF (pdf-lib + NotoSans fonts)
    generateDocx.ts       # DocumentBlock[] → DOCX (docx)
public/fonts/
  NotoSans-Regular.ttf    # Unicode font for PDF output
  NotoSans-Bold.ttf
```

### Core Types (`lib/types.ts`)

```typescript
type BlockType = 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list_item';

interface DocumentBlock {
  id: string;
  type: BlockType;
  text: string;
  metadata?: { listDepth?: number; listStyle?: 'bullet' | 'numbered' };
}

interface DocumentContent {
  blocks: DocumentBlock[];
  sourceFormat: 'pdf' | 'docx';
}

type TranslationStep = 'idle' | 'uploading' | 'extracting' | 'translating' | 'generating' | 'done' | 'error';
```

### Supported Languages (`lib/constants.ts`)

20 languages: Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Arabic, Hindi, Turkish, Polish, Swedish, Norwegian, Danish, Finnish, Greek.

### Constraints

- Max file size: **10 MB**
- Accepted formats: **PDF**, **DOCX**
- Output format matches input format
- Claude output capped at `max_tokens: 8096` — very long documents may be truncated

## Known Limitations & Future Work

- **Chunking**: Long documents can exceed Claude's output token limit; chunking would fix this
- **PDF structure detection**: Headings are inferred by heuristic (ALL CAPS); font-size metadata would be more accurate
- **Streaming**: The full pipeline runs synchronously; streaming would allow real per-step UI feedback
- **Error retry**: No retry UI — errors show a message but require a full re-upload

---

*Built with Claude Code*
