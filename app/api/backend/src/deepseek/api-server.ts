#!/usr/bin/env npx tsx
/**
 * DeepSeek API Server
 * RESTful API for local AI inference
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DeepSeekService } from './DeepSeekService';
import type { ChatMessage, CompletionOptions } from './DeepSeekService';

// API Request/Response types
interface CompletionRequest {
  prompt: string;
  options?: CompletionOptions;
}

interface ChatRequest {
  messages: ChatMessage[];
  options?: CompletionOptions;
}

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

// Create Express app
const app = express();
const port = parseInt(process.env.DEEPSEEK_PORT || '3333');

// Initialize DeepSeek service
const deepseek = new DeepSeekService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Error handler
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const response: ErrorResponse = {
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  };

  res.status(500).json(response);
};

/**
 * Health check endpoint
 */
app.get('/health', async (req: Request, res: Response) => {
  const status = deepseek.getStatus();
  
  res.json({
    status: status.available ? 'healthy' : 'unavailable',
    model: status.model,
    baseUrl: status.baseUrl,
    activeStreams: status.activeStreams,
    timestamp: new Date().toISOString(),
  });
});

/**
 * List available models
 */
app.get('/models', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const models = await deepseek.listModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
});

/**
 * Get model info
 */
app.get('/models/:model', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const info = await deepseek.getModelInfo(req.params.model);
    res.json(info);
  } catch (error) {
    next(error);
  }
});

/**
 * Text completion endpoint
 */
app.post('/complete', async (req: Request<{}, {}, CompletionRequest>, res: Response, next: NextFunction) => {
  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        code: 'MISSING_PROMPT',
      });
    }

    // Check if streaming is requested
    if (options.stream || req.headers.accept === 'text/event-stream') {
      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Stream the response
      for await (const chunk of deepseek.completeStream(prompt, options)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Regular completion
      const result = await deepseek.complete(prompt, options);
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Chat completion endpoint
 */
app.post('/chat', async (req: Request<{}, {}, ChatRequest>, res: Response, next: NextFunction) => {
  try {
    const { messages, options = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
        code: 'MISSING_MESSAGES',
      });
    }

    // Check if streaming is requested
    if (options.stream || req.headers.accept === 'text/event-stream') {
      // Set up SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Stream the response
      for await (const chunk of deepseek.chatStream(messages, options)) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Regular chat completion
      const result = await deepseek.chat(messages, options);
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Generate embeddings
 */
app.post('/embed', async (req: Request<{}, {}, { text: string }>, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text is required',
        code: 'MISSING_TEXT',
      });
    }

    const embedding = await deepseek.embed(text);
    res.json({ embedding });
  } catch (error) {
    next(error);
  }
});

/**
 * Pull a model
 */
app.post('/models/pull', async (req: Request<{}, {}, { model: string }>, res: Response, next: NextFunction) => {
  try {
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({
        error: 'Model name is required',
        code: 'MISSING_MODEL',
      });
    }

    // Set up SSE for progress updates
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Listen for progress events
    const progressHandler = (progress: any) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    };

    deepseek.on('download-progress', progressHandler);

    // Pull the model
    const success = await deepseek.ensureModel(model);

    // Clean up listener
    deepseek.off('download-progress', progressHandler);

    // Send completion
    res.write(`data: ${JSON.stringify({ done: true, success })}\n\n`);
    res.end();
  } catch (error) {
    next(error);
  }
});

/**
 * Update configuration
 */
app.post('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    deepseek.updateConfig(req.body);
    const status = deepseek.getStatus();
    res.json({ 
      message: 'Configuration updated',
      status,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Stop all streams
 */
app.post('/streams/stop', (req: Request, res: Response) => {
  deepseek.stopAllStreams();
  res.json({ message: 'All streams stopped' });
});

// Apply error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Check service availability
    const available = await deepseek.checkAvailability();
    
    if (!available) {
      console.warn('⚠️  DeepSeek model not available. Server will start but may not work correctly.');
      console.log('Run "ollama pull deepseek-coder:6.7b" to download the model.');
    }

    // Start listening
    app.listen(port, () => {
      console.log('\n╔═══════════════════════════════════════════════════════╗');
      console.log('║       🚀 DeepSeek API Server Running                 ║');
      console.log('╚═══════════════════════════════════════════════════════╝\n');
      console.log(`  Port: ${port}`);
      console.log(`  URL:  http://localhost:${port}`);
      console.log(`  Docs: http://localhost:${port}/health\n`);
      console.log('  Endpoints:');
      console.log('    GET  /health           - Health check');
      console.log('    GET  /models           - List models');
      console.log('    POST /complete         - Text completion');
      console.log('    POST /chat             - Chat completion');
      console.log('    POST /embed            - Generate embeddings');
      console.log('    POST /models/pull      - Download model');
      console.log('    POST /config           - Update config');
      console.log('    POST /streams/stop     - Stop all streams\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  deepseek.stopAllStreams();
  process.exit(0);
});

// Start the server
startServer();