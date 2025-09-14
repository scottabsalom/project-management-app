import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Navigation from '@/components/Navigation';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}