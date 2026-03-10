import type { DocumentContent } from '../types';

export function buildSystemPrompt(targetLanguage: string): string {
  return `You are a professional document translator.
You will receive a JSON array of document blocks. Each block has an "id", "type", and "text" field, and optionally a "metadata" field.
Translate every "text" field into ${targetLanguage}.

Rules you must follow without exception:
1. Return ONLY a valid JSON array. No prose, no explanation, no markdown code fences.
2. Keep every block's "id" and "type" exactly as given. Do not add or remove blocks.
3. Translate only the "text" field. Never modify "id", "type", or "metadata".
4. Preserve the meaning, tone, and formatting of the original text.
5. Do not merge or split blocks. Each input block produces exactly one output block.`;
}

export function buildUserPrompt(content: DocumentContent): string {
  const blocksForPrompt = content.blocks.map(b => ({
    id: b.id,
    type: b.type,
    text: b.text,
    ...(b.metadata ? { metadata: b.metadata } : {}),
  }));

  return JSON.stringify(blocksForPrompt, null, 2);
}
