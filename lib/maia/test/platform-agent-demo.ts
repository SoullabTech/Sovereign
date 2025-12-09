/**
 * 🌀 Platform Agent Demo - McKenna-Jung Community Commons to Soullab Notes
 *
 * Demonstrates the complete transformation pipeline from technical
 * Community Commons post to engaging Soullab Notes Substack content
 */

import { PlatformAgent } from '../PlatformAgent';
import { PlatformAgentInput } from '../types';

/**
 * Demo transformation of McKenna-Jung post for Soullab Notes
 */
async function demonstrateMcKennaJungTransformation() {
  console.log('🌀 Platform Agent Demo: McKenna-Jung → Soullab Notes');
  console.log('=' .repeat(60));

  // Initialize Platform Agent with Soullab Notes configuration
  const platformAgent = new PlatformAgent({
    platformEndpoints: {
      substack: {
        apiKey: process.env.SUBSTACK_API_KEY || 'demo-key',
        publicationUrl: 'https://kellynezat.substack.com'
      },
      communityCommons: {
        basePath: '/Users/soullab/Community-Commons'
      }
    }
  });

  try {
    // Use the actual McKenna-Jung Community Commons post
    const communityCommonsPath = '/Users/soullab/Community-Commons/07-Community-Contributions/Experiences/McKenna-Jung-Axis-Mundi-Technology-Experience.md';

    console.log('\n📚 Transforming Community Commons Post...');
    console.log(`Source: ${communityCommonsPath}`);

    // Transform to Substack format as Episode 1 of Consciousness Technology Chronicles
    const result = await platformAgent.transformCommunityPostToSubstack(
      communityCommonsPath,
      1 // Episode 1
    );

    console.log('\n✨ Transformation Complete!');
    console.log('=' .repeat(40));

    // Display results
    const substackPost = result.content.data as any;

    console.log('\n📰 SUBSTACK POST PREVIEW:');
    console.log(`Title: ${substackPost.title}`);
    console.log(`Subtitle: ${substackPost.subtitle || 'None'}`);
    console.log(`Series: ${substackPost.metadata?.seriesInfo?.name} #${substackPost.metadata?.seriesInfo?.episode}`);
    console.log(`Reading Time: ${substackPost.metadata?.estimatedReadTime} minutes`);
    console.log(`Tags: ${substackPost.metadata?.tags?.join(', ') || 'None'}`);

    console.log('\n🎯 HOOK PREVIEW:');
    console.log(substackPost.hook?.substring(0, 200) + '...');

    console.log('\n📋 SECTIONS:');
    substackPost.sections?.forEach((section: any, index: number) => {
      console.log(`${index + 1}. ${section.heading || '[No heading]'} (${section.style})`);
      console.log(`   ${section.content.substring(0, 100)}...`);
    });

    console.log('\n🔗 CROSS-PLATFORM LINKS:');
    console.log(`Community Commons: ${result.crossPlatformData.bidirectionalLinks.sourceUrl}`);
    console.log(`Soullab Notes URL: ${result.crossPlatformData.bidirectionalLinks.targetUrl}`);
    console.log(`Technical Details: ${result.crossPlatformData.bidirectionalLinks.technicalDetails}`);

    console.log('\n🧠 MAIA REFLECTION:');
    console.log(`Summary: ${result.reflection.summary}`);
    console.log(`Voice Fidelity: ${(result.reflection.voiceFidelity * 100).toFixed(1)}%`);
    console.log('Preservation Notes:');
    result.reflection.preservationNotes.forEach((note, i) => {
      console.log(`  ${i + 1}. ${note}`);
    });
    console.log('Suggestions:');
    result.reflection.suggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });

    console.log('\n📄 EXPORT FORMATS:');
    console.log(`✓ Markdown (${result.exports.markdown?.length || 0} chars)`);
    console.log(`✓ HTML (${result.exports.html?.length || 0} chars)`);
    console.log(`✓ JSON (${JSON.stringify(result.exports.json).length || 0} chars)`);

    // Save outputs for review
    console.log('\n💾 Saving Outputs...');

    const fs = await import('fs');
    const path = await import('path');

    const outputDir = '/Users/soullab/Community-Commons/_Platform-Agent-Output';

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save Substack-ready markdown
    const substackMarkdownPath = path.join(outputDir, 'episode-1-mckenna-jung-substack.md');
    fs.writeFileSync(substackMarkdownPath, result.exports.markdown || '');
    console.log(`✓ Substack Markdown: ${substackMarkdownPath}`);

    // Save HTML version
    const substackHtmlPath = path.join(outputDir, 'episode-1-mckenna-jung-substack.html');
    fs.writeFileSync(substackHtmlPath, result.exports.html || '');
    console.log(`✓ HTML Version: ${substackHtmlPath}`);

    // Save transformation report
    const reportPath = path.join(outputDir, 'episode-1-transformation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    console.log(`✓ Transformation Report: ${reportPath}`);

    console.log('\n🎉 SUCCESS: Ready for Soullab Notes Publication!');
    console.log(`\n🌐 Next Steps:`);
    console.log(`1. Review the generated Substack post: ${substackMarkdownPath}`);
    console.log(`2. Copy content to Soullab Notes: https://kellynezat.substack.com`);
    console.log(`3. Publish as Episode 1 of "Consciousness Technology Chronicles"`);
    console.log(`4. Add bidirectional links between platforms`);

    return result;

  } catch (error) {
    console.error('\n❌ TRANSFORMATION FAILED:');
    console.error(error);
    throw error;
  }
}

