import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import type { DocumentContent, DocumentBlock } from '../types';

function blockToParagraph(block: DocumentBlock): Paragraph {
  switch (block.type) {
    case 'heading1':
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(block.text)],
      });
    case 'heading2':
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(block.text)],
      });
    case 'heading3':
      return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun(block.text)],
      });
    case 'list_item':
      return new Paragraph({
        bullet: { level: block.metadata?.listDepth ?? 0 },
        children: [new TextRun(block.text)],
      });
    default:
      return new Paragraph({
        children: [new TextRun(block.text)],
      });
  }
}

export async function generateDocx(content: DocumentContent): Promise<Buffer> {
  const paragraphs = content.blocks.map(blockToParagraph);

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
