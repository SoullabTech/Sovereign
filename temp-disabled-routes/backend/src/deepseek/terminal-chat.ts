#!/usr/bin/env npx tsx
/**
 * DeepSeek Terminal Chat Interface
 * Privacy-first local AI assistant via Ollama
 */

import * as readline from 'readline/promises';
import chalk from 'chalk';
import ora from 'ora';
import { Ollama } from 'ollama';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Terminal colors and styling
const styles = {
  header: chalk.cyan.bold,
  user: chalk.blue.bold,
  ai: chalk.green.bold,
  system: chalk.gray,
  error: chalk.red.bold,
  warning: chalk.yellow,
  info: chalk.cyan,
  code: chalk.magenta,
  success: chalk.green,
};

// Configuration
interface DeepSeekConfig {
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
  contextWindow: number;
}

// Chat message
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

// Chat session
class DeepSeekChat {
  private ollama: Ollama;
  private config: DeepSeekConfig;
  private messages: Message[] = [];
  private rl: readline.Interface;
  private spinner: ora.Ora;

  constructor(config: Partial<DeepSeekConfig> = {}) {
    this.config = {
      model: process.env.DEEPSEEK_MODEL || 'deepseek-coder:6.7b',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'http://localhost:11434',
      temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4096'),
      stream: process.env.DEEPSEEK_STREAM !== 'false',
      contextWindow: 8192,
      ...config,
    };

    this.ollama = new Ollama({
      host: this.config.baseUrl,
    });

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    this.spinner = ora({
      spinner: 'dots',
      color: 'cyan',
    });
  }

  // Display welcome message
  private showWelcome(): void {
    console.clear();
    console.log(styles.header('\n╔═══════════════════════════════════════════════════════╗'));
    console.log(styles.header('║       🧠 DeepSeek Local AI Chat Interface            ║'));
    console.log(styles.header('║         Privacy-First • Offline • Powerful           ║'));
    console.log(styles.header('╚═══════════════════════════════════════════════════════╝\n'));

    console.log(styles.info(`Model: ${this.config.model}`));
    console.log(styles.info(`Endpoint: ${this.config.baseUrl}`));
    console.log(styles.system(`Context: ${this.config.contextWindow} tokens\n`));

    this.showCommands();
  }

  // Show available commands
  private showCommands(): void {
    console.log(styles.header('Commands:'));
    console.log(styles.system('  /help     - Show this help'));
    console.log(styles.system('  /clear    - Clear conversation'));
    console.log(styles.system('  /save     - Save conversation'));
    console.log(styles.system('  /load     - Load conversation'));
    console.log(styles.system('  /model    - Switch model'));
    console.log(styles.system('  /system   - Set system prompt'));
    console.log(styles.system('  /stats    - Show session stats'));
    console.log(styles.system('  /exit     - Exit chat'));
    console.log(styles.system('  /quit     - Exit chat\n'));
  }

