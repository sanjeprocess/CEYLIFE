# WebSocket and Webhook Integration Guide

## Overview

This document explains the WebSocket and webhook infrastructure for CeyLife Forms, which enables asynchronous form submission workflows. The system allows the frontend to submit forms to a 3rd party API and receive redirect links via WebSocket when the webhook is called.

## Architecture

The system consists of:

1. **DynamoDB Table** (`ceylife-requests`): Stores request records with TTL (30 minutes)
2. **WebSocket API Gateway**: Handles real-time bidirectional communication
3. **WebSocket Connection Handler Lambda**: Manages WebSocket connections and creates request records
4. **Webhook Handler Lambda**: Processes webhook calls from 3rd party APIs and sends updates via WebSocket

## Flow Diagram

```
Frontend → WebSocket Connection → Lambda creates request record → Returns requestId
    ↓
Frontend submits form to 3rd party API (with requestId)
    ↓
3rd party API processes → Calls webhook endpoint
    ↓
Webhook Lambda → Updates DynamoDB → Sends redirectLink via WebSocket
    ↓
Frontend receives redirectLink → Redirects user
```

## Message Types

### Client → Server (Frontend → WebSocket API)

#### 1. Init Message
Creates a new request record and receives a `requestId`.

```json
{
  "type": "init",
  "formId": "declaration-of-good-health",
  "metadata": {
    "userId": "user123",
    "formVersion": "1.0"
  }
}
```

**Response:**
```json
{
  "type": "init",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 2. Ping Message
Keeps the WebSocket connection alive. Should be sent every 15 seconds.

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong"
}
```

### Server → Client (WebSocket API → Frontend)

#### 1. Redirect Message
Sent when the webhook receives a redirect link from the 3rd party API.

```json
{
  "type": "redirect",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "redirectLink": "https://example.com/sign-document"
}
```

#### 2. Error Message
Sent when an error occurs.

```json
{
  "type": "error",
  "error": "Invalid message format"
}
```

## Next.js Implementation

### 1. Install Dependencies

```bash
npm install ws
# or
npm install @types/ws  # if using TypeScript
```

### 2. Create WebSocket Hook

Create a custom hook to manage WebSocket connections:

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: 'ping' | 'pong' | 'init' | 'redirect' | 'error';
  requestId?: string;
  formId?: string;
  metadata?: Record<string, unknown>;
  redirectLink?: string;
  error?: string;
}

interface UseWebSocketOptions {
  url: string;
  onRedirect?: (redirectLink: string, requestId: string) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onRedirect,
  onError,
  autoReconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Start ping interval (every 30 seconds)
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'init':
              if (message.requestId) {
                setRequestId(message.requestId);
              }
              break;
            
            case 'redirect':
              if (message.redirectLink && message.requestId) {
                onRedirect?.(message.redirectLink, message.requestId);
              }
              break;
            
            case 'error':
              onError?.(message.error || 'Unknown error');
              break;
            
            case 'pong':
              // Ping response received, connection is alive
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          onError?.('Failed to parse message');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setRequestId(null);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Auto-reconnect if enabled
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError?.('Failed to establish connection');
    }
  }, [url, onRedirect, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setRequestId(null);
  }, []);

  const sendInit = useCallback((formId: string, metadata?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'init',
          formId,
          metadata,
        })
      );
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    requestId,
    sendInit,
    disconnect,
    reconnect: connect,
  };
}
```

### 3. Create Form Submission Component

Create a component that uses the WebSocket hook and handles form submission:

```typescript
// components/FormSubmissionWithWebSocket.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';

interface FormSubmissionWithWebSocketProps {
  formId: string;
  formData: Record<string, unknown>;
  thirdPartyApiUrl: string;
  websocketUrl: string;
  onSubmit?: (requestId: string) => void;
}

