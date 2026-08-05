import React from 'react';
import StyledComponentsRegistry from '@/app/registry';
import '@/index.css';

export const metadata = {
  title: 'Codeforces X PPU Code Academy',
  description: 'Browser tools for PPU Code Academy built on the public Codeforces API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