  // Check if Ollama is running
  private async checkOllama(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Ensure model is available
  private async ensureModel(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      const modelExists = models.models.some(m => 
        m.name === this.config.model || 
        m.name.startsWith(this.config.model.split(':')[0])
      );

      if (!modelExists) {
        console.log(styles.warning(`\n⚠️  Model ${this.config.model} not found locally.`));
        const pull = await this.rl.question('Would you like to download it? (y/n): ');
        
        if (pull.toLowerCase() === 'y') {
          console.log(styles.info(`\nDownloading ${this.config.model}...`));
          this.spinner.start('Pulling model...');
          
          await this.ollama.pull({ 
            model: this.config.model,
            stream: true,
          });
          
          this.spinner.succeed('Model downloaded successfully!');
          return true;
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error(styles.error('Failed to check model:'), error);
      return false;
    }
  }

  // Process user input
  private async processInput(input: string): Promise<boolean> {
    const trimmed = input.trim();

    // Handle commands
    if (trimmed.startsWith('/')) {
      return await this.handleCommand(trimmed);
    }

    // Handle regular message
    if (trimmed) {
      await this.sendMessage(trimmed);
    }

    return true; // Continue chat
  }

  // Handle chat commands
  private async handleCommand(command: string): Promise<boolean> {
    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case '/exit':
      case '/quit':
        return false; // Exit chat

      case '/help':
        this.showCommands();
        break;

      case '/clear':
        this.messages = [];
        console.clear();
        this.showWelcome();
        console.log(styles.success('✅ Conversation cleared\n'));
        break;

      case '/save':
        await this.saveConversation(args[0]);
        break;

      case '/load':
        await this.loadConversation(args[0]);
        break;

      case '/model':
        await this.switchModel(args.join(' '));
        break;

      case '/system':
        await this.setSystemPrompt(args.join(' '));
        break;

      case '/stats':
        this.showStats();
        break;

      default:
        console.log(styles.warning(`Unknown command: ${cmd}`));
        console.log(styles.system('Type /help for available commands\n'));
    }

    return true; // Continue chat
  }

  // Send message to AI
  private async sendMessage(content: string): Promise<void> {
    // Add user message
    this.messages.push({
      role: 'user',
      content,
      timestamp: new Date(),
    });

    // Trim context if needed
    this.trimContext();

    try {
      if (this.config.stream) {
        await this.streamResponse();
      } else {
        await this.getResponse();
      }
    } catch (error) {
      console.error(styles.error('\n❌ Error:'), error);
    }
  }

  // Stream response from AI
  private async streamResponse(): Promise<void> {
    console.log(styles.ai('\n🤖 DeepSeek:'), '');
    
    const response = await this.ollama.chat({
      model: this.config.model,
      messages: this.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
      stream: true,
    });

    let fullResponse = '';
    for await (const part of response) {
      process.stdout.write(part.message.content);
      fullResponse += part.message.content;
    }
    console.log('\n');

    // Add assistant message
    this.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
    });
  }

  // Get non-streaming response
  private async getResponse(): Promise<void> {
    this.spinner.start('Thinking...');

    const response = await this.ollama.chat({
      model: this.config.model,
      messages: this.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
      },
      stream: false,
    });

    this.spinner.stop();

    console.log(styles.ai('\n🤖 DeepSeek:'), response.message.content, '\n');

    // Add assistant message
    this.messages.push({
      role: 'assistant',
      content: response.message.content,
      timestamp: new Date(),
    });
  }

  // Trim conversation context
  private trimContext(): void {
    // Simple token estimation (rough)
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    
    let totalTokens = 0;
    let trimIndex = this.messages.length;

    // Count from most recent
    for (let i = this.messages.length - 1; i >= 0; i--) {
      totalTokens += estimateTokens(this.messages[i].content);
      if (totalTokens > this.config.contextWindow * 0.8) {
        trimIndex = i + 1;
        break;
      }
    }

    // Keep system message if present
    const systemMsg = this.messages.find(m => m.role === 'system');
    if (trimIndex > 0 && systemMsg) {
      this.messages = [systemMsg, ...this.messages.slice(trimIndex)];
    } else if (trimIndex > 0) {
      this.messages = this.messages.slice(trimIndex);
    }
  }

  // Save conversation
  private async saveConversation(filename?: string): Promise<void> {
    const name = filename || `chat_${Date.now()}.json`;
    const filepath = path.join(process.cwd(), 'chats', name);

    try {
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, JSON.stringify({
        model: this.config.model,
        timestamp: new Date(),
        messages: this.messages,
      }, null, 2));

      console.log(styles.success(`✅ Conversation saved to: ${filepath}\n`));
    } catch (error) {
      console.error(styles.error('Failed to save:'), error);
    }
  }

  // Load conversation
  private async loadConversation(filename?: string): Promise<void> {
    if (!filename) {
      console.log(styles.warning('Please specify a filename\n'));
      return;
    }

    const filepath = path.join(process.cwd(), 'chats', filename);

    try {
      const data = await fs.readFile(filepath, 'utf-8');
      const saved = JSON.parse(data);
      
      this.messages = saved.messages;
      console.log(styles.success(`✅ Loaded ${saved.messages.length} messages\n`));
    } catch (error) {
      console.error(styles.error('Failed to load:'), error);
    }
  }

  // Switch model
  private async switchModel(modelName?: string): Promise<void> {
    if (!modelName) {
      // Show available models
      const models = await this.ollama.list();
      console.log(styles.header('\nAvailable models:'));
      models.models.forEach(m => {
        const size = (m.size / 1e9).toFixed(1) + 'GB';
        console.log(styles.system(`  • ${m.name} (${size})`));
      });
      console.log();
      return;
    }

    this.config.model = modelName;
    const available = await this.ensureModel();
    
    if (available) {
      console.log(styles.success(`✅ Switched to model: ${modelName}\n`));
    }
  }

  // Set system prompt
  private async setSystemPrompt(prompt?: string): Promise<void> {
    if (!prompt) {
      const input = await this.rl.question('System prompt: ');
      prompt = input;
    }

    // Remove existing system message
    this.messages = this.messages.filter(m => m.role !== 'system');
    
    // Add new system message at beginning
    this.messages.unshift({
      role: 'system',
      content: prompt,
      timestamp: new Date(),
    });

    console.log(styles.success('✅ System prompt updated\n'));
  }

  // Show statistics
  private showStats(): void {
    const userMessages = this.messages.filter(m => m.role === 'user').length;
    const assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
    const totalChars = this.messages.reduce((sum, m) => sum + m.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    console.log(styles.header('\n📊 Session Statistics:'));
    console.log(styles.system(`  User messages:      ${userMessages}`));
    console.log(styles.system(`  Assistant messages: ${assistantMessages}`));
    console.log(styles.system(`  Total characters:   ${totalChars.toLocaleString()}`));
    console.log(styles.system(`  Estimated tokens:   ${estimatedTokens.toLocaleString()}`));
    console.log(styles.system(`  Context usage:      ${Math.round(estimatedTokens / this.config.contextWindow * 100)}%\n`));
  }

  // Main chat loop
  public async start(): Promise<void> {
    // Check Ollama service
    if (!await this.checkOllama()) {
      console.error(styles.error('\n❌ Ollama is not running!'));
      console.log(styles.warning('Please start Ollama with: ollama serve\n'));
      process.exit(1);
    }

    // Ensure model exists
    if (!await this.ensureModel()) {
      console.error(styles.error('\n❌ Model not available'));
      process.exit(1);
    }

    // Show welcome
    this.showWelcome();

    // Main loop
    let running = true;
    while (running) {
      const input = await this.rl.question(styles.user('You> '));
      running = await this.processInput(input);
    }

    // Cleanup
    console.log(styles.success('\n👋 Goodbye! Thanks for using DeepSeek Local AI.\n'));
    this.rl.close();
  }
}

// Load environment variables
async function loadEnv(): Promise<void> {
  try {
    const envPath = path.join(process.cwd(), '.env.deepseek');
    const envContent = await fs.readFile(envPath, 'utf-8');
    
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  } catch {
    // Silent fail - use defaults
  }
}

// Main entry point
async function main() {
  await loadEnv();
  
  const chat = new DeepSeekChat();
  await chat.start();
}

// Handle exit gracefully
process.on('SIGINT', () => {
  console.log(styles.success('\n\n👋 Goodbye!\n'));
  process.exit(0);
});

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DeepSeekChat };