export function FormSubmissionWithWebSocket({
  formId,
  formData,
  thirdPartyApiUrl,
  websocketUrl,
  onSubmit,
}: FormSubmissionWithWebSocketProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const { isConnected, requestId: wsRequestId, sendInit } = useWebSocket({
    url: websocketUrl,
    onRedirect: (redirectLink, requestId) => {
      console.log('Received redirect link:', redirectLink);
      setIsSubmitting(false);
      // Redirect to the link
      router.push(redirectLink);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (wsRequestId) {
      setRequestId(wsRequestId);
    }
  }, [wsRequestId]);

  const handleSubmit = async () => {
    if (!isConnected) {
      setError('WebSocket not connected. Please wait...');
      return;
    }

    if (!requestId) {
      setError('Request ID not available. Please wait...');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Initialize WebSocket connection and get requestId
      if (!wsRequestId) {
        sendInit(formId, { timestamp: new Date().toISOString() });
        // Wait a bit for the requestId to be set
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!requestId) {
          throw new Error('Failed to get request ID');
        }
      }

      // Submit form to 3rd party API with requestId
      const response = await fetch(thirdPartyApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestId: requestId || wsRequestId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      onSubmit?.(requestId || wsRequestId || '');
      
      // Wait for redirect link via WebSocket
      // The redirect will be handled by the onRedirect callback
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {!isConnected && (
        <div className="text-yellow-600">
          Connecting to server...
        </div>
      )}
      
      {error && (
        <div className="text-red-600">
          Error: {error}
        </div>
      )}

      {isConnected && requestId && (
        <div className="text-green-600">
          Ready to submit (Request ID: {requestId})
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isConnected || !requestId || isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Form'}
      </button>

      {isSubmitting && (
        <div className="mt-4">
          <p>Waiting for redirect link...</p>
          <div className="animate-spin">⏳</div>
        </div>
      )}
    </div>
  );
}
```

### 4. Usage Example

```typescript
// pages/form-submit.tsx or app/form-submit/page.tsx
'use client';

import { FormSubmissionWithWebSocket } from '@/components/FormSubmissionWithWebSocket';
import { useState } from 'react';

export default function FormSubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // ... other form fields
  });

  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://your-api-id.execute-api.region.amazonaws.com/prod';
  const thirdPartyApiUrl = 'https://third-party-api.com/submit';

  return (
    <div>
      <h1>Submit Form</h1>
      
      {/* Your form fields */}
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />

      <FormSubmissionWithWebSocket
        formId="declaration-of-good-health"
        formData={formData}
        thirdPartyApiUrl={thirdPartyApiUrl}
        websocketUrl={websocketUrl}
        onSubmit={(requestId) => {
          console.log('Form submitted with requestId:', requestId);
        }}
      />
    </div>
  );
}
```

### 5. Environment Variables

Add to your `.env.local` or `.env`:

```env
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-api-id.execute-api.region.amazonaws.com/prod
NEXT_PUBLIC_THIRD_PARTY_API_URL=https://third-party-api.com/submit
```

## Webhook Integration

The webhook endpoint expects a POST request with the following format:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "redirectLink": "https://example.com/sign-document",
  "apiKey": "your-api-key-from-ssm"
}
```

### Webhook Endpoint

The webhook URL is available as a CloudFormation output after CDK deployment:
- Output name: `CeyLifeWebhookUrl`
- Or check the CDK stack outputs after deployment

### Response Codes

- `200`: Success - Request processed and WebSocket message sent
- `400`: Bad Request - Missing required fields or invalid JSON
- `401`: Unauthorized - Invalid API key
- `404`: Not Found - Request ID not found in DynamoDB
- `500`: Internal Server Error - Server-side error

## Error Handling

### WebSocket Connection Errors

- **Connection Lost**: The hook automatically attempts to reconnect
- **Timeout**: If no redirect link is received within 30 minutes, the request expires (TTL)
- **Invalid Message**: Error message is sent via WebSocket and handled by `onError` callback

### Form Submission Errors

- **WebSocket Not Connected**: Wait for connection before submitting
- **No Request ID**: Retry initialization
- **API Submission Failed**: Handle HTTP errors from 3rd party API
- **Redirect Link Not Received**: Check if request expired or connection was lost

## Best Practices

1. **Always check connection status** before submitting forms
2. **Implement retry logic** for failed submissions
3. **Handle timeouts** gracefully (30-minute TTL)
4. **Store requestId** in component state or context for reference
5. **Clean up WebSocket connections** when component unmounts
6. **Use environment variables** for WebSocket and API URLs
7. **Implement proper error boundaries** for production use

## Troubleshooting

### WebSocket Won't Connect

- Verify the WebSocket URL is correct (should start with `wss://`)
- Check CORS settings if connecting from browser
- Verify the API Gateway is deployed and accessible

### Request ID Not Received

- Ensure WebSocket connection is established before calling `sendInit`
- Check browser console for WebSocket errors
- Verify Lambda function logs in CloudWatch

### Redirect Link Not Received

- Check if webhook was called successfully
- Verify the requestId matches between frontend and webhook
- Check DynamoDB table for the request record
- Review Lambda function logs for errors

### Connection Drops Frequently

- Implement exponential backoff for reconnection
- Check network stability
- Verify ping/pong is working (should see pong responses)

## Security Considerations

1. **WebSocket URL**: Can be public (connectionId is unique per connection)
2. **API Key**: Stored in AWS SSM Parameter Store (SecureString)
3. **Request Validation**: Webhook validates API key before processing
4. **TTL**: Requests expire after 30 minutes automatically
5. **HTTPS/WSS**: Always use secure connections in production

## CDK Stack Outputs

After deploying the CDK stack, you'll get these outputs:

- `CeyLifeWebSocketEndpoint`: WebSocket API endpoint URL
- `CeyLifeWebhookUrl`: Webhook endpoint URL
- `CeyLifeRequestsTableName`: DynamoDB table name

Use these values in your Next.js environment variables.
