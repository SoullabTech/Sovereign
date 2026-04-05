/**
 * Parent Update Email Template — mobile-friendly HTML email
 */

import type { ParentUpdateBlocks } from './schema';

export function generateParentUpdateHtml(opts: {
  blocks: ParentUpdateBlocks;
  practitionerName: string;
  clientName: string;
  sessionDate: string;
}): string {
  const { blocks, practitionerName, clientName, sessionDate } = opts;

  const sections = [
    { heading: 'What we worked on', content: blocks.whatWeWorkedOn },
    { heading: 'What I noticed', content: blocks.whatINoticed },
    { heading: 'What may help this week', content: blocks.whatMayHelpThisWeek },
    ...(blocks.whatToWatchFor
      ? [{ heading: 'What to watch for', content: blocks.whatToWatchFor }]
      : []),
  ];

  const sectionsHtml = sections
    .map(
      (s) => `
      <tr>
        <td style="padding: 16px 24px 4px 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1a1a2e;">
            ${escapeHtml(s.heading)}
          </h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">
            ${escapeHtml(s.content)}
          </p>
        </td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Update for ${escapeHtml(clientName)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <tr>
      <td style="padding: 24px 24px 16px 24px; background: #1a1a2e; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #e8c547;">
          Session Update
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #8888aa;">
          ${escapeHtml(clientName)} &middot; ${escapeHtml(sessionDate)}
        </p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="background: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${sectionsHtml}
          <tr><td style="padding: 8px;"></td></tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 24px; background: #f8f8fc; border-radius: 0 0 12px 12px; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          ${escapeHtml(practitionerName)} &middot; via SoulLab
        </p>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

export function renderBlocksAsText(blocks: ParentUpdateBlocks): string {
  const lines = [
    `**What we worked on**\n${blocks.whatWeWorkedOn}`,
    `**What I noticed**\n${blocks.whatINoticed}`,
    `**What may help this week**\n${blocks.whatMayHelpThisWeek}`,
  ];
  if (blocks.whatToWatchFor) {
    lines.push(`**What to watch for**\n${blocks.whatToWatchFor}`);
  }
  return lines.join('\n\n');
}
