export interface WebSocketMessage {
  type: 'ping' | 'pong' | 'init' | 'redirect' | 'error';
  requestId?: string;
  formId?: string;
  metadata?: Record<string, unknown>;
  redirectLink?: string;
  error?: string;
}

export interface RequestRecord {
  requestId: string;
  connectionId: string;
  status: 'pending' | 'completed' | 'failed';
  formData?: Record<string, unknown>;
  redirectLink?: string;
  createdAt: string;
  updatedAt: string;
  ttl: number;
}

export interface WebhookRequest {
  requestId: string;
  redirectLink: string;
  apiKey: string;
}
