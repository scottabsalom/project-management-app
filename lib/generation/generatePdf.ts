import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import type { DocumentContent, DocumentBlock } from '../types';

const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf');
const FONT_BOLD_PATH = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Bold.ttf');

const PAGE_MARGIN = 50;
const LINE_HEIGHT_RATIO = 1.4;

interface FontSizeConfig {
  size: number;
  spaceBefore: number;
  spaceAfter: number;
  indent: number;
}

const BLOCK_STYLES: Record<string, FontSizeConfig> = {
  heading1: { size: 20, spaceBefore: 16, spaceAfter: 8, indent: 0 },
  heading2: { size: 16, spaceBefore: 14, spaceAfter: 6, indent: 0 },
  heading3: { size: 13, spaceBefore: 10, spaceAfter: 4, indent: 0 },
  paragraph: { size: 11, spaceBefore: 4, spaceAfter: 4, indent: 0 },
  list_item: { size: 11, spaceBefore: 2, spaceAfter: 2, indent: 16 },
};

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

export async function generatePdf(content: DocumentContent): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Load fonts — fall back to Helvetica if NotoSans is not available
  let regularFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>;
  let boldFont: Awaited<ReturnType<typeof pdfDoc.embedFont>>;

  try {
    const regularFontBytes = fs.readFileSync(FONT_PATH);
    regularFont = await pdfDoc.embedFont(regularFontBytes);
  } catch {
    regularFont = await pdfDoc.embedFont('Helvetica');
  }

  try {
    const boldFontBytes = fs.readFileSync(FONT_BOLD_PATH);
    boldFont = await pdfDoc.embedFont(boldFontBytes);
  } catch {
    boldFont = await pdfDoc.embedFont('Helvetica-Bold');
  }

  const [pageWidth, pageHeight] = PageSizes.A4;
  const contentWidth = pageWidth - PAGE_MARGIN * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - PAGE_MARGIN;

  function ensureSpace(needed: number) {
    if (y - needed < PAGE_MARGIN) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - PAGE_MARGIN;
    }
  }

  for (const block of content.blocks) {
    const style = BLOCK_STYLES[block.type] ?? BLOCK_STYLES.paragraph;
    const isHeading = block.type.startsWith('heading');
    const font = isHeading ? boldFont : regularFont;
    const lineHeight = style.size * LINE_HEIGHT_RATIO;

    let displayText = block.text;
    if (block.type === 'list_item') {
      const prefix = block.metadata?.listStyle === 'numbered' ? '1. ' : '• ';
      displayText = prefix + block.text;
    }

    const availWidth = contentWidth - style.indent;
    const lines = wrapText(displayText, font, style.size, availWidth);
    const blockHeight = style.spaceBefore + lines.length * lineHeight + style.spaceAfter;

    ensureSpace(blockHeight);

    y -= style.spaceBefore;

    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: PAGE_MARGIN + style.indent,
        y: y - style.size,
        size: style.size,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    y -= style.spaceAfter;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
