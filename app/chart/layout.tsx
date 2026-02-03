import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Birth Chart Calculator | Cosmic Blueprint by Soullab',
  description: 'Calculate your natal birth chart with professional-grade astronomical precision. Get your Sun, Moon, Rising signs, all planetary positions, houses, and aspects. Free and accurate.',
  keywords: [
    'birth chart calculator',
    'natal chart',
    'free birth chart',
    'astrology chart',
    'sun sign',
    'moon sign',
    'rising sign',
    'ascendant calculator',
    'planetary positions',
    'horoscope chart',
    'natal astrology',
    'cosmic blueprint',
  ],
  openGraph: {
    title: 'Free Birth Chart Calculator | Cosmic Blueprint',
    description: 'Calculate your natal birth chart with professional-grade astronomical precision. Sun, Moon, Rising, all planets, houses, and aspects.',
    type: 'website',
    url: 'https://chart.soullab.life',
    siteName: 'Soullab',
    images: [
      {
        url: '/og-chart.png',
        width: 1200,
        height: 630,
        alt: 'Cosmic Blueprint - Birth Chart Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Birth Chart Calculator',
    description: 'Professional-grade natal chart with Sun, Moon, Rising, all planets, houses, and aspects.',
  },
  alternates: {
    canonical: 'https://chart.soullab.life',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
