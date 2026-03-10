export const SUPPORTED_LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Turkish',
  'Polish',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;
