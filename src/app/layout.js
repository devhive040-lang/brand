import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { BrandProvider } from '@/components/providers/BrandProvider';
import { AIProvider } from '@/components/providers/AIProvider';

export const metadata = {
  title: 'Brand AI — Smart Business Intelligence Platform',
  description: 'AI-powered platform for brand identity, marketing, project management, and business growth.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AIProvider>
            <BrandProvider>
              {children}
            </BrandProvider>
          </AIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
