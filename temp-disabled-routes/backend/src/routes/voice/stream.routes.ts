import { Router, Request, Response } from 'express';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import { ttsOrchestrator } from '../../services/TTSOrchestrator';

const router = Router();

// Setup multer for handling audio uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

/**
 * POST /api/oracle/voice/transcribe/stream
 * Streaming speech-to-text endpoint for real-time transcription
 */
router.post('/transcribe/stream', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    console.log('[Voice Stream] Starting transcription stream...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Setup timeout protection (30 seconds)
    const timeout = setTimeout(() => {
      console.warn('[Voice Stream] Request timeout after 30s');
      if (!res.headersSent) {
        res.status(408).json({ error: 'Request timeout' });
      }
    }, 30000);

    try {
      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: 'audio.webm',
        contentType: req.file.mimetype
      });
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json'); // Get timestamps for streaming
      formData.append('language', 'en'); // Can be made configurable

      console.log('[Voice Stream] Sending to Whisper API...');

      // Send to OpenAI Whisper API
      const whisperResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 25000 // Leave 5s buffer for our timeout
      });

      clearTimeout(timeout);

      const transcription = whisperResponse.data;
      
      console.log('[Voice Stream] Transcription received:', {
        text: transcription.text?.substring(0, 100) + '...',
        duration: transcription.duration,
        segments: transcription.segments?.length
      });

      // If we have segments, stream them as interim results
      if (transcription.segments && transcription.segments.length > 0) {
        for (const segment of transcription.segments) {
          // Send interim transcript chunk
          res.write(JSON.stringify({
            type: 'interim',
            text: segment.text,
            confidence: segment.avg_logprob,
            start: segment.start,
            end: segment.end
          }) + '\n');
          
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Send final transcript
      res.write(JSON.stringify({
        type: 'final',
        text: transcription.text,
        duration: transcription.duration,
        language: transcription.language
      }) + '\n');

      res.end();

    } catch (whisperError: any) {
      clearTimeout(timeout);
      console.error('[Voice Stream] Whisper API error:', whisperError.message);
      
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Transcription failed',
          details: whisperError.response?.data || whisperError.message
        });
      }
    }

  } catch (error: any) {
    console.error('[Voice Stream] Route error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

/**
 * GET /api/oracle/voice/health/stt
 * Health check for speech-to-text service
 */
router.get('/health/stt', async (req: Request, res: Response) => {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'OpenAI API key not configured'
      });
    }

    // Test connection to OpenAI API
    const testResponse = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      timeout: 5000
    });

    res.json({
      status: 'healthy',
      whisper: 'available',
      models: testResponse.data.data?.filter((model: any) => 
        model.id.includes('whisper')
      ).map((model: any) => model.id) || []
    });

  } catch (error: any) {
    console.error('[Voice Health] STT health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Unable to connect to Whisper API',
      details: error.message
    });
  }
});

/**
 * GET /api/oracle/voice/health/tts
 * Health check for text-to-speech orchestrator
 */
router.get('/health/tts', async (req: Request, res: Response) => {
  try {
    const healthStatus = ttsOrchestrator.getHealthStatus();
    
    // Determine overall status
    let overallStatus = 'healthy';
    if (!healthStatus.sesame.available && !healthStatus.elevenlabs.available) {
      overallStatus = 'unhealthy';
    } else if (!healthStatus.sesame.available && healthStatus.elevenlabs.available) {
      overallStatus = 'degraded';
    }

    res.json({
      status: overallStatus,
      services: {
        sesame: {
          status: healthStatus.sesame.available ? 'healthy' : 'failed',
          configured: healthStatus.sesame.configured,
          lastCheck: new Date(healthStatus.sesame.lastCheck).toISOString()
        },
        elevenlabs: {
          status: healthStatus.elevenlabs.available ? 'healthy' : 'failed', 
          configured: healthStatus.elevenlabs.configured,
          lastCheck: new Date(healthStatus.elevenlabs.lastCheck).toISOString()
        },
        mock: {
          status: 'always_available',
          enabled: false
        }
      },
      fallback: healthStatus.fallbackEnabled,
      cache: {
        enabled: healthStatus.cacheEnabled,
        size: healthStatus.cacheSize
      }
    });

  } catch (error: any) {
    console.error('[Voice Health] TTS health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      error: 'TTS orchestrator error',
      details: error.message
    });
  }
});

export default router;