import { useState, useCallback } from 'react';

export interface StreamMessage {
  type: 'delta' | 'done' | 'error' | 'meta';
  text?: string;
  reason?: string;
  metadata?: any;
}

export interface UseMaiaStreamResult {
  isStreaming: boolean;
  stream: (params: {
    userText: string;
    element: string;
    userId?: string;
    lang?: string;
  }) => Promise<string>;
  stopStream: () => void;
}

export function useMaiaStream(): UseMaiaStreamResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (controller) {
      controller.abort();
      setController(null);
    }
    setIsStreaming(false);
  }, [controller]);

  const streamMessage = useCallback(async (params: {
    userText: string;
    element: string;
    userId?: string;
    lang?: string;
  }): Promise<string> => {
    const { userText, element, userId = 'anonymous', lang = 'en-US' } = params;
    
    console.log('[MaiaStream] Starting stream request:', { 
      userText: userText.substring(0, 50) + '...', 
      element, 
      userId,
      timestamp: new Date().toISOString() 
    });
    
    // Stop any existing stream
    stopStream();
    
    const newController = new AbortController();
    setController(newController);
    setIsStreaming(true);
    
    try {
      // Determine backend URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
      
      // Create stream URL
      const streamUrl = `${backendUrl}/api/v1/converse/stream?` + 
        new URLSearchParams({
          element,
          userId,
          lang,
          q: userText
        });

      console.log('[MaiaStream] Making HTTP request to backend:', streamUrl);

      const response = await fetch(streamUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        signal: newController.signal
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const decoder = new TextDecoder();
      let fullMessage = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.text) {
                  fullMessage += data.text;
                }
                
                if (data.reason === 'complete') {
                  setIsStreaming(false);
                  return fullMessage;
                }
                
                if (data.reason === 'error') {
                  throw new Error('Stream ended with error');
                }
              } catch (parseError) {
                // Ignore parsing errors for partial data
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      setIsStreaming(false);
      return fullMessage;
      
    } catch (error: any) {
      setIsStreaming(false);
      setController(null);
      
      if (error.name === 'AbortError') {
        return ''; // Stream was cancelled
      }
      
      console.error('Maia stream error:', error);
      
      // Fallback to POST endpoint
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
        const fallbackResponse = await fetch(`${backendUrl}/api/v1/converse/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userText,
            element,
            userId,
            lang
          })
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback request failed: ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        return fallbackData.response?.text || 'I apologize, but I am having trouble connecting right now.';
        
      } catch (fallbackError) {
        console.error('Maia fallback error:', fallbackError);
        return 'I am experiencing technical difficulties. Please try again in a moment.';
      }
    }
  }, [controller, stopStream]);

  return {
    isStreaming,
    stream: streamMessage,
    stopStream
  };
}