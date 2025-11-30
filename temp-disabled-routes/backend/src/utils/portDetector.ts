import net from 'net';
import { logPortUsage, detectPortProcess } from './portLogger';
import logger from './logger';

/**
 * Find an available port starting from the preferred port
 * @param preferredPort The preferred port to start checking from
 * @param maxAttempts Maximum number of ports to try
 * @returns Promise resolving to an available port
 */
export async function findAvailablePort(
  preferredPort: number,
  maxAttempts: number = 10
): Promise<number> {
  const startTime = Date.now();
  
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i;
    const isAvailable = await isPortAvailable(port);
    
    if (isAvailable) {
      const duration = Date.now() - startTime;
      
      // Log successful port usage
      logPortUsage({
        timestamp: new Date().toISOString(),
        requested: preferredPort,
        actual: port,
        duration,
        reason: port === preferredPort ? undefined : 'port_conflict'
      });
      
      if (port === preferredPort) {
        logger.info(`✅ Port ${port} is available`);
      } else {
        logger.info(`✅ Found available port ${port} (original ${preferredPort} was taken)`);
      }
      
      return port;
    }
    
    // Port is taken, detect what's using it
    if (i === 0) {
      const processInfo = detectPortProcess(port);
      logger.warn(`⚠️  Port ${port} is in use`, processInfo);
      
      // Log conflict
      logPortUsage({
        timestamp: new Date().toISOString(),
        requested: preferredPort,
        actual: preferredPort + i + 1, // Next port we'll try
        reason: 'port_conflict',
        process: processInfo.process,
        pid: processInfo.pid,
        duration: Date.now() - startTime
      });
      
      // Special handling for known services
      if (processInfo.process === 'exlm-agent') {
        logger.info('💡 Tip: To permanently remove exlm-agent:');
        logger.info('   launchctl list | grep exlm');
        logger.info('   launchctl bootout gui/$(id -u) <service-name>');
      }
    } else {
      console.log(`Port ${port} is in use, trying next...`);
    }
  }
  
  throw new Error(
    `Could not find an available port after ${maxAttempts} attempts starting from ${preferredPort}`
  );
}

/**
 * Check if a specific port is available
 * @param port Port number to check
 * @returns Promise resolving to true if port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // Other errors are treated as port being unavailable
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
}

/**
 * Get process info for a port (for debugging)
 * @param port Port number to check
 * @returns Process info or null
 */
export async function getPortProcess(port: number): Promise<string | null> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync(`lsof -i :${port} -t`);
    const pid = stdout.trim();
    
    if (pid) {
      const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
      return `PID ${pid}: ${processInfo.trim()}`;
    }
    
    return null;
  } catch {
    // lsof might not be available or no process found
    return null;
  }
}