/** Error body returned by every VYRO API error (see BackEnd AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  path?: string;
  timestamp?: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  version: string;
  uptime: number;
  timestamp: string;
}
