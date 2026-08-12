import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LINKEDAI Job Board & Career Engine | AI Transferable Skill Engine',
  description: 'Automated job board matching candidates using Gemini AI transferable skill analysis, automated alerts, and custom resume tailoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
