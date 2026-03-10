import { PDFParse } from 'pdf-parse';
import type { DocumentContent, DocumentBlock, BlockType } from '../types';

function classifyLine(line: string): BlockType {
  const trimmed = line.trim();

  // Bullet list item
  if (/^[-•*]\s+/.test(trimmed)) return 'list_item';

  // Numbered list item
  if (/^\d+\.\s+/.test(trimmed)) return 'list_item';

  // ALL CAPS short line → heading1
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 0 && trimmed.length < 80 && /[A-Z]/.test(trimmed)) {
    return 'heading1';
  }

  return 'paragraph';
}

function stripListPrefix(text: string, type: BlockType): string {
  if (type !== 'list_item') return text;
  return text.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
}

export async function extractPdf(buffer: Buffer): Promise<DocumentContent> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const rawText: string = result.text;
  await parser.destroy();

  // Split into chunks on double newlines (paragraph breaks)
  const chunks = rawText.split(/\n{2,}/);

  const blocks: DocumentBlock[] = [];
  let idCounter = 1;

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Sub-split on single newlines — each non-empty line becomes a block
    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      const type = classifyLine(line);
      const text = stripListPrefix(line, type);

      if (!text) continue;

      const block: DocumentBlock = {
        id: `b${idCounter++}`,
        type,
        text,
      };

      if (type === 'list_item') {
        block.metadata = { listStyle: /^\d+\./.test(line.trim()) ? 'numbered' : 'bullet' };
      }

      blocks.push(block);
    }
  }

  return { blocks, sourceFormat: 'pdf' };
}
