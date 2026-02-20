import { randomUUID } from 'crypto';

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// API Gateway client will be initialized per-request with correct endpoint
let apiGatewayClient: ApiGatewayManagementApiClient | null = null;

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  // Log the entire event for debugging
  console.log('Full WebSocket event:', JSON.stringify(event, null, 2));
  
  const requestContext = event.requestContext;
  const routeKey = requestContext.routeKey;
  const connectionId = requestContext.connectionId;
  const domainName = requestContext.domainName;
  const stage = requestContext.stage;
  
  console.log(`WebSocket event received: routeKey=${routeKey}, connectionId=${connectionId}`);

  // If routeKey is undefined but we have a connectionId, it's likely a $connect event
  if (!routeKey && connectionId) {
    console.log('RouteKey is undefined, treating as $connect event');
    try {
      await handleConnect(connectionId);
    } catch (error) {
      console.error(`Error in handleConnect, but allowing connection:`, error);
    }
    return { statusCode: 200 };
  }

  if (!connectionId) {
    console.error('Missing connectionId in requestContext');
    return { statusCode: 400 };
  }

  try {
    if (!domainName || !stage) {
      console.error('Missing domainName or stage in requestContext');
      // Still allow connection if we have connectionId
      return { statusCode: 200 };
    }
    
    const endpoint = `https://${domainName}/${stage}`;

    // Initialize API Gateway client with correct endpoint
    apiGatewayClient = new ApiGatewayManagementApiClient({
      endpoint,
    });

    switch (routeKey) {
      case '$connect':
        // Always allow connection - even if handleConnect fails, we want to accept the connection
        try {
          await handleConnect(connectionId);
        } catch (error) {
          console.error(`Error in handleConnect, but allowing connection:`, error);
          // Continue - we still want to allow the connection
        }
        return { statusCode: 200 };

      case '$disconnect':
        try {
          await handleDisconnect(connectionId);
        } catch (error) {
          console.error(`Error in handleDisconnect:`, error);
          // Don't fail disconnect even if there's an error
        }
        return { statusCode: 200 };

      case '$default':
        try {
          await handleDefault(connectionId, event.body || null);
        } catch (error) {
          console.error(`Error in handleDefault:`, error);
          // Try to send error message to client
          try {
            await sendMessage(connectionId, { type: 'error', error: 'Internal server error' });
          } catch (sendError) {
            console.error(`Failed to send error message:`, sendError);
          }
        }
        return { statusCode: 200 };

      default:
        console.error(`Unknown route: ${routeKey}. Full event:`, JSON.stringify(event, null, 2));
        // If we have a connectionId but unknown route, still allow connection
        if (!routeKey) {
          console.log('Allowing connection with undefined routeKey');
          return { statusCode: 200 };
        }
        return { statusCode: 400 };
    }
  } catch (error) {
    console.error('Critical error handling WebSocket event:', error);
    // For $connect or undefined routeKey with connectionId, we should still try to return 200
    if (routeKey === '$connect' || (!routeKey && connectionId)) {
      console.log('Allowing connection despite error');
      return { statusCode: 200 };
    }
    return { statusCode: 500 };
  }
};

async function handleConnect(connectionId: string): Promise<void> {
  try {
    console.log(`Connection established: ${connectionId}`);
    // Connection is established, but we don't create a record until we receive an init message
    // Return success - connection is allowed
  } catch (error) {
    console.error(`Error in handleConnect for ${connectionId}:`, error);
    throw error; // Re-throw to let the handler catch it
  }
}

async function handleDisconnect(connectionId: string): Promise<void> {
  console.log(`Connection disconnected: ${connectionId}`);
  // Optionally update status of any pending requests for this connection
  // For now, we'll let TTL handle cleanup
}

async function handleDefault(connectionId: string, body: string | null): Promise<void> {
  if (!body) {
    await sendMessage(connectionId, { type: 'error', error: 'Empty message body' });
    return;
  }

  let message: { type?: string; formId?: string; metadata?: Record<string, unknown> };
  try {
    message = JSON.parse(body) as { type?: string; formId?: string; metadata?: Record<string, unknown> };
  } catch {
    await sendMessage(connectionId, { type: 'error', error: 'Invalid JSON message' });
    return;
  }

  if (message.type === 'ping') {
    // Respond to ping with pong
    await sendMessage(connectionId, { type: 'pong' });
    return;
  }

  if (message.type === 'init') {
    // Create request record
    const requestId = randomUUID();
    const now = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 1800; // 30 minutes from now

    await dynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          requestId,
          connectionId,
          status: 'pending',
          formData: message.metadata || {},
          createdAt: now,
          updatedAt: now,
          ttl,
        },
      })
    );

    await sendMessage(connectionId, {
      type: 'init',
      requestId,
    });
    return;
  }

  // Unknown message type
  await sendMessage(connectionId, { type: 'error', error: `Unknown message type: ${message.type}` });
}

async function sendMessage(connectionId: string, message: Record<string, unknown>): Promise<void> {
  if (!apiGatewayClient) {
    throw new Error('API Gateway client not initialized');
  }

  try {
    await apiGatewayClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(message)),
      })
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 410) {
      console.log(`Connection ${connectionId} is gone`);
    } else {
      console.error(`Error sending message to ${connectionId}:`, error);
      throw error;
    }
  }
}
