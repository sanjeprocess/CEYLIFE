# Mock Submissions Guide

This guide explains how to use the mock submission endpoint for testing form submissions during development without hitting real APIs.

## Overview

The mock submission endpoint (`/api/mock-submit`) is a development-only tool that simulates API responses, allowing you to test the entire submission flow including field mappings, transformations, and response handling without requiring a real backend API.

## Quick Start

To use the mock endpoint, update your form's submission configuration:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit
method: POST
requiresAccessToken: true
```

The mock endpoint will:

- Accept all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Log all request details to the console
- Return configurable mock responses
- Support error simulation for testing error handling

## Default Response

By default, the mock endpoint returns a successful response matching the expected structure:

```json
{
  "data": {
    "status": "success",
    "submission_id": "mock-{timestamp}-{random}",
    "reference_number": "REF-{timestamp}",
    "tracking_code": "TRACK-{random}"
  },
  "_mockMetadata": {
    "requestId": "req-{timestamp}-{random}",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "method": "POST",
    "receivedHeaders": { ... },
    "receivedQueryParams": { ... },
    "receivedBody": { ... }
  }
}
```

The `_mockMetadata` field contains debugging information and can be safely ignored by your submission configuration.

## Query Parameters

The mock endpoint supports various query parameters to simulate different scenarios:

### Error Simulation

Simulate error responses:

```
/api/mock-submit?error=true
/api/mock-submit?error=400
/api/mock-submit?error=500
```

**Examples:**

- `?error=true` - Returns 400 Bad Request
- `?error=404` - Returns 404 Not Found
- `?error=500` - Returns 500 Internal Server Error

### Status Code Override

Override the HTTP status code:

```
/api/mock-submit?status=201
/api/mock-submit?status=400
/api/mock-submit?status=500
```

**Examples:**

- `?status=201` - Returns 201 Created (success)
- `?status=400` - Returns 400 Bad Request (error)
- `?status=500` - Returns 500 Internal Server Error

### Network Delay

Simulate network latency:

```
/api/mock-submit?delay=2000
```

**Examples:**

- `?delay=500` - 500ms delay
- `?delay=2000` - 2 second delay
- `?delay=5000` - 5 second delay

**Note:** Maximum delay is capped at 30 seconds for safety.

### Missing Required Fields

Simulate missing required fields in the response:

```
/api/mock-submit?missingFields=submission_id
/api/mock-submit?missingFields=submission_id,reference_number
```

**Examples:**

- `?missingFields=submission_id` - Omits `submission_id` from response
- `?missingFields=submission_id,reference_number` - Omits both fields
- `?missingFields=tracking_code` - Omits optional `tracking_code` field

This is useful for testing how your form handles missing required fields in the API response.

### Invalid Status Value

Override the `data.status` value:

```
/api/mock-submit?invalidStatus=error
/api/mock-submit?invalidStatus=pending
```

**Examples:**

- `?invalidStatus=error` - Returns `data.status: "error"` instead of `"success"`
- `?invalidStatus=pending` - Returns `data.status: "pending"`

This is useful for testing success check validation that requires `data.status === "success"`.

### Combining Parameters

You can combine multiple parameters:

```
/api/mock-submit?delay=1000&error=500
/api/mock-submit?status=201&missingFields=tracking_code
/api/mock-submit?delay=2000&invalidStatus=error
```

## Request Logging

All requests to the mock endpoint are logged to the console with detailed information:

```
================================================================================
[Mock-Submit] [req-1234567890-abc123] 2024-01-15T10:30:00.000Z
================================================================================
Method: POST
URL: http://localhost:3000/api/mock-submit?source=web-form

Headers:
{
  "content-type": "application/json",
  "authorization": "Bearer token123",
  "x-form-version": "1.0"
}

Query Parameters:
{
  "source": "web-form",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

Request Body:
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    ...
  },
  ...
}
================================================================================
```

This logging helps you:

- Verify field mappings are working correctly
- Inspect transformed values
- Debug transformation scripts
- Check headers and query parameters
- Understand the exact payload being sent

## Testing Scenarios

### 1. Successful Submission

Default behavior - no query parameters needed:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit
```

**Expected Result:**

- HTTP 200 status
- `data.status: "success"`
- All required fields present (`submission_id`, `reference_number`, `tracking_code`)

