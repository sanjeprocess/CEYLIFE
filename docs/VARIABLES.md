# Variable System Guide

This guide explains how to use variables in form definitions. Variables allow you to inject dynamic values into form fields, labels, descriptions, and layout content.

## Variable Syntax

Variables use double curly braces: `{{variable_name}}`

Variables can be used in:

- Field labels
- Field placeholders
- Field descriptions
- Field default values
- Layout text content (headings, text, cards)

## Variable Types

There are two types of variables:

1. **User Variables** - Values passed via URL search parameters or created while operations
2. **System Variables** - Built-in variables that start with `$`

---

## User Variables

User variables are defined in the form's `searchParamsVariables` metadata and populated from URL query parameters.

### Configuration

In your form JSON, define the mapping between URL parameters and variable names:

```json
{
  "metadata": {
    "searchParamsVariables": {
      "cs": "contract_sequence",
      "id": "card_id"
    }
  }
}
```

This maps:

- URL param `cs` → variable `{{contract_sequence}}`
- URL param `id` → variable `{{card_id}}`

### URL Example

```
https://example.com/forms/my-form?cs=ABC123&id=456789
```

With this URL:

- `{{contract_sequence}}` resolves to `ABC123`
- `{{card_id}}` resolves to `456789`

### Usage Examples

**In field label:**

```json
{
  "policyNumber": {
    "type": "text",
    "label": "Policy Number for {{contract_sequence}}"
  }
}
```

**In default value:**

```json
{
  "cardId": {
    "type": "text",
    "label": "Card ID",
    "defaultValue": "{{card_id}}"
  }
}
```

**In layout headings:**

```json
{
  "h2": "Application for Contract {{contract_sequence}}"
}
```

**In description:**

```json
{
  "applicantName": {
    "type": "text",
    "label": "Applicant Name",
    "description": "Enter your name as shown on card {{card_id}}"
  }
}
```

---

## System Variables

System variables are built-in variables that start with `$`. They are resolved at render time and provide dynamic values like dates and times.

### Available System Variables

| Variable     | Format             | Description           | Example Output     |
| ------------ | ------------------ | --------------------- | ------------------ |
| `{{$today}}` | `YYYY-MM-DD`       | Current date          | `2025-12-05`       |
| `{{$now}}`   | `YYYY-MM-DDTHH:mm` | Current date and time | `2025-12-05T14:30` |
| `{{$time}}`  | `HH:mm`            | Current time          | `14:30`            |

### Usage Examples

**Date field with today as default:**

```json
{
  "applicationDate": {
    "type": "date",
    "label": "Application Date",
    "defaultValue": "{{$today}}"
  }
}
```

**DateTime field with current time:**

```json
{
  "submissionTime": {
    "type": "datetime-local",
    "label": "Submission Time",
    "defaultValue": "{{$now}}"
  }
}
```

**Time field:**

```json
{
  "preferredTime": {
    "type": "time",
    "label": "Preferred Contact Time",
    "defaultValue": "{{$time}}"
  }
}
```

**In text content:**

```json
{
  "text": "This form was generated on {{$today}}. Please complete before end of day."
}
```

---

## Combining Variables

You can use multiple variables (both user and system) in the same text:

```json
{
  "h2": "Policy {{contract_sequence}} - Application submitted on {{$today}}"
}
```

```json
{
  "confirmationMessage": {
    "type": "text",
    "label": "Confirmation",
    "defaultValue": "Card {{card_id}} verified on {{$today}}"
  }
}
```

---

## Missing Variables

### User Variables

If a URL parameter is missing, the variable will be replaced with an empty string. In development mode, a console warning will be shown.

### System Variables

If an unknown system variable is used (e.g., `{{$unknown}}`), it will be treated as a missing user variable.

### Development Warnings

In development mode, the console will show warnings for undefined variables:

```
Variable 'card_id' used but not defined. Available variables: contract_sequence
```

If a typo is detected, a suggestion will be provided:

```
Variable 'card_ID' used but not defined. Did you mean 'card_id'? Available variables: card_id, contract_sequence
```

---

## Complete Example

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "Insurance Application",
    "formDescription": "Application form for policy holders",
    "availableLocales": ["en", "si", "ta"],
    "searchParamsVariables": {
      "policy": "policy_number",
      "name": "customer_name"
    }
  },
  "fields": {
    "policyNumber": {
      "type": "text",
      "label": "Policy Number",
      "defaultValue": "{{policy_number}}",
      "required": true
    },
    "customerName": {
      "type": "text",
      "label": "Customer Name",
      "defaultValue": "{{customer_name}}",
      "required": true
    },
    "applicationDate": {
      "type": "date",
      "label": "Application Date",
      "defaultValue": "{{$today}}",
      "required": true
    }
  },
  "layout": [
    {
      "h1": "Policy Application - {{policy_number}}"
    },
    {
      "text": "Welcome {{customer_name}}! Please review your application details below."
    },
    {
      "field": "policyNumber"
    },
    {
      "field": "customerName"
    },
    {
      "field": "applicationDate"
    },
    {
      "text": "Form generated on {{$today}}"
    },
    {
      "submit": "Submit Application"
    }
  ]
}
```

**Accessed via URL:**

```
/forms/insurance-application?policy=POL-2025-001&name=John%20Doe
```

---

## Best Practices

1. **Use descriptive variable names** - Use `customer_name` instead of `n` or `name1`

2. **Keep URL params short** - Map short URL params to descriptive variable names:

   ```json
   "searchParamsVariables": {
     "p": "policy_number",
     "c": "customer_id"
   }
   ```

3. **Provide fallbacks in labels** - Don't rely solely on variables for critical information

4. **Test with missing params** - Verify your form handles missing URL parameters gracefully

5. **Use system variables for dates** - Always use `{{$today}}` instead of hardcoded dates for date field defaults

---

## Technical Notes

- Variables are resolved at render time (client-side)
- System variables (starting with `$`) are resolved before user variables
- User variables are stored in cookies for backend access
- Variable replacement is applied after localization/translation
