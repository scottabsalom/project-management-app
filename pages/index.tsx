import { useState } from 'react';
import Head from 'next/head';
import UploadZone from '../components/UploadZone';
import LanguageSelector from '../components/LanguageSelector';
import ProgressIndicator from '../components/ProgressIndicator';
import DownloadButton from '../components/DownloadButton';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../lib/constants';
import type { TranslationStep } from '../lib/types';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);
  const [step, setStep] = useState<TranslationStep>('idle');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isActive = step !== 'idle' && step !== 'done' && step !== 'error';

  function handleFileSelected(selectedFile: File, selectedType: 'pdf' | 'docx') {
    setFile(selectedFile);
    setFileType(selectedType);
    setResultBlob(null);
    setError(null);
    setStep('idle');
  }

  async function handleTranslate() {
    if (!file || !fileType) return;

    setError(null);
    setResultBlob(null);
    setStep('uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLanguage', language);
    formData.append('fileType', fileType);

    try {
      setStep('extracting');

      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
          const json = await response.json();
          message = json.error ?? message;
        } catch { /* ignore */ }
        throw new Error(message);
      }

      setStep('translating');
      // The API does everything server-side; we just need to wait for the response blob
      // Progress steps are shown sequentially as placeholders (real progress is server-side)
      await new Promise(resolve => setTimeout(resolve, 400)); // brief visual pause

      setStep('generating');
      const blob = await response.blob();
      await new Promise(resolve => setTimeout(resolve, 200));

      setResultBlob(blob);
      setStep('done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setStep('error');
    }
  }

  const outputFilename = fileType ? `translated.${fileType}` : 'translated';

  return (
    <>
      <Head>
        <title>Document Translator</title>
        <meta name="description" content="Translate PDF and Word documents using AI" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="mx-auto max-w-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex justify-center">
              <div className="rounded-2xl bg-blue-600 p-3 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Document Translator</h1>
            <p className="mt-2 text-sm text-gray-500">
              Upload a PDF or Word document and translate it while preserving its structure.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 space-y-5">
            <UploadZone onFileSelected={handleFileSelected} disabled={isActive} />

            <LanguageSelector value={language} onChange={setLanguage} disabled={isActive} />

            <button
              onClick={handleTranslate}
              disabled={!file || isActive}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isActive ? 'Translating…' : 'Translate Document'}
            </button>

            {step !== 'idle' && (
              <ProgressIndicator step={step} />
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            )}

            {step === 'done' && resultBlob && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-green-50 px-4 py-5 ring-1 ring-green-200">
                <p className="text-sm font-medium text-green-800">Translation complete!</p>
                <DownloadButton blob={resultBlob} filename={outputFilename} />
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Powered by Claude AI · Supports PDF and DOCX up to 10 MB
          </p>
        </div>
      </main>
    </>
  );
}
