import '../styles/globals.css';

export const metadata = {
  title: 'Tabbd',
  description: 'The family operating system. Challenges, rewards, and growth for everyone.',
  manifest: '/manifest.json',
  themeColor: '#0066FF',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
