import mammoth from 'mammoth';
import type { DocumentContent, DocumentBlock, BlockType } from '../types';

interface ParsedBlock {
  tag: string;
  text: string;
}

function parseHtml(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  // Match opening tags with their content
  const tagPattern = /<(h[1-3]|p|li)(?:[^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    // Strip any inner HTML tags (bold, italic, links, etc.) — keep plain text
    const text = match[2].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
    if (text) {
      blocks.push({ tag, text });
    }
  }

  return blocks;
}

function tagToBlockType(tag: string): BlockType {
  switch (tag) {
    case 'h1': return 'heading1';
    case 'h2': return 'heading2';
    case 'h3': return 'heading3';
    case 'li': return 'list_item';
    default: return 'paragraph';
  }
}

export async function extractDocx(buffer: Buffer): Promise<DocumentContent> {
  const result = await mammoth.convertToHtml({ buffer });
  const html: string = result.value;

  const parsedBlocks = parseHtml(html);

  const blocks: DocumentBlock[] = parsedBlocks.map((pb, index) => {
    const type = tagToBlockType(pb.tag);
    const block: DocumentBlock = {
      id: `b${index + 1}`,
      type,
      text: pb.text,
    };

    if (type === 'list_item') {
      block.metadata = { listStyle: 'bullet' };
    }

    return block;
  });

  return { blocks, sourceFormat: 'docx' };
}
