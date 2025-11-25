import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface HealthStatus {
  success: boolean;
  service: string;
  status: string;
  pipeline: string;
  features: Record<string, boolean>;
  models: Record<string, string>;
  apiKeys: Record<string, boolean>;
}

interface StatusBannerProps {
  backendUrl?: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function StatusBanner({ 
  backendUrl = '/api/backend',
  className = '',
  autoRefresh = true,
  refreshInterval = 30000 
}: StatusBannerProps) {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'warning' | 'error'>('loading');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/converse/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const healthData: HealthStatus = await response.json();
      setHealth(healthData);
      setLastCheck(new Date());

      // Determine status based on health data
      if (!healthData.success) {
        setStatus('error');
      } else if (!healthData.apiKeys.anthropic || !healthData.apiKeys.openai) {
        setStatus('warning');
      } else {
        setStatus('healthy');
      }

    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('error');
      setHealth(null);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkHealth();

    if (autoRefresh) {
      const interval = setInterval(checkHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [backendUrl, autoRefresh, refreshInterval]);

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return health?.pipeline === 'sesame-maya' ? 'Maya Online' : 'System Online';
      case 'warning':
        return 'Limited Service';
      case 'error':
        return 'Service Offline';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getTooltipContent = () => {
    if (!health) return 'Unable to connect to backend service';
    
    const features = Object.entries(health.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => feature);
    
    const issues = [];
    if (!health.apiKeys.anthropic) issues.push('Claude unavailable');
    if (!health.apiKeys.openai) issues.push('OpenAI unavailable');
    
    return `Pipeline: ${health.pipeline}
Features: ${features.join(', ')}
${issues.length > 0 ? `Issues: ${issues.join(', ')}` : ''}
Last check: ${lastCheck?.toLocaleTimeString() || 'Never'}`;
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium cursor-pointer transition-colors ${getStatusColor()} ${className}`}
      title={getTooltipContent()}
      onClick={checkHealth}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {health && (
        <span className="text-xs opacity-70">
          {health.models.air === 'claude-3-5-sonnet' ? '🧠' : '⚡'}{health.features.streaming ? '📡' : ''}
        </span>
      )}
    </div>
  );
}

export default StatusBanner;