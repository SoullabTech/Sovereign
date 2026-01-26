'use client';

/**
 * Invite QR Code Component
 *
 * Displays a QR code for inviting a new user to Soullab.
 * Can be printed or shared digitally.
 */

import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import { Download, Copy, Check, Gift } from 'lucide-react';
import { useState } from 'react';
import { Holoflower } from '@/components/ui/Holoflower';

interface InviteQRCodeProps {
  url: string;
  passkey: string;
  recipientName?: string;
  gifterName?: string;
  size?: 'sm' | 'md' | 'lg';
  showControls?: boolean;
  className?: string;
}

export function InviteQRCode({
  url,
  passkey,
  recipientName,
  gifterName,
  size = 'md',
  showControls = true,
  className = ''
}: InviteQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const qrSize = {
    sm: 150,
    md: 200,
    lg: 280
  }[size];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with padding for the card
    const padding = 40;
    const cardWidth = qrSize + padding * 2;
    const cardHeight = qrSize + padding * 2 + 80; // Extra space for text

    canvas.width = cardWidth;
    canvas.height = cardHeight;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // Draw QR code
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, qrSize, qrSize);

      // Draw passkey text
      ctx.fillStyle = '#0d9488';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(passkey, cardWidth / 2, qrSize + padding + 30);

      // Draw "Scan to join Soullab" text
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('Scan to join Soullab', cardWidth / 2, qrSize + padding + 50);

      // Download
      const link = document.createElement('a');
      link.download = `soullab-invite-${passkey}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* QR Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        {/* Header with Holoflower */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8">
            <Holoflower size="sm" glowIntensity="low" animate={false} />
          </div>
          <span className="text-lg font-light text-teal-900 tracking-wide">Soullab</span>
        </div>

        {/* QR Code */}
        <div ref={qrRef} className="p-3 bg-white rounded-xl">
          <QRCode
            value={url}
            size={qrSize}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Passkey Display */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
            <Gift className="w-4 h-4 text-teal-600" />
            <span className="font-mono text-sm font-medium text-teal-700">{passkey}</span>
          </div>
        </div>

        {/* Recipient Info */}
        {recipientName && (
          <p className="mt-3 text-center text-sm text-gray-600">
            For: <span className="font-medium">{recipientName}</span>
          </p>
        )}

        {/* Gifter Info */}
        {gifterName && (
          <p className="mt-1 text-center text-xs text-gray-500">
            From: {gifterName}
          </p>
        )}

        {/* Instructions */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Scan with your phone camera to begin
        </p>
      </motion.div>

      {/* Controls */}
      {showControls && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg text-sm font-medium text-white hover:bg-teal-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function InviteQRCodeCompact({
  url,
  passkey,
  className = ''
}: {
  url: string;
  passkey: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
        <QRCode value={url} size={80} level="M" />
      </div>
      <span className="mt-1 font-mono text-xs text-gray-500">{passkey}</span>
    </div>
  );
}
