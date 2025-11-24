#!/usr/bin/env node
/**
 * Script to add 'export const dynamic = "force-dynamic";' to API routes using searchParams
 * This prevents Next.js from trying to statically generate dynamic routes
 */

const fs = require('fs');
const path = require('path');

const routes = [
  'app/api/admin/usage/summary/route.ts',
  'app/api/voice/transcribe/route.ts',
  'app/api/files/search/route.ts',
  'app/api/insights/archetypes/route.ts',
  'app/api/admin/usage/[userId]/route.ts',
  'app/api/ganesha/export-contacts/route.ts',
  'app/api/voice/webrtc-session/route.ts',
  'app/api/voice/stream/route.ts',
  'app/api/voice/sesame/route.ts',
  'app/api/voice/route.ts',
  'app/api/voice/list/route.ts',
  'app/api/voice/alert/route.ts',
  'app/api/upload/route.ts',
  'app/api/soulprint/route.ts',
  'app/api/shift/survey/route.ts',
  'app/api/shift/reflection/route.ts',
  'app/api/shift/profile/route.ts',
  'app/api/sacred-timeline/route.ts',
  'app/api/patterns/emergent/route.ts',
  'app/api/oracle/streamlined/route.ts',
  'app/api/oracle/stage/route.ts',
  'app/api/oracle/personal/route.ts',
  'app/api/oracle/insights/route.ts',
  'app/api/oracle/files/status/route.ts',
  'app/api/oracle/files/manage/route.ts',
  'app/api/oracle/files/library/route.ts',
  'app/api/oracle/emotional-resonance/route.ts',
  'app/api/oracle/chat/route.ts',
  'app/api/oracle/beta/stage/route.ts',
  'app/api/onboarding/route.ts',
  'app/api/memory/list/route.ts',
  'app/api/maia/demo/route.ts',
  'app/api/journal/timeline/route.ts',
  'app/api/journal/search/route.ts',
  'app/api/journal/route.ts',
  'app/api/journal/export-obsidian/route.ts',
  'app/api/journal/entries/route.ts',
  'app/api/export/obsidian/route.ts',
  'app/api/evolution/trajectory/route.ts',
  'app/api/evolution/combined/route.ts',
  'app/api/events/route.ts',
  'app/api/elemental/recommendations/route.ts',
  'app/api/daimonic/encounter/route.ts',
  'app/api/community/posts/route.ts',
  'app/api/collective/timing/route.ts',
  'app/api/collective/summary/route.ts',
  'app/api/collective/snapshot/route.ts',
  'app/api/collective/patterns/route.ts',
  'app/api/collective/field-state/route.ts',
  'app/api/collective/evolution/route.ts',
  'app/api/collective/events/route.ts',
  'app/api/ain/stream/route.ts',
  'app/api/ain/guidance/route.ts',
];

const dynamicExport = `// Mark route as dynamic since it uses searchParams or other dynamic features
export const dynamic = 'force-dynamic';

`;

let successCount = 0;
let skippedCount = 0;
let errorCount = 0;

routes.forEach(routePath => {
  const filePath = path.join(process.cwd(), routePath);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${routePath} (file not found)`);
      skippedCount++;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check if already has dynamic export
    if (content.includes("export const dynamic = 'force-dynamic'") ||
        content.includes('export const dynamic = "force-dynamic"')) {
      console.log(`✓ Skipping ${routePath} (already has dynamic export)`);
      skippedCount++;
      return;
    }

    // Find the first import statement or the start of the file
    const lines = content.split('\n');
    let insertIndex = 0;

    // Find last import or comment block
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') ||
          line.startsWith('/**') ||
          line.startsWith('*') ||
          line.startsWith('*/') ||
          line.startsWith('//')) {
        insertIndex = i + 1;
      } else if (line.length > 0 && !line.startsWith('import')) {
        break;
      }
    }

    // Insert dynamic export after imports
    lines.splice(insertIndex, 0, dynamicExport);
    const newContent = lines.join('\n');

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed ${routePath}`);
    successCount++;

  } catch (error) {
    console.error(`❌ Error processing ${routePath}:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✓ Fixed: ${successCount}`);
console.log(`   ⚠️  Skipped: ${skippedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`   📝 Total: ${routes.length}`);
