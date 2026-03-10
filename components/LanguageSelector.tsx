import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../lib/constants';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export default function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <div>
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
        Target Language
      </label>
      <select
        id="language-select"
        value={value}
        onChange={e => onChange(e.target.value as SupportedLanguage)}
        disabled={disabled}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
    </div>
  );
}
