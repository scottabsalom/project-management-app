import React, { useRef, useState } from 'react';

interface UploadZoneProps {
  onFileSelected: (file: File, fileType: 'pdf' | 'docx') => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

function detectFileType(file: File): 'pdf' | 'docx' | null {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf';
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  )
    return 'docx';
  return null;
}

export default function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    const fileType = detectFileType(file);
    if (!fileType) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB limit.');
      return;
    }
    setFileName(file.name);
    onFileSelected(file, fileType);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => { if (!disabled) inputRef.current?.click(); }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click(); }}
        aria-label="Upload document"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={onInputChange}
          disabled={disabled}
        />
        <svg className="mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {fileName ? (
          <p className="text-sm font-medium text-blue-600">{fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700">Drop your PDF or DOCX here</p>
            <p className="mt-1 text-xs text-gray-500">or click to browse — max 10 MB</p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
