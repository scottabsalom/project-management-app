import Anthropic from '@anthropic-ai/sdk';
import type { DocumentContent, DocumentBlock } from '../types';
import { buildSystemPrompt, buildUserPrompt } from './buildPrompt';

const client = new Anthropic();

export async function translateDocument(
  content: DocumentContent,
  targetLanguage: string
): Promise<DocumentContent> {
  const systemPrompt = buildSystemPrompt(targetLanguage);
  const userPrompt = buildUserPrompt(content);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

  // Strip markdown fences if Claude added them despite instructions
  const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Claude returned invalid JSON. Translation failed.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Claude response is not a JSON array. Translation failed.');
  }

  const translatedBlocks: DocumentBlock[] = (parsed as Array<Record<string, unknown>>).map((item, index) => {
    const original = content.blocks[index];
    if (!original) throw new Error(`Translated block count mismatch at index ${index}.`);

    const text = typeof item.text === 'string' ? item.text : original.text;

    return {
      id: original.id,
      type: original.type,
      text,
      ...(original.metadata ? { metadata: original.metadata } : {}),
    };
  });

  return { blocks: translatedBlocks, sourceFormat: content.sourceFormat };
}
