import { randomUUID } from 'crypto';

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// API Gateway client will be initialized per-request with correct endpoint
let apiGatewayClient: ApiGatewayManagementApiClient | null = null;

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const { routeKey, connectionId, requestContext } = event;
  const domainName = requestContext.domainName;
  const stage = requestContext.stage;
  const endpoint = `https://${domainName}/${stage}`;

  // Initialize API Gateway client with correct endpoint
  apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint,
  });

  try {
    switch (routeKey) {
      case '$connect':
        await handleConnect(connectionId);
        return { statusCode: 200 };

      case '$disconnect':
        await handleDisconnect(connectionId);
        return { statusCode: 200 };

      case '$default':
        await handleDefault(connectionId, event.body);
        return { statusCode: 200 };

      default:
        console.error(`Unknown route: ${routeKey}`);
        return { statusCode: 400 };
    }
  } catch (error) {
    console.error('Error handling WebSocket event:', error);
    return { statusCode: 500 };
  }
};

async function handleConnect(connectionId: string): Promise<void> {
  console.log(`Connection established: ${connectionId}`);
  // Connection is established, but we don't create a record until we receive an init message
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

  let message: any;
  try {
    message = JSON.parse(body);
  } catch (error) {
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

async function sendMessage(connectionId: string, message: any): Promise<void> {
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
  } catch (error: any) {
    if (error.statusCode === 410) {
      console.log(`Connection ${connectionId} is gone`);
    } else {
      console.error(`Error sending message to ${connectionId}:`, error);
      throw error;
    }
  }
}
