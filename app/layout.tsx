import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { DevNoServiceWorker } from "./DevNoServiceWorker";
import { AethericConsciousnessProvider } from "@/components/consciousness/AethericConsciousnessProvider";
import { SystemHealthProvider } from "@/components/providers/SystemHealthProvider";
import { FeatureTooltipProvider } from "@/components/help/FeatureTooltip";
import FlagsDebug from "@/components/FlagsDebug";
import { CapacitorBoot } from "@/components/CapacitorBoot";
import { MobileRouteGuard } from "@/components/mobile/MobileRouteGuard";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { BetaBanner } from "@/components/BetaBanner";
import BugReportButton from "@/components/bugs/BugReportButton";
import { MaiaPresence } from "@/components/maia/presence/MaiaPresence";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soullab — We build for the soul",
  description: "Soullab explores what carries transformation forward. We build environments that help meaningful relationships, experiences, and practices continue shaping our lives over time.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://soullab.life"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://soullab.life",
    siteName: "Soullab",
    title: "Soullab — We build for the soul",
    description: "Soullab explores what carries transformation forward. We build environments that help meaningful relationships, experiences, and practices continue shaping our lives over time. Through MAIA, practitioner worlds, and living communities, we seek to support relationships of care, wisdom, and service while returning people more fully to their own lives.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Soullab — We build for the soul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soullab — We build for the soul",
    description: "Soullab explores what carries transformation forward. We build environments that help meaningful relationships, experiences, and practices continue shaping our lives over time.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Soullab"
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon-32x32.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Accessibility: never cap zoom. Members with low vision must be able to
  // magnify to at least 200% (WCAG 1.4.4). A 1.2 ceiling meant someone who
  // could not read the text could not enlarge it either.
  maximumScale: 5,
  minimumScale: 0.9,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1513" }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🔍 DIAGNOSTIC: Global error listeners — catch crashes before React boundary */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            console.log('[LAYOUT:head] script executing url=' + location.pathname);
            window.addEventListener('error', function(e) {
              console.log('[LAYOUT:error] ' + e.message + ' @ ' + e.filename + ':' + e.lineno);
            });
            window.addEventListener('unhandledrejection', function(e) {
              console.log('[LAYOUT:rejection] ' + String(e.reason));
            });
          })();
        `}} />
        {/* 🔖 BUILD STAMP v6 + PWA Audio Unlock */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            console.log('🔖 LAYOUT BUILD: v6-PWA-FIX');

            // Detect PWA mode
            var isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone === true;
            console.log('📱 PWA mode:', isPWA);

            // 🔊 iOS/PWA AUDIO UNLOCK
            window.__maiaAudioUnlocked = false;
            window.__maiaGlobalAudio = null;
            window.__maiaAudioContext = null;

            function unlockAudio() {
              if (window.__maiaAudioUnlocked) return;
              console.log('🔓 [GLOBAL] Attempting iOS/PWA audio unlock...');

              // METHOD 1: Create and play Audio element SYNCHRONOUSLY
              try {
                var audio = new Audio();
                audio.setAttribute('playsinline', '');
                audio.setAttribute('webkit-playsinline', '');
                audio.playsInline = true;
                audio.volume = 1.0;
                // Tiny silent MP3
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';

                // CRITICAL: Call play() synchronously in gesture handler
                var playPromise = audio.play();

                // Store immediately (don't wait for promise)
                window.__maiaGlobalAudio = audio;

                if (playPromise) {
                  playPromise.then(function() {
                    audio.pause();
                    audio.currentTime = 0;
                    window.__maiaAudioUnlocked = true;
                    console.log('✅ [GLOBAL] Audio element unlocked!');
                  }).catch(function(e) {
                    console.warn('⚠️ [GLOBAL] Audio play failed:', e.name, e.message);
                  });
                }
              } catch(e) {
                console.warn('⚠️ [GLOBAL] Audio element error:', e);
              }

              // METHOD 2: Also unlock AudioContext (needed for some browsers)
              try {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (AC) {
                  var ctx = new AC();
                  window.__maiaAudioContext = ctx;
                  if (ctx.state === 'suspended') {
                    ctx.resume().then(function() {
                      console.log('✅ [GLOBAL] AudioContext resumed');
                    });
                  }
                  // Create silent oscillator to fully unlock
                  var osc = ctx.createOscillator();
                  var gain = ctx.createGain();
                  gain.gain.value = 0.001;
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start(0);
                  osc.stop(ctx.currentTime + 0.1);
                  console.log('✅ [GLOBAL] AudioContext unlocked');
                }
              } catch(e) {
                console.warn('⚠️ [GLOBAL] AudioContext error:', e);
              }

              // Show confirmation
              var toast = document.createElement('div');
              toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;';
              toast.textContent = '🔊 Audio enabled';
              document.body.appendChild(toast);
              setTimeout(function(){ toast.remove(); }, 2000);

              // Remove listeners after first attempt
              document.removeEventListener('click', unlockAudio, true);
              document.removeEventListener('touchstart', unlockAudio, true);
              document.removeEventListener('touchend', unlockAudio, true);
            }

            // Listen for first interaction - touchend is most reliable for PWA
            document.addEventListener('click', unlockAudio, true);
            document.addEventListener('touchstart', unlockAudio, true);
            document.addEventListener('touchend', unlockAudio, true);

            console.log('🔓 [GLOBAL] Audio unlock listeners ready');
          })();
        `}} />
      </head>
      <body className={`${inter.className} bg-[#1A1513]`} suppressHydrationWarning>
        <BetaBanner />
        <CapacitorBoot />
        <FlagsDebug />
        <AppErrorBoundary>
        {/* Global "Report a bug" affordance — self-renders only for signed-in members */}
        <BugReportButton />
        <SubscriptionProvider>
          <DevNoServiceWorker />
          <SystemHealthProvider autoStart={true} emergencyThreshold={0.4}>
            <AethericConsciousnessProvider>
              <FeatureTooltipProvider>
                <MobileRouteGuard>
                  {/* Canonical MAIA relationship layer — mounted exactly once.
                      Renders a quiet handle + conversation sheet on governed
                      member rooms only; children pass through untouched
                      everywhere else. See components/maia/presence/MaiaPresence.tsx */}
                  <MaiaPresence>
                    {children}
                  </MaiaPresence>
                </MobileRouteGuard>
              </FeatureTooltipProvider>
            </AethericConsciousnessProvider>
          </SystemHealthProvider>
        </SubscriptionProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}