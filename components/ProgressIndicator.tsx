import React from 'react';
import type { TranslationStep } from '../lib/types';

interface ProgressIndicatorProps {
  step: TranslationStep;
}

const STEPS: { key: TranslationStep; label: string }[] = [
  { key: 'uploading', label: 'Upload' },
  { key: 'extracting', label: 'Extract' },
  { key: 'translating', label: 'Translate' },
  { key: 'generating', label: 'Generate' },
  { key: 'done', label: 'Done' },
];

const STEP_ORDER: TranslationStep[] = ['uploading', 'extracting', 'translating', 'generating', 'done'];

function getStepIndex(step: TranslationStep): number {
  return STEP_ORDER.indexOf(step);
}

export default function ProgressIndicator({ step }: ProgressIndicatorProps) {
  if (step === 'idle') return null;

  const currentIndex = getStepIndex(step);
  const isError = step === 'error';

  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s, i) => {
        const isDone = !isError && currentIndex > i;
        const isActive = !isError && currentIndex === i;
        const isUpcoming = !isError && currentIndex < i;

        return (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors
                  ${isDone ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-blue-600 text-white ring-2 ring-blue-300' : ''}
                  ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  ${isError ? 'bg-red-100 text-red-400' : ''}
                `}
              >
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-4 h-px w-8 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

