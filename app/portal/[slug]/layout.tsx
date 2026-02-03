import { Metadata } from 'next';
import { Cinzel, Quicksand } from 'next/font/google';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stellium Portal',
  description: 'Your personal astrology companion',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${cinzel.variable} ${quicksand.variable}`}>
      {children}
    </div>
  );
}
