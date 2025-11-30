#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const DEMO_USER_ID = 'demo-user-seed';
const SEED_FILES_DIR = join(__dirname, '..', 'seed', 'files');

interface SeedFile {
  fileName: string;
  category: string;
  emotionalTone: string;
  elementalResonance: string;
  keyTopics: string[];
}

const seedFiles: SeedFile[] = [
  {
    fileName: 'maya-sample-notes.md',
    category: 'Consciousness',
    emotionalTone: 'contemplative',
    elementalResonance: 'water',
    keyTopics: ['flow states', 'consciousness', 'transcendence', 'balance']
  },
  {
    fileName: 'mindfulness-practice.md',
    category: 'Practice',
    emotionalTone: 'gentle',
    elementalResonance: 'earth',
    keyTopics: ['mindfulness', 'presence', 'awareness', 'daily practice']
  },
  {
    fileName: 'creative-process.md',
    category: 'Creativity',
    emotionalTone: 'inspired',
    elementalResonance: 'air',
    keyTopics: ['creativity', 'artistic process', 'unconscious wisdom', 'inspiration']
  }
];

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

async function seedSampleFiles() {
  console.log('🌱 Seeding Maya sample files...');

  // Check if files already exist
  const { data: existingFiles } = await supabase
    .from('user_files')
    .select('file_name')
    .eq('user_id', DEMO_USER_ID);

  if (existingFiles && existingFiles.length > 0) {
    console.log('📁 Sample files already exist, skipping seed.');
    return;
  }

  for (const seedFile of seedFiles) {
    const filePath = join(SEED_FILES_DIR, seedFile.fileName);
    
    if (!existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    const embedding = await generateEmbedding(content);

    // Create summary
    const summary = `${seedFile.emotionalTone} notes on ${seedFile.keyTopics.join(', ')}`;

    // Insert file record
    const { data: fileData, error: fileError } = await supabase
      .from('user_files')
      .insert({
        user_id: DEMO_USER_ID,
        file_name: seedFile.fileName,
        file_path: `seed/${seedFile.fileName}`,
        file_type: 'text/markdown',
        file_size: content.length,
        content,
        summary,
        key_topics: seedFile.keyTopics,
        emotional_tone: seedFile.emotionalTone,
        elemental_resonance: seedFile.elementalResonance,
        embedding,
        metadata: {
          category: seedFile.category,
          seeded: true,
          created_by: 'seed-script'
        }
      })
      .select()
      .single();

    if (fileError) {
      console.error(`❌ Error inserting ${seedFile.fileName}:`, fileError);
      continue;
    }

    console.log(`✅ Seeded: ${seedFile.fileName}`);

    // Create sample chunks for better search granularity
    const sections = content.split('\n## ');
    let chunkIndex = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = i === 0 ? sections[i] : '## ' + sections[i];
      if (section.trim().length < 50) continue;

      const chunkEmbedding = await generateEmbedding(section);
      const sectionTitle = section.match(/^#{1,3}\s+(.+)/)?.[1] || `Section ${i + 1}`;

      await supabase.from('file_chunks').insert({
        file_id: fileData.id,
        user_id: DEMO_USER_ID,
        chunk_index: chunkIndex++,
        content: section.trim(),
        page_number: 1,
        section_title: sectionTitle,
        embedding: chunkEmbedding,
        start_char: 0,
        end_char: section.length,
        metadata: {
          seeded: true,
          section_type: 'markdown'
        }
      });
    }

    // Create a sample citation to demonstrate the feature
    if (seedFile.fileName === 'maya-sample-notes.md') {
      await supabase.from('file_citations').insert({
        file_id: fileData.id,
        user_id: DEMO_USER_ID,
        cited_in_context: 'Demo citation for flow states query',
        page_number: 1,
        section_title: 'Flow States and Consciousness',
        snippet: 'Flow states represent the intersection of challenge and skill, where consciousness becomes singular and time dissolves.',
        confidence: 0.95
      });
    }
  }

  // Log completion
  await supabase.from('user_memory_updates').insert({
    user_id: DEMO_USER_ID,
    update_type: 'seed_files',
    context: {
      files_seeded: seedFiles.length,
      timestamp: new Date().toISOString(),
      purpose: 'demo_and_testing'
    }
  });

  console.log('🎯 Sample files seeded successfully!');
  console.log('💡 Try asking Maya: "What did you learn from my notes about flow states?"');
}

if (require.main === module) {
  seedSampleFiles().catch(console.error);
}

export { seedSampleFiles };