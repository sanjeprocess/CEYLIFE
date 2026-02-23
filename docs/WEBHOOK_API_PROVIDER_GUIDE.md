# Webhook Integration Guide for API Providers

## Overview

This document describes how to integrate with CeyLife Forms' webhook system to provide redirect links for document signing workflows. When a form is submitted with a `requestId`, your API should process the submission and call our webhook endpoint with the signing redirect link.

## Integration Flow

```
1. User submits form → CeyLife frontend sends form data to your API (includes requestId)
2. Your API processes the form submission
3. Your API generates a signing link/document
4. Your API calls CeyLife webhook endpoint with requestId + redirectLink
5. CeyLife webhook sends redirectLink to user's browser via WebSocket
6. User is automatically redirected to signing page
```

## Webhook Endpoint

**URL:** `https://x6ie4tyaplrwqelcxnaafxk4zy0ltmjo.lambda-url.ap-south-1.on.aws`

**Method:** `POST`

**Content-Type:** `application/json`

## Request Format

### Required Fields

- `requestId` (string): The unique request identifier received in the form submission
- `redirectLink` (string): Full URL (with protocol) to the document signing page
- `apiKey` (string): API key provided by CeyLife for authentication

### Request Body Example

```json
{
  "requestId": "1402ddf2-319e-40f0-8f98-58fe9e1de5bb",
  "redirectLink": "https://sign-url.example.com/document/abc123?token=xyz",
  "apiKey": "your-api-key-here"
}
```

### cURL Example

```bash
curl -X POST "https://x6ie4tyaplrwqelcxnaafxk4zy0ltmjo.lambda-url.ap-south-1.on.aws" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "1402ddf2-319e-40f0-8f98-58fe9e1de5bb",
    "redirectLink": "https://sign-url.example.com/document/abc123?token=xyz",
    "apiKey": "your-api-key-here"
  }'
```

## Request ID

The `requestId` is included in the form submission payload sent to your API. The field name for `requestId` in the submission is **configurable** per form, but defaults to `"requestId"` if not specified.

**Important:** Extract the `requestId` from the incoming form submission and use the **same value** when calling the webhook endpoint.

### Example Form Submission Payload

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "requestId": "1402ddf2-319e-40f0-8f98-58fe9e1de5bb",
  // ... other form fields
}
```

## Redirect Link Requirements

- **Must be a full URL** including protocol (`https://` or `http://`)
- **Must include full domain** (e.g., `https://sign.example.com/path`)
- **Should be ready for immediate use** - the user will be redirected automatically
- **Can include query parameters** if needed for authentication or document identification

### Valid Examples

```
https://sign.example.com/document/abc123
https://sign.example.com/document/abc123?token=xyz&userId=123
https://app.signing-service.com/sign?docId=abc&auth=token123
```

### Invalid Examples

```
sign.example.com/document/abc123                    ❌ Missing protocol
/document/abc123                                    ❌ Not a full URL
sign-url                                            ❌ Not a full URL
```

## When to Call the Webhook

Call the webhook endpoint **after** you have:

1. ✅ Successfully processed the form submission
2. ✅ Generated the signing document/link
3. ✅ Verified the document is ready for signing

**Do NOT call the webhook:**
- Before processing is complete
- If document generation fails
- If the requestId is missing or invalid

## Response Codes

The webhook endpoint returns the following HTTP status codes:

| Status Code | Meaning | Description |
|------------|---------|-------------|
| `200` | Success | Request processed successfully. Redirect link sent to user via WebSocket. |
| `400` | Bad Request | Missing required fields (`requestId`, `redirectLink`, or `apiKey`) or invalid JSON. |
| `401` | Unauthorized | Invalid API key. |
| `404` | Not Found | Request ID not found in system (may have expired or never existed). |
| `500` | Internal Server Error | Server-side error processing the webhook. |

### Success Response (200)

```json
{
  "success": true,
  "requestId": "1402ddf2-319e-40f0-8f98-58fe9e1de5bb"
}
```

### Error Response Examples

**400 Bad Request:**
```json
{
  "error": "Missing required fields: requestId, redirectLink, apiKey"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid API key"
}
```

**404 Not Found:**
```json
{
  "error": "Request not found"
}
```

## Security Considerations

1. **API Key**: Keep your API key secure. Store it in environment variables or a secure secrets manager.
2. **HTTPS**: Always use HTTPS for the redirect link to ensure secure document signing.
3. **Validation**: Validate the `requestId` format (should be a UUID) before processing.
4. **Idempotency**: Consider implementing idempotency checks if you might receive duplicate submissions.

## Request Expiration

- Request IDs expire after **30 minutes** if no webhook is received
- If you call the webhook after expiration, you will receive a `404 Not Found` response
- Ensure you process forms and call the webhook within 30 minutes of receiving the submission

## Testing

### Test Webhook Call

You can test the webhook integration using the provided cURL command:

```bash
curl -X POST "https://x6ie4tyaplrwqelcxnaafxk4zy0ltmjo.lambda-url.ap-south-1.on.aws" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test-request-id-123",
    "redirectLink": "https://example.com/test-signing",
    "apiKey": "your-test-api-key"
  }'
```

**Note:** Use a valid `requestId` from an actual form submission for testing. Test `requestId` values may return `404` if they don't exist in the system.