### 2. Error Response

Test error handling:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit?error=500
```

**Expected Result:**

- HTTP 500 status
- `data.status: "error"`
- Error message displayed to user

### 3. Missing Required Fields

Test validation of required response fields:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit?missingFields=submission_id,reference_number
```

**Expected Result:**

- HTTP 200 status
- Missing required fields in response
- Submission should fail with appropriate error message

### 4. Network Delay

Test loading states and timeouts:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit?delay=3000
```

**Expected Result:**

- 3 second delay before response
- Loading indicator should display
- Form should handle delay gracefully

### 5. Invalid Status Value

Test success check validation:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit?invalidStatus=error
```

**Expected Result:**

- HTTP 200 status
- `data.status: "error"` (instead of "success")
- Submission should fail if success check requires `data.status === "success"`

## Integration with Submission Config

The mock endpoint works seamlessly with your submission configuration. Here's an example using the OTP form:

```yaml
baseUrl: http://localhost:3000
endpoint: /api/mock-submit
method: POST
requiresAccessToken: true

headers:
  - name: Content-Type
    value: application/json
  - name: Authorization
    value: Bearer {{$WORKHUB_TOKEN}}

queryParams:
  - name: source
    value: web-form
  - name: timestamp
    value: "{{$now}}"

fieldMapping:
  - from: clientName
    to: customer.name
    transform: trim
    returnType: string
  # ... more field mappings

response:
  successCheck:
    - type: status
      values: [200, 201]
    - type: field
      path: data.status
      value: "success"

  variableMapping:
    - path: data.submission_id
      to: submission_id
      required: true
    - path: data.reference_number
      to: reference_number
      required: true
```

The mock endpoint will:

- Accept the transformed request body
- Validate headers and query parameters
- Return a response matching your `successCheck` and `variableMapping` configuration
- Extract variables as configured

## Switching to Production

When ready to use the real API, simply update the submission configuration:

```yaml
# Production configuration
baseUrl: http://api.example.com
endpoint: /api/submit
method: POST
requiresAccessToken: true
```

No other changes are needed - the submission system works the same way with real APIs.

## Best Practices

1. **Use Mock Endpoint During Development**
   - Test field mappings and transformations
   - Verify response handling
   - Debug transformation scripts
   - Test error scenarios

2. **Check Console Logs**
   - Review request logs to verify transformations
   - Inspect the exact payload being sent
   - Verify headers and query parameters

3. **Test Error Scenarios**
   - Use query parameters to simulate errors
   - Test missing required fields
   - Test invalid response structures
   - Verify error messages are user-friendly

4. **Test Loading States**
   - Use delay parameter to test loading indicators
   - Verify timeout handling
   - Test user experience during slow responses

5. **Switch to Real API Before Production**
   - Always test with real API before deploying
   - Verify authentication works correctly
   - Test with real data structures
   - Validate error responses from real API

## Troubleshooting

### Issue: Mock endpoint not responding

**Solution:** Ensure the development server is running on `http://localhost:3000` and the endpoint is accessible.

### Issue: Request not logged

**Solution:** Check the server console (not browser console) - logs appear in the terminal where `npm run dev` is running.

### Issue: Response doesn't match expected structure

**Solution:** Check the `_mockMetadata` field in the response - it contains debugging information. The actual response data is in the `data` field.

### Issue: Error simulation not working

**Solution:** Ensure query parameters are properly URL-encoded. Use `?error=500` not `?error = 500`.

### Issue: Variables not extracted

**Solution:** Verify your `variableMapping` configuration matches the response structure. Check that field paths use dot notation (e.g., `data.submission_id`).

## Limitations

- **Development Only:** The mock endpoint is intended for development and testing only. Do not use in production.
- **No Data Persistence:** The mock endpoint does not store any data. Each request is independent.
- **No Authentication:** The mock endpoint does not validate authentication tokens (though it logs them).
- **No Validation:** The mock endpoint does not validate request data - it accepts any payload.

## Reference

For more information about the submission system, see:

- [Submission System Documentation](./SUBMISSION_SYSTEM.md) - Complete guide to submission configuration
- [Variables Documentation](./VARIABLES.md) - Guide to using variables in submissions
