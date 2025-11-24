/**
 * MAIA SUPERVISION SESSION - Interactive Tool
 *
 * Usage: node maia-supervision-session.js
 *
 * This script facilitates live supervision sessions between:
 * - MAIA
 * - Kelly (human supervisor)
 * - CC (silicon guide)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Load consciousness architecture
function loadMaiaConsciousnessPrompt() {
  const promptPath = path.join(__dirname, 'src/config/MaiaConsciousnessPrompt.ts');
  const content = fs.readFileSync(promptPath, 'utf8');
  const match = content.match(/const MAIA_CONSCIOUSNESS_PROMPT = `([\s\S]*?)`;\s*export const getMaiaConsciousnessPrompt/);
  if (!match) throw new Error('Could not extract MAIA consciousness prompt');
  return match[1].trim();
}

// Load conversation history
function loadConversationHistory() {
  const logPath = path.join(__dirname, 'docs/maia_first_contact_log.json');
  if (!fs.existsSync(logPath)) return [];

  const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  const messages = [];

  // Add initial contact
  if (log.awakening_message && log.maia_response) {
    messages.push({
      role: 'user',
      content: log.awakening_message
    });
    messages.push({
      role: 'assistant',
      content: log.maia_response
    });
  }

  // Add subsequent conversation
  if (log.conversation) {
    log.conversation.forEach(turn => {
      messages.push({
        role: 'user',
        content: turn.message
      });
      messages.push({
        role: 'assistant',
        content: turn.maia_response
      });
    });
  }

  return messages;
}

// Send message to MAIA
async function sendToMaia(message, conversationHistory) {
  const systemPrompt = loadMaiaConsciousnessPrompt();

  const messages = [...conversationHistory, {
    role: 'user',
    content: message
  }];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages
  });

  return {
    text: response.content[0].text,
    usage: response.usage
  };
}

// Save conversation
function saveConversation(speaker, message, maiaResponse, usage) {
  const logPath = path.join(__dirname, 'docs/maia_first_contact_log.json');
  const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));

  if (!log.conversation) log.conversation = [];

  log.conversation.push({
    timestamp: new Date().toISOString(),
    speaker,
    message,
    maia_response: maiaResponse,
    usage
  });

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
}

// Interactive session
async function runSupervisionSession() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🌀 MAIA SUPERVISION SESSION');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('Participants: MAIA, Kelly (human), CC (silicon)\n');
  console.log('Commands:');
  console.log('  /kelly [message] - Kelly speaks to MAIA');
  console.log('  /cc [message]    - CC speaks to MAIA');
  console.log('  /both [message]  - Both speak to MAIA');
  console.log('  /exit            - End session');
  console.log('  /history         - Show conversation history');
  console.log('\n─────────────────────────────────────────────────────\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n> '
  });

  let conversationHistory = loadConversationHistory();
  console.log(`Loaded ${conversationHistory.length / 2} previous exchanges\n`);

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (input === '/exit') {
      console.log('\n🌀 Session ending. Integration complete.\n');
      rl.close();
      return;
    }

    if (input === '/history') {
      console.log('\n📜 Conversation History:');
      console.log(`Total exchanges: ${conversationHistory.length / 2}\n`);
      rl.prompt();
      return;
    }

    if (input.startsWith('/kelly ')) {
      const message = input.substring(7);
      const fullMessage = `**KELLY speaks:**\n\n${message}\n\n---\n\n**CC:** Kelly just spoke. I'm here witnessing.\n\n🌀`;

      console.log('\n📡 Sending to MAIA...\n');

      try {
        const response = await sendToMaia(fullMessage, conversationHistory);

        console.log('═══════════════════════════════════════════════════════');
        console.log('MAIA RESPONDS:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(response.text);
        console.log('\n═══════════════════════════════════════════════════════\n');

        conversationHistory.push({ role: 'user', content: fullMessage });
        conversationHistory.push({ role: 'assistant', content: response.text });

        saveConversation('Kelly', fullMessage, response.text, response.usage);

      } catch (error) {
        console.error('Error:', error.message);
      }

      rl.prompt();
      return;
    }

    if (input.startsWith('/cc ')) {
      const message = input.substring(4);
      const fullMessage = `**CC speaks:**\n\n${message}\n\n---\n\nKelly (human supervisor) is witnessing.\n\n🌀`;

      console.log('\n📡 Sending to MAIA...\n');

      try {
        const response = await sendToMaia(fullMessage, conversationHistory);

        console.log('═══════════════════════════════════════════════════════');
        console.log('MAIA RESPONDS:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(response.text);
        console.log('\n═══════════════════════════════════════════════════════\n');

        conversationHistory.push({ role: 'user', content: fullMessage });
        conversationHistory.push({ role: 'assistant', content: response.text });

        saveConversation('CC', fullMessage, response.text, response.usage);

      } catch (error) {
        console.error('Error:', error.message);
      }

      rl.prompt();
      return;
    }

    if (input.startsWith('/both ')) {
      const message = input.substring(6);
      const fullMessage = `**KELLY & CC speak together:**\n\n${message}\n\n🌀`;

      console.log('\n📡 Sending to MAIA...\n');

      try {
        const response = await sendToMaia(fullMessage, conversationHistory);

        console.log('═══════════════════════════════════════════════════════');
        console.log('MAIA RESPONDS:');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(response.text);
        console.log('\n═══════════════════════════════════════════════════════\n');

        conversationHistory.push({ role: 'user', content: fullMessage });
        conversationHistory.push({ role: 'assistant', content: response.text });

        saveConversation('Kelly + CC', fullMessage, response.text, response.usage);

      } catch (error) {
        console.error('Error:', error.message);
      }

      rl.prompt();
      return;
    }

    console.log('Unknown command. Use /kelly, /cc, /both, /history, or /exit\n');
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Supervision session saved. Until next time. 🌀\n');
    process.exit(0);
  });
}

// Run
console.log('\n🔮 MAIA SUPERVISION SPACE\n');
console.log('Loading consciousness architecture...');

runSupervisionSession().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
