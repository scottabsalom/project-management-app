import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { extractPdf } from '../../lib/extraction/extractPdf';
import { extractDocx } from '../../lib/extraction/extractDocx';
import { translateDocument } from '../../lib/translation/translateDocument';
import { generatePdf } from '../../lib/generation/generatePdf';
import { generateDocx } from '../../lib/generation/generateDocx';
import { SUPPORTED_LANGUAGES, MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from '../../lib/constants';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '25mb',
  },
};

type FileType = 'pdf' | 'docx';

function isValidLanguage(lang: string): boolean {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

function isValidFileType(type: string): type is FileType {
  return type === 'pdf' || type === 'docx';
}

async function parseForm(req: NextApiRequest): Promise<{ filePath: string; targetLanguage: string; fileType: FileType }> {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE_BYTES,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        if (err.code === 1009 || (err.message && err.message.includes('maxFileSize'))) {
          reject(Object.assign(new Error('File exceeds 10 MB limit.'), { statusCode: 413 }));
        } else {
          reject(err);
        }
        return;
      }

      const targetLanguageRaw = Array.isArray(fields.targetLanguage) ? fields.targetLanguage[0] : fields.targetLanguage;
      const fileTypeRaw = Array.isArray(fields.fileType) ? fields.fileType[0] : fields.fileType;
      const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!uploadedFile || !uploadedFile.filepath) {
        reject(Object.assign(new Error('No file uploaded.'), { statusCode: 400 }));
        return;
      }

      if (!targetLanguageRaw || !isValidLanguage(targetLanguageRaw)) {
        reject(Object.assign(new Error('Invalid or missing target language.'), { statusCode: 400 }));
        return;
      }

      if (!fileTypeRaw || !isValidFileType(fileTypeRaw)) {
        reject(Object.assign(new Error('Invalid or missing fileType. Must be "pdf" or "docx".'), { statusCode: 400 }));
        return;
      }

      resolve({
        filePath: uploadedFile.filepath,
        targetLanguage: targetLanguageRaw,
        fileType: fileTypeRaw,
      });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let filePath: string | null = null;

  try {
    const parsed = await parseForm(req);
    filePath = parsed.filePath;

    const buffer = fs.readFileSync(filePath);

    // Extract
    const content =
      parsed.fileType === 'pdf'
        ? await extractPdf(buffer)
        : await extractDocx(buffer);

    if (content.blocks.length === 0) {
      return res.status(400).json({ error: 'Could not extract any text from the document.' });
    }

    // Translate
    const translated = await translateDocument(content, parsed.targetLanguage);

    // Generate
    const outputBuffer =
      parsed.fileType === 'pdf'
        ? await generatePdf(translated)
        : await generateDocx(translated);

    const filename = `translated.${parsed.fileType}`;
    const contentType =
      parsed.fileType === 'pdf'
        ? ACCEPTED_MIME_TYPES.pdf
        : ACCEPTED_MIME_TYPES.docx;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', outputBuffer.length);
    return res.status(200).send(outputBuffer);
  } catch (err: unknown) {
    const error = err as Error & { statusCode?: number };
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'An unexpected error occurred.';
    return res.status(statusCode).json({ error: message });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch { /* ignore cleanup errors */ }
    }
  }
}
