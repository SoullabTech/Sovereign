/**
 * Book Studio — Canvas (visual page-layout tool).
 *
 * Phase A0 rebuild of the Atticus-alternative artifact that was
 * deleted before its source could be saved. The standalone tool
 * lives at `public/book-studio-canvas.html` and renders here
 * full-window via iframe so it bypasses the studio chrome.
 *
 * Phase A0 status:
 *   - visual chrome matches the screenshot
 *   - page list, canvas with draggable blocks, inspector, save/load
 *   - PDF export via window.print() with print stylesheet
 *
 * Pending Phase B (behaviors Kelly drives):
 *   - Auto Typeset, Reality ✓, Density / Air, Templates, Image Bank
 *
 * Pending Phase C (MAIA integration):
 *   - move state from localStorage → database
 *   - route Export PDF through Pandoc/Paged.js pipeline
 */

export const metadata = {
  title: 'Canvas · The Book Studio',
};

// Bumped per deploy so the browser doesn't serve a cached iframe.
// Update this string when shipping changes that must reach the user immediately.
const CANVAS_VERSION = '2026-05-05-c3-parser-cleanup-v2';

export default function CanvasPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#1a1c20',
        zIndex: 50,
      }}
    >
      <iframe
        src={`/book-studio-canvas.html?v=${CANVAS_VERSION}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Book Studio Canvas"
      />
    </div>
  );
}
