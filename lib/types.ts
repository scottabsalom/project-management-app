export type BlockType = 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list_item';

export interface DocumentBlock {
  id: string;
  type: BlockType;
  text: string;
  metadata?: {
    listDepth?: number;
    listStyle?: 'bullet' | 'numbered';
  };
}

export interface DocumentContent {
  blocks: DocumentBlock[];
  sourceFormat: 'pdf' | 'docx';
}

export type TranslationStep = 'idle' | 'uploading' | 'extracting' | 'translating' | 'generating' | 'done' | 'error';
