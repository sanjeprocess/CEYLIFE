import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Handler } from 'aws-lambda';

import { WebhookRequest } from '../shared/types.js';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ssmClient = new SSMClient({});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;
const WEBSOCKET_API_ENDPOINT = process.env.WEBSOCKET_API_ENDPOINT!;
const API_KEY_PARAMETER_NAME = process.env.API_KEY_PARAMETER_NAME || '/ceylife/webhook-api-key';

const apiGatewayClient = new ApiGatewayManagementApiClient({
  endpoint: WEBSOCKET_API_ENDPOINT.replace('wss://', 'https://').replace('ws://', 'http://'),
});

interface WebhookEvent {
  body: string;
}

interface WebhookResponse {
  statusCode: number;
  body: string;
}

export const handler: Handler<WebhookEvent, WebhookResponse> = async (event: WebhookEvent) => {
  try {
    // Parse request body
    let body: WebhookRequest;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate required fields
    if (!body.requestId || !body.redirectLink || !body.apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: requestId, redirectLink, apiKey' }),
      };
    }

    // Validate API key
    const isValidApiKey = await validateApiKey(body.apiKey);
    if (!isValidApiKey) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid API key' }),
      };
    }

    const { requestId, redirectLink } = body;

    // Get request record from DynamoDB
    const getResult = await dynamoClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { requestId },
      })
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Request not found' }),
      };
    }

    const connectionId = getResult.Item.connectionId;

    // Update DynamoDB record
    const now = new Date().toISOString();
    await dynamoClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { requestId },
        UpdateExpression: 'SET #status = :status, redirectLink = :redirectLink, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'completed',
          ':redirectLink': redirectLink,
          ':updatedAt': now,
        },
      })
    );

    // Send WebSocket message to frontend
    try {
      await apiGatewayClient.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(
            JSON.stringify({
              type: 'redirect',
              requestId,
              redirectLink,
            })
          ),
        })
      );
    } catch (wsError: unknown) {
      // If WebSocket connection is gone, that's okay - the redirectLink is stored in DynamoDB
      if (wsError instanceof Error && 'statusCode' in wsError && wsError.statusCode === 410) {
        console.log(`Connection ${connectionId} is gone, but redirectLink stored in DynamoDB`);
      } else {
        console.error(`Error sending WebSocket message:`, wsError);
        // Still return success since we updated DynamoDB
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, requestId }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function validateApiKey(providedKey: string): Promise<boolean> {
  try {
    const result = await ssmClient.send(
      new GetParameterCommand({
        Name: API_KEY_PARAMETER_NAME,
        WithDecryption: true,
      })
    );

    return result.Parameter?.Value === providedKey;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
}
