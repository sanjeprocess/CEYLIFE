import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { config } from 'dotenv';

config();

const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY!;
if (!WEBHOOK_API_KEY) {
  throw new Error('WEBHOOK_API_KEY is not set');
}

export class SignStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create DynamoDB table
    const requestsTable = new dynamodb.Table(this, 'CeylifeRequestsTable', {
      tableName: 'ceylife-requests',
      partitionKey: { name: 'requestId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // 2. Create WebSocket API Gateway
    const webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: 'ceylife-websocket-api',
      description: 'WebSocket API for CeyLife form submissions',
    });

    const webSocketStage = new apigatewayv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // 3. Create WebSocket connection handler Lambda
    const websocketHandler = new lambdaNodejs.NodejsFunction(this, 'WebSocketConnectionHandler', {
      functionName: 'ceylife-websocket-connection-handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/websocket-connection-handler/index.ts',
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node20',
        format: lambdaNodejs.OutputFormat.ESM,
        esbuildArgs: {
          '--platform': 'node',
        },
        forceDockerBundling: false,
      },
      environment: {
        DYNAMODB_TABLE_NAME: requestsTable.tableName,
        WEBSOCKET_API_ENDPOINT: `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${webSocketStage.stageName}`,
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Grant permissions to WebSocket handler
    requestsTable.grantReadWriteData(websocketHandler);
    webSocketApi.grantManageConnections(websocketHandler);

    // Connect Lambda to WebSocket API routes
    webSocketApi.addRoute('$connect', {
      integration: new apigatewayv2Integrations.WebSocketLambdaIntegration('ConnectIntegration', websocketHandler),
    });

    webSocketApi.addRoute('$disconnect', {
      integration: new apigatewayv2Integrations.WebSocketLambdaIntegration('DisconnectIntegration', websocketHandler),
    });

    webSocketApi.addRoute('$default', {
      integration: new apigatewayv2Integrations.WebSocketLambdaIntegration('DefaultIntegration', websocketHandler),
    });

    // 4. Create Webhook handler Lambda
    const webhookHandler = new lambdaNodejs.NodejsFunction(this, 'WebhookHandler', {
      functionName: 'ceylife-webhook-handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lambda/webhook-handler/index.ts',
      handler: 'handler',
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node20',
        format: lambdaNodejs.OutputFormat.ESM,
        esbuildArgs: {
          '--platform': 'node',
        },
        forceDockerBundling: false,
      },
      environment: {
        DYNAMODB_TABLE_NAME: requestsTable.tableName,
        WEBSOCKET_API_ENDPOINT: `https://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${webSocketStage.stageName}`,
        API_KEY_PARAMETER_NAME: '/ceylife/webhook-api-key',
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Grant permissions to Webhook handler
    requestsTable.grantReadWriteData(webhookHandler);
    webSocketApi.grantManageConnections(webhookHandler);
    webhookHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/ceylife/webhook-api-key`,
        ],
      })
    );

    // Create Lambda Function URL for webhook
    const webhookUrl = webhookHandler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['Content-Type'],
      },
    });

    // 5. Create SSM Parameter for API key (with placeholder value - should be updated manually)
    new ssm.StringParameter(this, 'WebhookApiKey', {
      parameterName: '/ceylife/webhook-api-key',
      description: 'API key for webhook authentication',
      stringValue: WEBHOOK_API_KEY,
      type: ssm.ParameterType.STRING,
    });

    // Outputs
    new cdk.CfnOutput(this, 'WebSocketApiEndpoint', {
      value: `wss://${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${webSocketStage.stageName}`,
      description: 'WebSocket API endpoint URL',
      exportName: 'CeyLifeWebSocketEndpoint',
    });

    new cdk.CfnOutput(this, 'WebhookUrl', {
      value: webhookUrl.url,
      description: 'Webhook endpoint URL',
      exportName: 'CeyLifeWebhookUrl',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: requestsTable.tableName,
      description: 'DynamoDB table name',
      exportName: 'CeyLifeRequestsTableName',
    });
  }
}