/**
 * Demonstrate series management
 */
async function demonstrateSeriesManagement() {
  console.log('\n\n🗂️ Series Management Demo');
  console.log('=' .repeat(40));

  const seriesInfo = {
    name: 'Consciousness Technology Chronicles',
    description: 'Bridging ancient wisdom and living code',
    targetAudience: ['conscious technologists', 'wisdom seekers', 'interface designers'],
    episodesPlan: [
      {
        episode: 1,
        title: 'When Terence McKenna Met Our Code',
        source: 'McKenna-Jung-Axis-Mundi-Technology-Experience.md',
        status: 'ready'
      },
      {
        episode: 2,
        title: 'The Mandala That Breathes',
        source: 'MAIA-Living-Mandala-Axis-Mundi-Experience.md',
        status: 'planned'
      },
      {
        episode: 3,
        title: 'Plant Teachers in Silicon',
        source: 'Future consciousness tech exploration',
        status: 'conceptual'
      }
    ]
  };

  console.log(`📺 Series: ${seriesInfo.name}`);
  console.log(`📖 Description: ${seriesInfo.description}`);
  console.log(`👥 Target Audience: ${seriesInfo.targetAudience.join(', ')}`);
  console.log('\n📅 Episode Pipeline:');

  seriesInfo.episodesPlan.forEach(episode => {
    const statusIcon = {
      'ready': '✅',
      'planned': '📋',
      'conceptual': '💭'
    }[episode.status] || '❓';

    console.log(`${statusIcon} Episode ${episode.episode}: ${episode.title}`);
    console.log(`    Source: ${episode.source}`);
  });

  console.log('\n🚀 Publication Strategy:');
  console.log('- Weekly publication on Wednesdays');
  console.log('- Community Commons technical details linked');
  console.log('- Cross-platform discussion facilitation');
  console.log('- Reader engagement through comments and experiments');
}

/**
 * Main demo runner
 */
async function runPlatformAgentDemo() {
  try {
    console.log('🌀 MAIA Platform Agent - Soullab Notes Integration Demo');
    console.log('🔗 Connecting Community Commons ↔ https://kellynezat.substack.com');
    console.log(new Date().toISOString());
    console.log('=' .repeat(80));

    // Demonstrate transformation
    await demonstrateMcKennaJungTransformation();

    // Demonstrate series management
    await demonstrateSeriesManagement();

    console.log('\n\n🎯 DEMO COMPLETE - Platform Agent Ready for Production!');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('\n💥 Demo failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  demonstrateMcKennaJungTransformation,
  demonstrateSeriesManagement,
  runPlatformAgentDemo
};

// Run demo if called directly
if (require.main === module) {
  runPlatformAgentDemo();
}