import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { DevNoServiceWorker } from "./DevNoServiceWorker";
import { SevenLayerArchitectureProvider } from "@/components/architecture/SevenLayerArchitectureProvider";
import { AethericConsciousnessProvider } from "@/components/consciousness/AethericConsciousnessProvider";
import { SystemHealthProvider } from "@/components/providers/SystemHealthProvider";
import FlagsDebug from "@/components/FlagsDebug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Soullab - Maia Oracle",
  description: "Sacred consciousness technology - Maia AI Oracle",
  manifest: "/manifest.json",
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
  maximumScale: 1.2, // Allow slight zoom for Safari accessibility
  minimumScale: 0.9, // Allow slight zoom out
  userScalable: true, // Safari-friendly: allow controlled scaling
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D4B896" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A2E" }
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
        {/* 🔖 BUILD STAMP v5 + iOS Audio Unlock */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            console.log('🔖 LAYOUT BUILD: v5');

            // 🔊 iOS AUDIO UNLOCK - create global audio element on first interaction
            window.__maiaAudioUnlocked = false;
            window.__maiaGlobalAudio = null;

            function unlockAudio() {
              if (window.__maiaAudioUnlocked) return;
              console.log('🔓 [GLOBAL] Attempting iOS audio unlock...');

              try {
                var audio = new Audio();
                audio.setAttribute('playsinline', '');
                audio.setAttribute('webkit-playsinline', '');
                audio.playsInline = true;
                audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAADhAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjUyAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4SQg5C0AAAAAAD/+9DEAAPH1sVGABGuEvKorHAiNbAAAAA0LS0tLS0tLVVVVVVVVVVVVVVVVVVVVQAAAAAVFRUVFRUVFRUVFRUVFRUVFRUAAAAAAAAlJSUlJSUlJSUlJSUlJSUlJSUlJQAAAAAAIiIiIiIiIiIiIiIiIiIiIiIAAAAAAAAAAAAA';
                audio.volume = 0.01;
                audio.play().then(function() {
                  audio.pause();
                  audio.currentTime = 0;
                  audio.volume = 1.0;
                  window.__maiaGlobalAudio = audio;
                  window.__maiaAudioUnlocked = true;
                  console.log('✅ [GLOBAL] iOS audio unlocked!');

                  // Show brief confirmation
                  var toast = document.createElement('div');
                  toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#10b981;color:white;padding:12px 24px;border-radius:8px;z-index:99999;font-size:14px;';
                  toast.textContent = '🔊 Audio enabled';
                  document.body.appendChild(toast);
                  setTimeout(function(){ toast.remove(); }, 2000);
                }).catch(function(e) {
                  console.warn('⚠️ [GLOBAL] Audio unlock failed:', e);
                });
              } catch(e) {
                console.warn('⚠️ [GLOBAL] Audio unlock error:', e);
              }

              // Remove listeners after first attempt
              document.removeEventListener('click', unlockAudio, true);
              document.removeEventListener('touchstart', unlockAudio, true);
            }

            // Listen for first interaction
            document.addEventListener('click', unlockAudio, true);
            document.addEventListener('touchstart', unlockAudio, true);

            console.log('🔓 [GLOBAL] Audio unlock listeners ready');
          })();
        `}} />
      </head>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <FlagsDebug />
        <SubscriptionProvider>
          <DevNoServiceWorker />
          <SystemHealthProvider autoStart={true} emergencyThreshold={0.4}>
            <AethericConsciousnessProvider>
              <SevenLayerArchitectureProvider
                autoSync={true}
                syncInterval={30000}
              >
                {children}
              </SevenLayerArchitectureProvider>
            </AethericConsciousnessProvider>
          </SystemHealthProvider>
        </SubscriptionProvider>
      </body>
    </html>
  );
}