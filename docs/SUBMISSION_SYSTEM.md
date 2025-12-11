# Form Submission System Documentation

This document provides comprehensive documentation for the form submission system, enabling LLMs to understand, create, and modify submission configurations.

## Table of Contents

1. [Overview](#overview)
2. [Submission Configuration Structure](#submission-configuration-structure)
3. [Field Mapping](#field-mapping)
4. [Transformations](#transformations)
5. [Return Types](#return-types)
6. [Variables](#variables)
7. [Response Handling](#response-handling)
8. [Complete Examples](#complete-examples)
9. [Best Practices](#best-practices)

## Overview

The submission system transforms form field values into structured request payloads and submits them to external APIs. It supports:

- **Field Mapping**: Map form fields to request body structure
- **Transformations**: Built-in and custom JavaScript transformations
- **Type Safety**: Strong type validation with explicit return types
- **Variable Replacement**: Dynamic values from form context and system variables
- **Response Processing**: Extract variables and validate success

### Submission Flow

```
Form Values → Field Mapping → Transformations → Request Body → API Request → Response Processing
```

## Submission Configuration Structure

The submission configuration is defined in `{formName}.submission.yml` and follows this structure:

```yaml
baseUrl: http://api.example.com # Optional: base URL for the API
endpoint: /api/submit # Required: API endpoint path
method: POST # HTTP method: GET, POST, PUT, DELETE, PATCH
requiresAccessToken: true # Whether to include WORKHUB_TOKEN in runtime variables

headers: # Optional: Request headers
  - name: Content-Type
    value: application/json
  - name: Authorization
    value: Bearer {{$WORKHUB_TOKEN}}

queryParams: # Optional: Query parameters
  - name: source
    value: web-form
  - name: timestamp
    value: "{{$now}}"

fieldMapping: # Optional: Field mapping configuration
  # See Field Mapping section

response: # Optional: Response handling
  # See Response Handling section
```

### Configuration Fields

| Field                 | Type    | Required | Description                                                             |
| --------------------- | ------- | -------- | ----------------------------------------------------------------------- |
| `baseUrl`             | string  | No       | Base URL for the API (if not provided, `endpoint` must be a full URL)   |
| `endpoint`            | string  | Yes      | API endpoint path (relative to `baseUrl` or absolute URL)               |
| `method`              | string  | Yes      | HTTP method: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`                    |
| `requiresAccessToken` | boolean | Yes      | If `true`, automatically includes `$WORKHUB_TOKEN` in runtime variables |
| `headers`             | array   | No       | Array of header objects with `name` and `value`                         |
| `queryParams`         | array   | No       | Array of query parameter objects with `name` and `value`                |
| `fieldMapping`        | array   | No       | Array of field mapping configurations (see Field Mapping)               |
| `response`            | object  | No       | Response handling configuration (see Response Handling)                 |

## Field Mapping

Field mapping transforms form field values into the request body structure. Each mapping entry defines:

- **Source**: Where to get the value from (form field, static value, or variable)
- **Destination**: Where to place it in the request body (using dot notation for nested paths)
- **Transformation**: Optional built-in or custom transformations
- **Return Type**: Optional explicit type declaration for validation

### Field Mapping Structure

```yaml
fieldMapping:
  - from: fieldName # Form field name, $static, $variable, or array
    to: customer.name # Destination path in request body (dot notation)
    transform: trim # Optional: Built-in transformation(s)
    script: | # Optional: Custom JavaScript transformation
      // Custom transformation code
    returnType: string # Optional: Expected return type
    value: "{{variable}}" # Required for $static/$variable sources
```

### Source Types

#### 1. Form Field (`from: fieldName`)

Maps a form field value to the request body:

```yaml
- from: clientName
  to: customer.name
  transform: trim
  returnType: string
```

#### 2. Multiple Fields (`from: [field1, field2]`)

Combines multiple form fields:

```yaml
- from: [contactNo1, contactNo2]
  to: customer.alternative_contacts
  returnType: array
  script: |
    if (Array.isArray(value)) {
      return value.filter(c => c && String(c).trim() !== '');
    }
    return [];
```

**Behavior:**

- If `returnType: array`, values are kept as an array
- Otherwise, values are joined with spaces as a string

#### 3. Static Value (`from: $static`)

Uses a static value (with variable replacement):

```yaml
- from: $static
  to: metadata.form_id
  value: otp-form

- from: $static
  to: metadata.submitted_at
  value: "{{$now}}"
```

#### 4. Variable Value (`from: $variable`)

Uses a form variable:

```yaml
- from: $variable
  to: metadata.contract_sequence
  value: "{{contract_sequence}}"
```

### Destination Paths

Use dot notation to create nested object structures:

```yaml
- from: streetAddress
  to: customer.address.street # Creates: { customer: { address: { street: "..." } } }

- from: city
  to: customer.address.city # Merges into existing customer.address object

- from: postalCode
  to: customer.address.postalCode
```

**Result:**

```json
{
  "customer": {
    "address": {
      "street": "...",
      "city": "...",
      "postalCode": "..."
    }
  }
}
```

## Transformations

Transformations modify field values before they're added to the request body. Two types are supported:

1. **Built-in Transformations**: Pre-defined transformation functions
2. **Custom Scripts**: JavaScript code executed in a sandboxed environment

### Built-in Transformations

#### String Transformations

| Transformation | Description                         | Return Type |
| -------------- | ----------------------------------- | ----------- |
| `trim`         | Removes leading/trailing whitespace | string      |
| `lowercase`    | Converts to lowercase               | string      |
| `uppercase`    | Converts to uppercase               | string      |
| `toString`     | Converts value to string            | string      |

#### Type Conversions

| Transformation | Description                                    | Return Type |
| -------------- | ---------------------------------------------- | ----------- |
| `toNumber`     | Converts to number (throws if invalid)         | number      |
| `toBoolean`    | Converts to boolean                            | boolean     |
| `toArray`      | Converts to array (splits string by delimiter) | array       |

#### Date Transformations

| Transformation | Description                     | Return Type |
| -------------- | ------------------------------- | ----------- |
| `toDate`       | Converts to ISO date string     | string      |
| `formatDate`   | Formats date with custom format | string      |

**Usage Examples:**

```yaml
# Single transformation
- from: clientName
  to: customer.name
  transform: trim

# Chained transformations (applied in order)
- from: clientEmail
  to: customer.email
  transform: [trim, lowercase]

# Transformation with options
- from: submissionDate
  to: customer.submission_date
  transform:
    name: formatDate
    options:
      format: "YYYY-MM-DD HH:mm:ss"
```

### Custom Scripts

Custom scripts allow complex transformations using JavaScript. They run in a sandboxed environment with:

**Available Context:**

- `value`: The current field value (can be any type)
- `variables`: Object containing form variables

**Available Functions:**

- `String`, `Number`, `parseInt`, `parseFloat`
- `Math`, `Date`, `Array`, `Object`, `JSON`
- `RegExp` for regular expressions

**Security:**

- No access to Node.js APIs (`require`, `process`, `fs`, etc.)
- 1-second timeout to prevent infinite loops
- Only JSON-serializable results are allowed

**Example:**

```yaml
- from: contactNo1
  to: customer.phone
  returnType: string
  script: |
    // Remove all non-digit characters and format phone number
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('94')) {
      return '+' + cleaned;
    } else if (cleaned.length === 9) {
      return '+94' + cleaned;
    }
    return String(value);
```

## Return Types

The `returnType` field enables strong type validation. It ensures transformation results match the expected type and provides automatic type coercion when possible.

### Supported Return Types

| Type      | Description                | Validation                                                             |
| --------- | -------------------------- | ---------------------------------------------------------------------- |
| `string`  | String value               | `typeof value === "string"`                                            |
| `number`  | Numeric value              | `typeof value === "number" && !isNaN(value)`                           |
| `boolean` | Boolean value              | `typeof value === "boolean"`                                           |
| `array`   | Array value                | `Array.isArray(value)`                                                 |
| `object`  | Object value (not array)   | `typeof value === "object" && value !== null && !Array.isArray(value)` |
| `any`     | Any JSON-serializable type | No validation (default behavior)                                       |

### Type Coercion

The system attempts safe type coercion when the result doesn't match the expected type:

- **String → Number**: `"123"` → `123` (if valid number)
- **String → Boolean**: `"true"` → `true`, `"false"` → `false`
- **String → Array**: `"a,b,c"` → `["a", "b", "c"]` (splits by comma)
- **Number → Boolean**: `0` → `false`, non-zero → `true`

**Example:**

```yaml
- from: age
  to: customer.age
  returnType: number
  script: |
    const ageNum = typeof value === 'number' ? value : Number(value);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return null; // Invalid age
    }
    return Math.floor(ageNum);
```

### Type Validation Errors

If a transformation result cannot be coerced to the expected type, an error is thrown:

```
Transformation result type mismatch. Expected number, got string
```

## Variables

Variables allow dynamic values in submission configurations. See [VARIABLES.md](./VARIABLES.md) for complete variable documentation.

### Variable Types

1. **Form Variables**: Values from form context (e.g., `{{contract_sequence}}`)
2. **System Variables**: Built-in variables (e.g., `{{$now}}`, `{{$today}}`)
3. **Runtime Variables**: Automatically injected (e.g., `{{$WORKHUB_TOKEN}}`)

### Using Variables

Variables can be used in:

- Header values
- Query parameter values
- Static field mapping values
- Variable field mapping values

**Example:**

```yaml
headers:
  - name: Authorization
    value: Bearer {{$WORKHUB_TOKEN}}

queryParams:
  - name: timestamp
    value: "{{$now}}"

fieldMapping:
  - from: $variable
    to: metadata.contract_sequence
    value: "{{contract_sequence}}"
```

## Response Handling

The `response` section configures how the system processes API responses.

### Success Validation

Define criteria for successful submissions:

```yaml
response:
  successCheck:
    - type: status # Check HTTP status code
      values: [200, 201]
    - type: field # Check response field value
      path: data.status
      value: "success"
```

**Success Check Types:**

1. **Status Check**: Validates HTTP status code

   ```yaml
   - type: status
     values: [200, 201, 204]
   ```

2. **Field Check**: Validates response field value
   ```yaml
   - type: field
     path: data.status
     value: "success"
   ```

**Default Behavior:** If no `successCheck` is defined, any 2xx status code is considered success.

### Variable Extraction

Extract values from the response to store as form variables:

```yaml
response:
  variableMapping:
    - path: data.submission_id # Path in response (dot notation)
      to: submission_id # Variable name to store
      required: true # Whether this field is required
    - path: data.reference_number
      to: reference_number
      required: true
    - path: data.tracking_code
      to: tracking_code
      required: false
```

**Path Notation:**

- Simple: `data.submission_id`
- Nested: `data.user.profile.id`
- Array: `data.results[0].id`

**Required Fields:** If a required field is missing, submission fails with an error.

### Success/Error Messages

Define user-facing messages:

```yaml
response:
  messages:
    success:
      title: Success
      content: Form submitted successfully! Your reference number is {{reference_number}}
    error:
      title: Error
      content: "{{error_message}}"
```

Messages support variable replacement using extracted variables.

## Complete Examples

### Example 1: Simple Form Submission

```yaml
baseUrl: http://api.example.com
endpoint: /submit
method: POST
requiresAccessToken: false

headers:
  - name: Content-Type
    value: application/json

fieldMapping:
  - from: name
    to: customer.name
    transform: trim
    returnType: string

  - from: email
    to: customer.email
    transform: [trim, lowercase]
    returnType: string

response:
  successCheck:
    - type: status
      values: [200, 201]
```

### Example 2: Complex Submission with Transformations

```yaml
baseUrl: http://api.example.com
endpoint: /api/requests
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
  # String transformations
  - from: clientName
    to: customer.name
    transform: trim
    returnType: string

  # Number transformation
  - from: age
    to: customer.age
    returnType: number
    script: |
      const ageNum = Number(value);
      return isNaN(ageNum) ? null : Math.floor(ageNum);

  # Boolean transformation
  - from: termsAccepted
    to: consent.terms_accepted
    returnType: boolean
    script: |
      return value === true || value === 'true' || value === 1;

  # Array transformation
  - from: tags
    to: request.tags
    returnType: array
    script: |
      if (Array.isArray(value)) {
        return value.filter(tag => tag);
      }
      if (typeof value === 'string') {
        return value.split(',').map(t => t.trim()).filter(t => t);
      }
      return [];

  # Nested object structure
  - from: streetAddress
    to: customer.address.street
    returnType: string
    transform: trim

  - from: city
    to: customer.address.city
    returnType: string
    transform: trim

  # Static values
  - from: $static
    to: metadata.form_id
    value: my-form

  # Variable values
  - from: $variable
    to: metadata.contract_id
    value: "{{contract_id}}"

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

  messages:
    success:
      title: Success
      content: Your request has been submitted. Reference: {{reference_number}}
    error:
      title: Error
      content: "{{error_message}}"
```

## Best Practices

### 1. Always Use `returnType` for Type Safety

```yaml
# Good
- from: age
  to: customer.age
  returnType: number
  transform: toNumber

# Avoid (no type validation)
- from: age
  to: customer.age
  transform: toNumber
```

### 2. Use Built-in Transformations When Possible

Built-in transformations are optimized and tested:

```yaml
# Good - uses built-in transformation
- from: email
  to: customer.email
  transform: [trim, lowercase]

# Avoid - custom script for simple operations
- from: email
  to: customer.email
  script: |
    return String(value).trim().toLowerCase();
```

### 3. Validate Input in Custom Scripts

Always validate and handle edge cases:

```yaml
script: |
  if (!value) return '';
  const cleaned = String(value).trim();
  if (cleaned.length === 0) return '';
  // ... rest of transformation
```

### 4. Use Nested Paths for Object Structures

Create clean, nested object structures:

```yaml
# Good - creates nested structure
- from: street
  to: address.street
- from: city
  to: address.city

# Avoid - flat structure
- from: street
  to: street_address
- from: city
  to: city_name
```

### 5. Handle Missing Values Gracefully

```yaml
script: |
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null; // or appropriate default
  }
  // ... transformation
```

### 6. Use Appropriate Return Types

Match return types to API expectations:

```yaml
# API expects number
- from: amount
  to: request.amount
  returnType: number

# API expects boolean
- from: isActive
  to: user.active
  returnType: boolean

# API expects array
- from: tags
  to: request.tags
  returnType: array
```

### 7. Document Complex Transformations

Add comments for complex logic:

```yaml
script: |
  // Phone number formatting for Sri Lanka
  // Format: +94XXXXXXXXX (11 digits) or +94XXXXXXXX (9 digits)
  const cleaned = String(value).replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('94')) {
    return '+' + cleaned;
  } else if (cleaned.length === 9) {
    return '+94' + cleaned;
  }
  return String(value);
```

### 8. Test Transformations

Test custom scripts with various input types:

- `null` / `undefined`
- Empty strings
- Numbers (when expecting strings)
- Arrays (when expecting strings)
- Edge cases

## Common Patterns

### Pattern 1: Phone Number Formatting

```yaml
- from: phone
  to: contact.phone
  returnType: string
  script: |
    const cleaned = String(value).replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('94')) {
      return '+' + cleaned;
    } else if (cleaned.length === 9) {
      return '+94' + cleaned;
    }
    return String(value);
```

### Pattern 2: Array from Comma-Separated String

```yaml
- from: tags
  to: request.tags
  returnType: array
  script: |
    if (Array.isArray(value)) {
      return value.filter(tag => tag);
    }
    if (typeof value === 'string') {
      return value.split(',').map(t => t.trim()).filter(t => t);
    }
    return [];
```

### Pattern 3: Boolean from Checkbox

```yaml
- from: termsAccepted
  to: consent.terms_accepted
  returnType: boolean
  script: |
    return value === true || value === 'true' || value === 1;
```

### Pattern 4: Number with Validation

```yaml
- from: age
  to: customer.age
  returnType: number
  script: |
    const ageNum = Number(value);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return null;
    }
    return Math.floor(ageNum);
```

### Pattern 5: Nested Object Construction

```yaml
- from: street
  to: address.street
  returnType: string
  transform: trim

- from: city
  to: address.city
  returnType: string
  transform: trim

- from: postalCode
  to: address.postalCode
  returnType: string
  script: |
    return String(value).trim().toUpperCase().replace(/\s+/g, '');
```

## Error Handling

### Transformation Errors

If a transformation fails, the submission fails with a descriptive error:

```
Custom transformation failed: Cannot convert "abc" to number
```

### Type Validation Errors

If return type validation fails:

```
Transformation result type mismatch. Expected number, got string
```

### Missing Required Variables

If a required variable is missing from the response:

```
Failed to extract response variables: Missing required field: submission_id
```

## Security Considerations

1. **Sandboxed Execution**: Custom scripts run in a sandboxed environment with no access to Node.js APIs
2. **Timeout Protection**: Scripts have a 1-second timeout to prevent infinite loops
3. **JSON-Serializable Only**: Only JSON-serializable values can be returned (no functions, undefined, symbols)
4. **Type Validation**: Return type validation prevents unexpected data types in request body

## Troubleshooting

### Issue: Transformation returns wrong type

**Solution:** Check `returnType` declaration and ensure script returns the correct type:

```yaml
- from: age
  to: customer.age
  returnType: number
  script: |
    return Number(value); // Ensure this returns a number
```

### Issue: Nested object not created correctly

**Solution:** Ensure all nested paths use dot notation consistently:

```yaml
- from: street
  to: address.street # Correct
- from: city
  to: address.city # Correct
```

### Issue: Variable not replaced

**Solution:** Check variable name and ensure it's available in form context. Use `{{variable_name}}` syntax.

### Issue: Array field combination not working

**Solution:** Specify `returnType: array` if you want an array result:

```yaml
- from: [field1, field2]
  to: combined_fields
  returnType: array
```

## Reference

### Built-in Transformations Reference

| Transformation | Input Type | Output Type  | Options                          |
| -------------- | ---------- | ------------ | -------------------------------- |
| `trim`         | any        | string       | -                                |
| `lowercase`    | any        | string       | -                                |
| `uppercase`    | any        | string       | -                                |
| `toString`     | any        | string       | -                                |
| `toNumber`     | any        | number       | -                                |
| `toBoolean`    | any        | boolean      | -                                |
| `toArray`      | any        | array        | `delimiter` (default: ",")       |
| `toDate`       | any        | string (ISO) | -                                |
| `formatDate`   | any        | string       | `format` (default: "YYYY-MM-DD") |

### System Variables

| Variable             | Description                  | Example                    |
| -------------------- | ---------------------------- | -------------------------- |
| `{{$now}}`           | Current timestamp (ISO)      | `2024-01-15T10:30:00.000Z` |
| `{{$today}}`         | Current date (YYYY-MM-DD)    | `2024-01-15`               |
| `{{$WORKHUB_TOKEN}}` | Workhub authentication token | (auto-injected)            |

---

For variable system documentation, see [VARIABLES.md](./VARIABLES.md).
