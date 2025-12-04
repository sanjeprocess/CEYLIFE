# Form Building Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Form JSON Structure](#form-json-structure)
3. [Step-by-Step Form Creation](#step-by-step-form-creation)
4. [Field Types Reference](#field-types-reference)
5. [Layout System](#layout-system)
6. [Conditional Fields](#conditional-fields)
7. [Validation](#validation)
8. [Localization](#localization)
9. [Advanced Features](#advanced-features)
10. [Complete Example](#complete-example)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

### Overview

The form system is a JSON-based form builder that allows you to create dynamic, configurable forms without writing React components. Forms are defined as JSON files in the `src/forms/` directory and are automatically rendered using the form rendering system.

### How Forms Work

1. **Form Definition**: Forms are defined as JSON files following a specific schema (see [Form JSON Structure](#form-json-structure))
2. **Form Loading**: Forms are loaded using the `getForm()` function from `src/forms/index.ts`
3. **Form Rendering**: The `FormView` component (`src/components/organism/form-view.tsx`) renders the form using:
   - `LayoutRenderer` - Renders layout items (headings, text, dividers, fields)
   - `FieldRenderer` - Renders individual form fields based on their type
   - `ConditionalRenderer` - Handles conditional field visibility
4. **State Management**: Form values are managed using Zustand store (`src/stores/form.store.ts`)

### Key Concepts

- **Fields**: Individual form inputs (text, select, checkbox, etc.)
- **Layout**: Array that defines the order and structure of form elements
- **Conditional Rendering**: Fields that appear/disappear based on other field values
- **Validation**: Rules that validate user input
- **Localization**: Multi-language support for form labels and text

### Architecture

```
Form JSON File (src/forms/*.json)
    ↓
getForm() loads JSON
    ↓
FormView component initializes form store
    ↓
LayoutRenderer iterates through layout array
    ↓
FieldRenderer renders appropriate field component
    ↓
ConditionalRenderer evaluates dependencies
    ↓
User interactions update form store
```

---

## Form JSON Structure

The form JSON follows a strict schema defined in `src/common/interfaces/form.interfaces.ts`. Here's the complete structure:

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "Form Title",
    "formDescription": "Form description",
    "availableLocales": ["en", "si", "ta"],
    "otpRequired": true
  },
  "prefilledFields": ["field1", "field2"],
  "submission": {
    "endpoint": "/api/forms/form-name",
    "method": "POST",
    "requiresAccessToken": true
  },
  "fields": {
    "fieldName": {
      // Field definition (see Field Types Reference)
    }
  },
  "layout": [
    // Layout items (see Layout System)
  ],
  "localization": {
    "en": {},
    "si": {},
    "ta": {}
  }
}
```

### Required Properties

- `metadata` - Form metadata (required)
- `submission` - Submission configuration (required)
- `fields` - Field definitions (required)
- `layout` - Layout array (required)

### Optional Properties

- `prefilledFields` - Array of field keys that are prefilled
- `localization` - Multi-language translations

### Property Details

#### metadata

```typescript
interface IFormMetadata {
  formVersion: FormVersion; // Currently: 1
  formTitle: string; // Display title
  formDescription: string; // Display description
  availableLocales: Locale[]; // ["en", "si", "ta"]
  otpRequired: boolean; // Whether OTP verification is required
}
```

#### submission

```typescript
interface IFormSubmission {
  endpoint: string; // API endpoint for form submission
  method: HttpMethod; // "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  requiresAccessToken: boolean; // Whether auth token is required
}
```

#### fields

An object where keys are field names and values are field definitions. See [Field Types Reference](#field-types-reference) for details.

#### layout

An array of layout items that define the order and structure. See [Layout System](#layout-system) for details.

#### prefilledFields

Array of field keys (strings) that will be prefilled from external sources (e.g., OTP service).

#### localization

Object with locale keys (`en`, `si`, `ta`) containing translations. See [Localization](#localization) for details.

---

## Step-by-Step Form Creation

Follow these steps to create a new form:

### Step 1: Create the JSON File

Create a new JSON file in `src/forms/` directory with a descriptive name:

```
src/forms/my-form.json
```

**Naming Convention**: Use kebab-case (e.g., `life-insurance.json`, `contact-form.json`)

### Step 2: Define Metadata

Start with the metadata object:

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "My Form Title",
    "formDescription": "Description of what this form does",
    "availableLocales": ["en"],
    "otpRequired": false
  }
}
```

**Notes**:

- `formVersion` must be `1` (current version)
- `availableLocales` should include at least `"en"`
- Set `otpRequired` to `true` if OTP verification is needed

### Step 3: Define Fields

Add the `fields` object with your form fields:

```json
{
  "fields": {
    "firstName": {
      "type": "text",
      "label": "First Name",
      "required": true,
      "placeholder": "Enter your first name",
      "description": "",
      "defaultValue": "",
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    "email": {
      "type": "email",
      "label": "Email Address",
      "required": true,
      "placeholder": "you@example.com",
      "description": "We'll never share your email",
      "defaultValue": "",
      "validation": {
        "maxLength": 100
      }
    }
  }
}
```

See [Field Types Reference](#field-types-reference) for all field types and their properties.

### Step 4: Create Layout Array

Define the order and structure using the `layout` array:

```json
{
  "layout": [
    {
      "h2": "Personal Information"
    },
    {
      "field": "firstName"
    },
    {
      "field": "email"
    },
    {
      "divider": true
    },
    {
      "h2": "Additional Information"
    }
  ]
}
```

**Important**: Field names in layout must match keys in the `fields` object.

See [Layout System](#layout-system) for all layout item types.

### Step 5: Add Submission Configuration

Add the `submission` object:

```json
{
  "submission": {
    "endpoint": "/api/forms/my-form",
    "method": "POST",
    "requiresAccessToken": true
  }
}
```

### Step 6: Add Localization (Optional)

If you need multi-language support, add the `localization` object:

```json
{
  "localization": {
    "en": {
      "formTitle": "My Form Title",
      "firstName.label": "First Name"
    },
    "si": {
      "formTitle": "මගේ පෝරමය",
      "firstName.label": "මුල් නම"
    }
  }
}
```

See [Localization](#localization) for details.

### Step 7: Add Prefilled Fields (Optional)

If some fields should be prefilled from external sources:

```json
{
  "prefilledFields": ["email", "mobile"]
}
```

### Complete Minimal Example

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "Contact Form",
    "formDescription": "Get in touch with us",
    "availableLocales": ["en"],
    "otpRequired": false
  },
  "submission": {
    "endpoint": "/api/forms/contact",
    "method": "POST",
    "requiresAccessToken": false
  },
  "fields": {
    "name": {
      "type": "text",
      "label": "Name",
      "required": true,
      "placeholder": "Your name",
      "description": "",
      "defaultValue": "",
      "validation": {}
    },
    "message": {
      "type": "textarea",
      "label": "Message",
      "required": true,
      "placeholder": "Your message",
      "description": "",
      "defaultValue": "",
      "validation": {
        "minLength": 10
      }
    }
  },
  "layout": [
    {
      "field": "name"
    },
    {
      "field": "message"
    }
  ]
}
```

---

## Field Types Reference

### Base Field Properties

All fields share these common properties:

```typescript
interface IFormFieldBase {
  type: FieldType; // Field type (see below)
  label: string; // Display label
  required?: boolean; // Whether field is required
  placeholder?: string; // Placeholder text
  description?: string; // Help text below field
  defaultValue?: string; // Default value
  validation: IFormFieldValidation; // Validation rules
  dependencies?: Record<string, IFormField>; // Conditional fields
  conditionalOptions?: IFormConditionalFieldOptions; // Conditional options
}
```

### Text Input Fields

These field types render as `<input>` elements:

- `text` - Single-line text input
- `email` - Email input with validation
- `password` - Password input (masked)
- `tel` - Telephone number input
- `url` - URL input
- `number` - Numeric input
- `date` - Date picker
- `time` - Time picker
- `datetime-local` - Date and time picker

**Example**:

```json
{
  "fullName": {
    "type": "text",
    "label": "Full Name",
    "required": true,
    "placeholder": "e.g. John Doe",
    "description": "Enter your full legal name",
    "defaultValue": "",
    "validation": {
      "minLength": 3,
      "maxLength": 100
    }
  },
  "email": {
    "type": "email",
    "label": "Email Address",
    "required": true,
    "placeholder": "you@example.com",
    "description": "",
    "defaultValue": "",
    "validation": {
      "maxLength": 100
    }
  },
  "age": {
    "type": "number",
    "label": "Age",
    "required": true,
    "placeholder": "25",
    "description": "",
    "defaultValue": "",
    "validation": {
      "min": 18,
      "max": 100
    }
  },
  "birthDate": {
    "type": "date",
    "label": "Date of Birth",
    "required": true,
    "placeholder": "",
    "description": "",
    "defaultValue": "",
    "validation": {}
  }
}
```

**Implementation**: See `src/components/molecules/text-field.tsx`

### Select Field

Dropdown selection field.

**Properties**:

- `options` - Object mapping option values to labels: `{ "value": "Label" }`

**Example**:

```json
{
  "country": {
    "type": "select",
    "label": "Country",
    "required": true,
    "placeholder": "Select a country",
    "description": "",
    "defaultValue": "",
    "validation": {},
    "options": {
      "us": "United States",
      "uk": "United Kingdom",
      "lk": "Sri Lanka"
    }
  }
}
```

**Implementation**: See `src/components/molecules/select-field.tsx`

### Radio Group Field

Radio button group for single selection.

**Properties**:

- `options` - Object mapping option values to labels: `{ "value": "Label" }`
- `orientation` - `"vertical"` (default) or `"horizontal"`

**Example**:

```json
{
  "gender": {
    "type": "radio-group",
    "label": "Gender",
    "required": true,
    "placeholder": "",
    "description": "",
    "defaultValue": "",
    "validation": {},
    "options": {
      "male": "Male",
      "female": "Female",
      "other": "Other"
    },
    "orientation": "vertical"
  }
}
```

**Implementation**: See `src/components/molecules/radio-group-field.tsx`

### Checkbox Field

Single checkbox field.

**Properties**:

- `checked` - Default checked state (boolean)

**Example**:

```json
{
  "agreeToTerms": {
    "type": "checkbox",
    "label": "I agree to the terms and conditions",
    "required": true,
    "placeholder": "",
    "description": "You must agree to continue",
    "defaultValue": "",
    "validation": {},
    "checked": false
  }
}
```

**Implementation**: See `src/components/molecules/checkbox-field.tsx`

### Checkbox Group Field

Multiple checkbox selection field. Allows users to select multiple options from a list.

**Properties**:

- `options` - Object mapping option values to labels: `{ "value": "Label" }`

**Value Storage**: Selected values are stored as `string[]` array

**Example**:

```json
{
  "interests": {
    "type": "checkbox-group",
    "label": "Select your interests",
    "required": true,
    "placeholder": "",
    "description": "Select all that apply",
    "defaultValue": "",
    "validation": {},
    "options": {
      "sports": "Sports",
      "music": "Music",
      "reading": "Reading",
      "travel": "Travel",
      "cooking": "Cooking"
    }
  }
}
```

**Notes**:

- Selected values are stored as an array of option values (e.g., `["sports", "music"]`)
- Default value can be a comma-separated string (e.g., `"sports,music"`) which will be converted to an array
- Similar to radio-group but allows multiple selections

**Implementation**: See `src/components/molecules/checkbox-group-field.tsx`

### Textarea Field

Multi-line text input.

**Properties**:

- `rows` - Number of visible rows (optional)

**Example**:

```json
{
  "address": {
    "type": "textarea",
    "label": "Address",
    "required": true,
    "placeholder": "Street, City, Country",
    "description": "",
    "defaultValue": "",
    "validation": {
      "minLength": 10,
      "maxLength": 500
    },
    "rows": 4
  }
}
```

**Implementation**: See `src/components/molecules/textarea-field.tsx`

### File Field

File upload field.

**Properties**:

- `fileOptions` - File upload configuration:
  - `maxSize` - Maximum file size in bytes (e.g., `5242880` for 5MB)
  - `allowedExtensions` - Array of allowed extensions: `["pdf", "jpg", "png"]`
  - `multiple` - Whether multiple files are allowed (boolean)

**Example**:

```json
{
  "idDocument": {
    "type": "file",
    "label": "Upload ID Document",
    "required": true,
    "placeholder": "",
    "description": "Upload a clear scan/photo (PDF/JPG/PNG, max 5MB)",
    "defaultValue": "",
    "validation": {},
    "fileOptions": {
      "maxSize": 5242880,
      "allowedExtensions": ["pdf", "jpg", "jpeg", "png"],
      "multiple": false
    }
  }
}
```

**Implementation**: See `src/components/molecules/file-field.tsx`

---

## Layout System

The `layout` array defines the order and structure of form elements. Each item in the array is an object with a single key-value pair. Non-field items (text, headings) can optionally include a `key` property for translation support.

### Layout Item Types

#### Headings

Headings support markdown syntax for rich text formatting.

```json
{ "h1": "Main Title" }
{ "h2": "Section Title" }
{ "h3": "Subsection Title" }
{ "h4": "Sub-subsection Title" }
{ "h5": "Minor Heading" }
{ "h6": "Smallest Heading" }
```

**With Translation Key** (recommended for multi-language forms):

```json
{
  "h2": "Personal Information",
  "key": "h2.personal_information"
}
```

**With Markdown**:

```json
{
  "h2": "**Important**: Please Review",
  "key": "h2.important_review"
}
```

**Example**:

```json
{
  "layout": [
    { "h1": "Application Form", "key": "h1.application_form" },
    { "h2": "Personal Information", "key": "h2.personal_information" },
    { "h2": "Contact Details", "key": "h2.contact_details" }
  ]
}
```

**Markdown Support**: All headings support markdown syntax. You can use:

- **Bold**: `**text**` or `__text__`
- _Italic_: `*text*` or `_text_`
- Links: `[text](url)`
- Inline code: `` `code` ``
- And other standard markdown features

#### Text

Plain text paragraph with markdown support:

```json
{ "text": "Please complete all required fields marked with *" }
```

**With Translation Key**:

```json
{
  "text": "Please complete all required fields marked with *",
  "key": "text.completion_notice"
}
```

**Markdown Support**: Text content supports markdown syntax. You can use:

- **Bold text**: `**bold**` or `__bold__`
- _Italic text_: `*italic*` or `_italic_`
- Links: `[link text](https://example.com)`
- Lists: `- Item 1` or `1. Item 1`
- And other standard markdown features

**Example with Markdown**:

```json
{
  "text": "**Important**: Please read the [terms and conditions](https://example.com/terms) before submitting.",
  "key": "text.important_notice"
}
```

#### Card

Card layout item with neutral background and border. Can contain nested layout items.

**Properties**:

- `card` - Card title value (string) or `true` for card without title
- `items` - Array of nested layout items to display inside the card
- `key` - Optional translation key for card title
- `align` - Optional text alignment: `"left"`, `"center"`, `"right"`, `"justify"`
- `fontSize` - Optional font size in pixels
- `margin` - Optional margin in CSS shorthand (e.g., `"10px 0 20px 0"`)

**Example**:

```json
{
  "card": "Important Information",
  "key": "card.important_info",
  "items": [
    { "text": "Please review the following details carefully." },
    { "field": "confirmationCheckbox" }
  ]
}
```

**Card with Styling**:

```json
{
  "card": "Terms and Conditions",
  "key": "card.terms",
  "align": "center",
  "fontSize": 18,
  "margin": "20px 0",
  "items": [{ "text": "By submitting this form, you agree to our terms." }]
}
```

**Card without Title**:

```json
{
  "card": true,
  "items": [{ "h3": "Nested Content" }, { "field": "someField" }]
}
```

**Implementation**: See `src/components/molecules/text-card.tsx`

#### Row

Grid-based row layout for organizing fields and layout items in columns.

**Properties**:

- `row` - Number of columns (e.g., `4` creates a 4-column grid)
- `columns` - Array of layout items, each can have `colspan` property
- `colspan` - Number of columns an item spans (default: 1)
- `margin` - Optional margin in CSS shorthand

**Example - 4 Column Row**:

```json
{
  "row": 4,
  "columns": [
    {
      "field": "firstName",
      "colspan": 2
    },
    {
      "field": "lastName",
      "colspan": 2
    }
  ]
}
```

**Example - 3 Column Row with Mixed Content**:

```json
{
  "row": 3,
  "columns": [
    {
      "field": "day",
      "colspan": 1
    },
    {
      "field": "month",
      "colspan": 1
    },
    {
      "field": "year",
      "colspan": 1
    }
  ]
}
```

**Example - Nested Row**:

```json
{
  "row": 2,
  "columns": [
    {
      "field": "email",
      "colspan": 1
    },
    {
      "row": 2,
      "colspan": 1,
      "columns": [
        {
          "field": "phone",
          "colspan": 1
        },
        {
          "field": "mobile",
          "colspan": 1
        }
      ]
    }
  ]
}
```

**Notes**:

- Column count is specified by the `row` value (e.g., `row: 4` = 4-column grid)
- Each item in `columns` array can span multiple columns using `colspan`
- `colspan` must not exceed the total column count
- Rows can be nested for complex layouts

**Implementation**: See `src/components/molecules/row-layout.tsx`

#### Divider

Horizontal separator line (no translation needed):

```json
{ "divider": true }
```

#### Spacer

Vertical spacing (height in pixels, no translation needed):

```json
{ "spacer": 20 }
```

#### Field

Reference to a field defined in the `fields` object:

```json
{ "field": "fieldName" }
```

**Important**:

- The field name must exist in the `fields` object
- Field translations use the field name automatically (no `key` property needed)
- Field labels, placeholders, descriptions, and options are translated using field-specific keys

### Translation Support for Layout Items

To enable translation for text and heading layout items, add a `key` property:

```json
{
  "layout": [
    {
      "text": "Please complete all required fields.",
      "key": "text.completion_notice"
    },
    {
      "h2": "Personal Information",
      "key": "h2.personal_information"
    },
    {
      "field": "fullName"
      // No key needed - field translations handled automatically
    }
  ]
}
```

Then add translations in the `localization` object:

```json
{
  "localization": {
    "en": {
      "text.completion_notice": "Please complete all required fields.",
      "h2.personal_information": "Personal Information"
    },
    "si": {
      "text.completion_notice": "කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න.",
      "h2.personal_information": "පුද්ගලික තොරතුරු"
    }
  }
}
```

**Note**: Layout items without a `key` property will display the original text value and cannot be translated. This is useful for static content that doesn't need translation.

### Complete Layout Example

```json
{
  "layout": [
    {
      "text": "Please complete all required fields. Inaccurate information may affect your application.",
      "key": "text.completion_notice"
    },
    {
      "divider": true
    },
    {
      "h2": "Personal Information",
      "key": "h2.personal_information"
    },
    {
      "row": 2,
      "columns": [
        {
          "field": "firstName",
          "colspan": 1
        },
        {
          "field": "lastName",
          "colspan": 1
        }
      ]
    },
    {
      "field": "dob"
    },
    {
      "field": "gender"
    },
    {
      "divider": true
    },
    {
      "card": "Contact Information",
      "key": "card.contact_info",
      "items": [
        {
          "text": "Please provide your contact details.",
          "key": "text.contact_instructions"
        },
        {
          "row": 2,
          "columns": [
            {
              "field": "email",
              "colspan": 1
            },
            {
              "field": "mobile",
              "colspan": 1
            }
          ]
        }
      ]
    },
    {
      "spacer": 20
    },
    {
      "h2": "Additional Details",
      "key": "h2.additional_details"
    },
    {
      "field": "address"
    }
  ]
}
```

### Layout Styling

All layout items support optional styling properties:

- `align` - Text alignment: `"left"`, `"center"`, `"right"`, or `"justify"`
- `fontSize` - Font size in pixels (e.g., `18`)
- `margin` - Margin in CSS shorthand (e.g., `"10px 0 20px 0"` or `"20px"`)

**Example with Styling**:

```json
{
  "h2": "Section Title",
  "key": "h2.section",
  "align": "center",
  "fontSize": 24,
  "margin": "30px 0 20px 0"
}
```

### Markdown Support

All text components (headings h1-h6 and text) support markdown syntax. Markdown is automatically processed and rendered as HTML.

**Supported Markdown Features**:

- **Bold text**: `**bold**` or `__bold__`
- _Italic text_: `*italic*` or `_italic_`
- Links: `[link text](https://example.com)`
- Unordered lists: `- Item 1` or `* Item 1`
- Ordered lists: `1. Item 1`
- Inline code: `` `code` ``
- Code blocks: ` ```code``` `
- Headers: `# Header` (though you should use layout item types instead)
- And other standard markdown features

**Example**:

```json
{
  "text": "**Important**: Please read the [terms](https://example.com/terms) before submitting.\n\n- Point 1\n- Point 2",
  "key": "text.important_notice"
}
```

**Note**: Markdown is processed automatically - no special configuration needed. Works seamlessly with the translation system.

### Best Practices

1. **Use headings** to organize form sections
2. **Use dividers** to visually separate major sections
3. **Use text** for important instructions or warnings (with markdown for formatting)
4. **Use cards** to group related content visually
5. **Use rows** to organize fields horizontally (e.g., date fields: day/month/year)
6. **Use spacers** sparingly for fine-tuning spacing
7. **Group related fields** together in the layout
8. **Order fields logically** (most important first, or follow user flow)
9. **Add `key` properties** to text and heading items for translation support
10. **Use descriptive keys** following the pattern `{type}.{description}` (e.g., `h2.personal_information`)
11. **Leverage markdown** in text and headings for rich formatting
12. **Use styling properties** (`align`, `fontSize`, `margin`) for visual customization

**Implementation**: See `src/components/molecules/layout-renderer.tsx`

---

## Conditional Fields

Conditional fields allow you to show or hide fields based on the value of another field. This is useful for dynamic forms that adapt based on user input.

### How Conditional Fields Work

1. A parent field has a `dependencies` property containing child fields
2. Child fields have `conditionalOptions` that define when they should be visible
3. The `ConditionalRenderer` component evaluates conditions and shows/hides fields accordingly
4. When a conditional field is hidden, its value is cleared

### Conditional Operators

Available operators (defined in `src/common/types/form.types.ts`):

- `eq` - Equals
- `neq` - Not equals
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `contains` - String contains
- `notContains` - String does not contain
- `startsWith` - String starts with
- `endsWith` - String ends with

### Basic Conditional Field Structure

```json
{
  "parentField": {
    "type": "radio-group",
    "label": "Do you have insurance?",
    "required": true,
    "options": {
      "yes": "Yes",
      "no": "No"
    },
    "dependencies": {
      "insuranceDetails": {
        "type": "textarea",
        "label": "Insurance Details",
        "required": false,
        "conditionalOptions": {
          "operator": "eq",
          "value": "yes"
        },
        "validation": {}
      }
    }
  }
}
```

**Explanation**: The `insuranceDetails` field will only appear when `parentField` equals `"yes"`.

### Conditional Field Example

From `life-insurance.json`:

```json
{
  "hasExistingPolicies": {
    "type": "radio-group",
    "label": "Do you have existing life insurance policies?",
    "required": true,
    "options": {
      "no": "No",
      "yes": "Yes"
    },
    "dependencies": {
      "existingPolicyDetails": {
        "type": "textarea",
        "label": "Existing Policy Details",
        "required": false,
        "placeholder": "Company, policy number, sum assured, etc.",
        "description": "Provide details of all existing life insurance policies.",
        "defaultValue": "",
        "validation": {
          "maxLength": 1000
        },
        "conditionalOptions": {
          "operator": "eq",
          "value": "yes"
        }
      }
    }
  }
}
```

### Operator Examples

#### Equality (`eq`)

```json
{
  "conditionalOptions": {
    "operator": "eq",
    "value": "yes"
  }
}
```

Shows field when parent field equals `"yes"`.

#### Not Equals (`neq`)

```json
{
  "conditionalOptions": {
    "operator": "neq",
    "value": "no"
  }
}
```

Shows field when parent field does not equal `"no"`.

#### Greater Than (`gt`)

```json
{
  "conditionalOptions": {
    "operator": "gt",
    "value": 18
  }
}
```

Shows field when parent field value is greater than `18`.

#### Contains (`contains`)

```json
{
  "conditionalOptions": {
    "operator": "contains",
    "value": "premium"
  }
}
```

Shows field when parent field value contains the string `"premium"`.

### Value Types

The `value` in `conditionalOptions` can be:

- `string` - For text comparisons
- `number` - For numeric comparisons
- `boolean` - For checkbox fields
- Arrays (`string[]`, `number[]`, `boolean[]`) - For multiple value checks

### Field Type Considerations

Different field types are evaluated differently:

- **Text fields** (`text`, `email`, `textarea`, etc.): String comparison
- **Number fields**: Numeric comparison
- **Checkbox fields**: Boolean comparison (`true`/`false`)
- **Select/Radio-group**: String value comparison (compares selected option value)
- **Date fields**: Timestamp comparison

### Multiple Conditional Fields

You can have multiple conditional fields under one parent:

```json
{
  "planType": {
    "type": "select",
    "label": "Select Plan",
    "options": {
      "basic": "Basic Plan",
      "premium": "Premium Plan",
      "enterprise": "Enterprise Plan"
    },
    "dependencies": {
      "premiumFeatures": {
        "type": "checkbox",
        "label": "Enable Premium Features",
        "conditionalOptions": {
          "operator": "eq",
          "value": "premium"
        }
      },
      "enterpriseContact": {
        "type": "text",
        "label": "Enterprise Contact",
        "conditionalOptions": {
          "operator": "eq",
          "value": "enterprise"
        }
      }
    }
  }
}
```

### Best Practices

1. **Use clear parent field names** that indicate they control visibility
2. **Set `required: false`** on conditional fields unless they're always required when visible
3. **Provide helpful descriptions** explaining when the field appears
4. **Test all conditional paths** to ensure fields appear/disappear correctly
5. **Use appropriate operators** - `eq`/`neq` for select/radio, `gt`/`lt` for numbers

**Implementation**:

- See `src/components/molecules/conditional-renderer.tsx` for rendering logic
- See `src/services/conditinonal.service.ts` for condition evaluation

---

## Validation

Validation rules ensure data quality and provide user feedback. Validation is defined in the `validation` property of each field.

### Available Validation Rules

```typescript
interface IFormFieldValidation {
  maxLength?: number; // Maximum character length
  minLength?: number; // Minimum character length
  min?: number; // Minimum numeric value
  max?: number; // Maximum numeric value
  pattern?: string; // Regex pattern for string matching
}
```

### Validation by Field Type

#### Text Fields (`text`, `email`, `tel`, `url`, `textarea`)

Use `minLength`, `maxLength`, and `pattern`:

```json
{
  "fullName": {
    "type": "text",
    "label": "Full Name",
    "validation": {
      "minLength": 3,
      "maxLength": 100,
      "pattern": "^[A-Za-z\\s]+$"
    }
  },
  "email": {
    "type": "email",
    "label": "Email",
    "validation": {
      "maxLength": 100
    }
  },
  "nationalId": {
    "type": "text",
    "label": "National ID",
    "validation": {
      "minLength": 5,
      "maxLength": 20,
      "pattern": "^[A-Za-z0-9]+$"
    }
  }
}
```

#### Number Fields (`number`)

Use `min` and `max`:

```json
{
  "age": {
    "type": "number",
    "label": "Age",
    "validation": {
      "min": 18,
      "max": 100
    }
  },
  "annualIncome": {
    "type": "number",
    "label": "Annual Income",
    "validation": {
      "min": 0
    }
  }
}
```

#### Date Fields (`date`, `datetime-local`)

Currently, date fields use HTML5 date validation. You can add custom validation logic if needed:

```json
{
  "birthDate": {
    "type": "date",
    "label": "Date of Birth",
    "validation": {}
  }
}
```

### Common Validation Patterns

#### Email Validation

The `email` type provides built-in email validation. You can add additional constraints:

```json
{
  "email": {
    "type": "email",
    "validation": {
      "maxLength": 100
    }
  }
}
```

#### Phone Number Validation

```json
{
  "mobile": {
    "type": "tel",
    "label": "Mobile Number",
    "validation": {
      "minLength": 9,
      "maxLength": 20,
      "pattern": "^[0-9+\\-\\s]+$"
    }
  }
}
```

#### Alphanumeric Only

```json
{
  "username": {
    "type": "text",
    "validation": {
      "pattern": "^[A-Za-z0-9]+$"
    }
  }
}
```

#### Minimum Length for Text Areas

```json
{
  "address": {
    "type": "textarea",
    "label": "Address",
    "validation": {
      "minLength": 10,
      "maxLength": 300
    }
  }
}
```

#### Numeric Range

```json
{
  "sumAssured": {
    "type": "number",
    "label": "Sum Assured",
    "validation": {
      "min": 1000000,
      "max": 50000000
    }
  }
}
```

### Regex Pattern Examples

- `^[A-Za-z\\s]+$` - Letters and spaces only
- `^[A-Za-z0-9]+$` - Alphanumeric only
- `^[0-9+\\-\\s]+$` - Numbers, plus, hyphen, and spaces
- `^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}$` - IBAN format
- `^\\+?[1-9]\\d{1,14}$` - E.164 phone format

**Note**: In JSON, regex patterns need double backslashes (`\\`) to escape special characters.

### Validation Behavior

- **Client-side validation**: HTML5 validation attributes are applied automatically
- **Required fields**: Set `required: true` on the field
- **Validation messages**: Browser default messages are shown
- **Pattern validation**: Uses HTML5 `pattern` attribute

### Best Practices

1. **Always set `maxLength`** for text fields to prevent extremely long inputs
2. **Use `pattern`** for format validation (phone numbers, IDs, etc.)
3. **Set reasonable `min`/`max`** for number fields
4. **Provide clear `description`** text explaining validation rules
5. **Test validation** with edge cases (empty, too long, invalid format)

---

## Localization

The form system supports multi-language forms through the `localization` property. Currently supported locales are: `en` (English), `si` (Sinhala), and `ta` (Tamil). The translation system automatically falls back to the original field values when translations are missing.

### How Localization Works

1. **Form Initialization**: When a form loads, the `localization` data is stored in the localization store
2. **Translation Lookup**: Components use the `useTranslation()` hook to look up translations
3. **Fallback**: If a translation key is missing, the original value from the field definition is used
4. **Reactive Updates**: Translations update automatically when the locale changes

### Localization Structure

```json
{
  "localization": {
    "en": {
      "formTitle": "English Title",
      "formDescription": "English Description",
      "fieldName.label": "English Label",
      "fieldName.placeholder": "English Placeholder",
      "fieldName.description": "English Description",
      "fieldName.options.optionValue": "English Option Label",
      "text.completion_notice": "English text content",
      "h2.section_title": "English Section Title"
    },
    "si": {
      "formTitle": "සිංහල මාතෘකාව",
      "formDescription": "සිංහල විස්තරය"
    },
    "ta": {
      "formTitle": "தமிழ் தலைப்பு",
      "formDescription": "தமிழ் விளக்கம்"
    }
  }
}
```

### Localization Keys

Localization keys follow specific patterns based on what they translate:

#### Form Metadata Keys

- `formTitle` - Form title displayed at the top
- `formDescription` - Form description displayed below the title

#### Field Keys

- `{fieldName}.label` - Field label
- `{fieldName}.placeholder` - Field placeholder text
- `{fieldName}.description` - Field help/description text
- `{fieldName}.options.{optionValue}` - Option label for select/radio-group fields

**Example**:

```json
{
  "gender.label": "Gender",
  "gender.options.male": "Male",
  "gender.options.female": "Female",
  "gender.options.other": "Other / Prefer not to say"
}
```

#### Layout Item Keys

For non-field layout items (text, headings), use a `key` property in the layout item:

```json
{
  "layout": [
    {
      "text": "Please complete all required fields.",
      "key": "text.completion_notice"
    },
    {
      "h2": "Personal Information",
      "key": "h2.personal_information"
    }
  ]
}
```

Then add translations:

```json
{
  "localization": {
    "en": {
      "text.completion_notice": "Please complete all required fields.",
      "h2.personal_information": "Personal Information"
    },
    "si": {
      "text.completion_notice": "කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න.",
      "h2.personal_information": "පුද්ගලික තොරතුරු"
    }
  }
}
```

**Note**: Layout items without a `key` property will display the original text value and cannot be translated.

### Complete Localization Example

```json
{
  "localization": {
    "en": {
      "formTitle": "Life Insurance Proposal Form",
      "formDescription": "Apply for comprehensive life insurance cover with optional riders and beneficiary nominations.",
      "text.completion_notice": "Please complete all required fields. Inaccurate information may affect your cover and claim eligibility.",
      "h2.personal_information": "Personal Information",
      "h2.health_information": "Health Information",
      "h2.coverage_details": "Coverage Details",
      "h2.beneficiary_information": "Beneficiary Information",
      "h2.documents_declaration": "Documents & Declaration",
      "fullName.label": "Full Name (as per NIC / Passport)",
      "fullName.placeholder": "e.g. Perera A.B.C.",
      "fullName.description": "Please enter your full legal name including all middle names.",
      "gender.label": "Gender",
      "gender.options.male": "Male",
      "gender.options.female": "Female",
      "gender.options.other": "Other / Prefer not to say",
      "maritalStatus.label": "Marital Status",
      "maritalStatus.placeholder": "Select marital status",
      "maritalStatus.options.single": "Single",
      "maritalStatus.options.married": "Married",
      "maritalStatus.options.widowed": "Widowed",
      "maritalStatus.options.divorced": "Divorced",
      "sumAssured.label": "Requested Sum Assured (LKR)",
      "sumAssured.placeholder": "e.g. 10000000",
      "sumAssured.description": "Total life cover amount you are applying for."
    },
    "si": {
      "formTitle": "ජීවිත රක්ෂණ යෝජනා පත්‍රය",
      "formDescription": "විකල්ප අතිරේක ප්‍රතිලාභ සහ වාරසාධිකයින් නම් කිරීම සමඟ සම්පූර්ණ ජීවිත රක්ෂණ ආවරණයක් සඳහා අයදුම් කරන්න.",
      "text.completion_notice": "කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න. නිවැරදි නොවන තොරතුරු ඔබගේ ආවරණය සහ හිමිකම් සුදුසුකම්වලට බලපෑම් කළ හැකිය.",
      "h2.personal_information": "පුද්ගලික තොරතුරු",
      "h2.health_information": "සෞඛ්‍ය තොරතුරු",
      "h2.coverage_details": "ආවරණ විස්තර",
      "h2.beneficiary_information": "වාරසාධික තොරතුරු",
      "h2.documents_declaration": "ලේඛන සහ ප්‍රකාශනය",
      "fullName.label": "සම්පූර්ණ නම (ජා.හැ./ පස්පෝට් අනුව)",
      "fullName.placeholder": "උදා: පෙරේරා A.B.C.",
      "fullName.description": "කරුණාකර ඔබගේ සම්පූර්ණ නීත්‍යානුකූල නම මැද නම් ඇතුළුව ඇතුළත් කරන්න.",
      "gender.label": "ලිංගය",
      "gender.options.male": "පිරිමි",
      "gender.options.female": "ගැහැණු",
      "gender.options.other": "වෙනත් / කීමට කැමති නැත",
      "maritalStatus.label": "විවාහක තත්ත්වය",
      "maritalStatus.placeholder": "විවාහක තත්ත්වය තෝරන්න",
      "maritalStatus.options.single": "අවිවාහක",
      "maritalStatus.options.married": "විවාහක",
      "maritalStatus.options.widowed": "වැන්දඹු",
      "maritalStatus.options.divorced": "දික්කසාද",
      "sumAssured.label": "ඉල්ලෙන ආවරණ (රු.)",
      "sumAssured.placeholder": "උදා: 10000000",
      "sumAssured.description": "ඔබ අයදුම් කරන සම්පූර්ණ ජීවිත ආවරණ මුදල."
    },
    "ta": {
      "formTitle": "வாழ்க்கை காப்பீட்டு முன்மொழிவு படிவம்",
      "formDescription": "கூடுதல் ரைடர்களும் பயனாளி நியமனங்களும் உடன் முழுமையான வாழ்க்கை காப்பீட்டு பாதுகாப்புக்கு விண்ணப்பிக்கவும்.",
      "text.completion_notice": "தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்பவும். துல்லியமற்ற தகவல்கள் உங்கள் பாதுகாப்பு மற்றும் கோரிக்கை தகுதியை பாதிக்கலாம்.",
      "h2.personal_information": "தனிப்பட்ட தகவல்",
      "h2.health_information": "சுகாதார தகவல்",
      "h2.coverage_details": "பாதுகாப்பு விவரங்கள்",
      "h2.beneficiary_information": "பயனாளி தகவல்",
      "h2.documents_declaration": "ஆவணங்கள் மற்றும் அறிவிப்பு",
      "fullName.label": "முழுப்பெயர் (தே.அ/ பாஸ்போர்ட் படி)",
      "fullName.placeholder": "எ.கா: பெரேரா A.B.C.",
      "fullName.description": "தயவுசெய்து உங்கள் முழு சட்டப்பூர்வ பெயரை அனைத்து நடுத்தர பெயர்களுடன் உள்ளிடவும்.",
      "gender.label": "பாலினம்",
      "gender.options.male": "ஆண்",
      "gender.options.female": "பெண்",
      "gender.options.other": "மற்றவை / சொல்ல விரும்பவில்லை",
      "maritalStatus.label": "திருமண நிலை",
      "maritalStatus.placeholder": "திருமண நிலையைத் தேர்ந்தெடுக்கவும்",
      "maritalStatus.options.single": "திருமணமாகாத",
      "maritalStatus.options.married": "திருமணமான",
      "maritalStatus.options.widowed": "விதவை",
      "maritalStatus.options.divorced": "விவாகரத்து",
      "sumAssured.label": "கோரப்பட்ட காப்பீட்டு தொகை (LKR)",
      "sumAssured.placeholder": "எ.கா: 10000000",
      "sumAssured.description": "நீங்கள் விண்ணப்பிக்கும் மொத்த வாழ்க்கை காப்பீட்டு தொகை."
    }
  }
}
```

### Translating Layout Items

To translate non-field layout items (text, headings), add a `key` property to the layout item:

```json
{
  "layout": [
    {
      "text": "Please complete all required fields.",
      "key": "text.completion_notice"
    },
    {
      "h2": "Personal Information",
      "key": "h2.personal_information"
    },
    {
      "h2": "Contact Details",
      "key": "h2.contact_details"
    },
    {
      "divider": true
      // No key needed - divider has no text
    },
    {
      "field": "email"
      // No key needed - field translations use field name
    }
  ]
}
```

**Key Naming Convention**: Use descriptive keys like `{type}.{description}`:

- `text.completion_notice`
- `h2.personal_information`
- `h2.health_information`
- `h1.main_title`

### Translating Field Options

For `select` and `radio-group` fields, translate each option using the pattern `{fieldName}.options.{optionValue}`:

```json
{
  "fields": {
    "gender": {
      "type": "radio-group",
      "options": {
        "male": "Male",
        "female": "Female",
        "other": "Other"
      }
    }
  },
  "localization": {
    "en": {
      "gender.label": "Gender",
      "gender.options.male": "Male",
      "gender.options.female": "Female",
      "gender.options.other": "Other"
    },
    "si": {
      "gender.label": "ලිංගය",
      "gender.options.male": "පිරිමි",
      "gender.options.female": "ගැහැණු",
      "gender.options.other": "වෙනත්"
    }
  }
}
```

**Important**: The `optionValue` in the translation key must match the key in the `options` object, not the label.

### Setting Available Locales

Define which locales your form supports in `metadata.availableLocales`:

```json
{
  "metadata": {
    "availableLocales": ["en", "si", "ta"],
    "defaultLocale": "en"
  }
}
```

**Note**: `defaultLocale` is optional. If not specified, `"en"` is used as the default.

### Translation Fallback Behavior

The translation system uses a fallback mechanism:

1. **Translation exists**: Uses the translated value
2. **Translation missing**: Falls back to the original value from the field definition or layout item
3. **Empty translation**: Falls back to the original value (empty strings are treated as missing)

This ensures forms always display content, even with incomplete translations.

### Localization Best Practices

1. **Include all supported locales** in the `localization` object
2. **Translate all user-facing text**:
   - Form title and description
   - Field labels, placeholders, and descriptions
   - Field options (select/radio-group)
   - Layout items (text, headings) using `key` property
3. **Use consistent key naming**: Follow the patterns `{fieldName}.{property}` and `{type}.{description}`
4. **Keep keys consistent** across locales - same keys should exist in all locale objects
5. **Test with different locales** to ensure proper rendering
6. **Consider text length** - some languages may need more space
7. **Use descriptive keys** for layout items (e.g., `h2.personal_information` not `h2.section1`)

### Partial Localization

You don't need to translate everything. If a key is missing for a locale, the default value from the field definition or layout item will be used:

```json
{
  "localization": {
    "en": {
      "fullName.label": "Full Name",
      "fullName.placeholder": "Enter your name"
    },
    "si": {
      "fullName.label": "සම්පූර්ණ නම"
      // "fullName.placeholder" missing - will use "Enter your name" from field definition
    }
    // "ta" missing entirely - will use all default values from field definitions
  }
}
```

### Implementation Details

- **Translation Hook**: Components use `useTranslation()` hook from `src/hooks/useTranslation.hook.ts`
- **Field Key Utilities**: Translation keys are generated using utilities from `src/utils/fieldKey.utils.ts`
- **Localization Store**: Translations are managed by Zustand store in `src/stores/localization.store.ts`
- **Automatic Updates**: Translations update reactively when locale changes via the locale selector

---

## Advanced Features

### Prefilled Fields

Some fields can be automatically prefilled from external sources (e.g., OTP service, user session).

**Configuration**:

```json
{
  "prefilledFields": ["email", "mobile", "fullName"]
}
```

**Notes**:

- Field names must match keys in the `fields` object
- Prefilled fields are typically read-only or disabled
- Values are set when the form is initialized

### File Upload Options

File fields support advanced configuration:

```json
{
  "document": {
    "type": "file",
    "fileOptions": {
      "maxSize": 5242880, // 5MB in bytes
      "allowedExtensions": ["pdf", "jpg", "jpeg", "png"],
      "multiple": false // Single or multiple files
    }
  }
}
```

**File Size**: Specify in bytes (e.g., `5242880` = 5MB)

**Allowed Extensions**: Array of extensions without dots (e.g., `["pdf", "jpg"]`)

**Multiple Files**: Set `multiple: true` to allow multiple file selection

### Radio Group Orientation

Control the layout of radio button groups:

```json
{
  "preference": {
    "type": "radio-group",
    "orientation": "horizontal", // or "vertical" (default)
    "options": {
      "option1": "Option 1",
      "option2": "Option 2"
    }
  }
}
```

- `"vertical"` (default) - Options stacked vertically
- `"horizontal"` - Options displayed in a row

### Textarea Rows

Control the visible height of textarea fields:

```json
{
  "comments": {
    "type": "textarea",
    "rows": 6, // Number of visible rows
    "label": "Comments"
  }
}
```

**Default**: If not specified, browser default is used (typically 2-3 rows)

### Field Dependencies (Nested)

You can nest conditional fields multiple levels deep:

```json
{
  "hasInsurance": {
    "type": "radio-group",
    "options": { "yes": "Yes", "no": "No" },
    "dependencies": {
      "insuranceType": {
        "type": "select",
        "options": { "life": "Life", "health": "Health" },
        "conditionalOptions": { "operator": "eq", "value": "yes" },
        "dependencies": {
          "policyNumber": {
            "type": "text",
            "conditionalOptions": { "operator": "eq", "value": "life" }
          }
        }
      }
    }
  }
}
```

**Note**: Deep nesting is supported, but keep it simple for better UX.

### Default Values

Set default values for fields:

```json
{
  "country": {
    "type": "select",
    "defaultValue": "lk", // Pre-selects "lk" option
    "options": {
      "us": "United States",
      "lk": "Sri Lanka"
    }
  },
  "newsletter": {
    "type": "checkbox",
    "defaultValue": "true", // Checked by default
    "checked": true
  }
}
```

**Notes**:

- For checkboxes, use `"true"` string or `true` boolean
- For select/radio, use the option value string
- Default values are set when the form initializes

---

## Complete Example

Let's walk through a complete example form. This example demonstrates most features:

### Example: Job Application Form

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "Job Application Form",
    "formDescription": "Apply for a position with our company",
    "availableLocales": ["en", "si"],
    "otpRequired": false
  },
  "prefilledFields": ["email"],
  "submission": {
    "endpoint": "/api/forms/job-application",
    "method": "POST",
    "requiresAccessToken": true
  },
  "fields": {
    "fullName": {
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "John Doe",
      "description": "Enter your full legal name",
      "defaultValue": "",
      "validation": {
        "minLength": 3,
        "maxLength": 100
      }
    },
    "email": {
      "type": "email",
      "label": "Email Address",
      "required": true,
      "placeholder": "john@example.com",
      "description": "",
      "defaultValue": "",
      "validation": {
        "maxLength": 100
      }
    },
    "phone": {
      "type": "tel",
      "label": "Phone Number",
      "required": true,
      "placeholder": "+94 7X XXX XXXX",
      "description": "",
      "defaultValue": "",
      "validation": {
        "minLength": 9,
        "maxLength": 20,
        "pattern": "^[0-9+\\-\\s]+$"
      }
    },
    "position": {
      "type": "select",
      "label": "Position Applied For",
      "required": true,
      "placeholder": "Select a position",
      "description": "",
      "defaultValue": "",
      "validation": {},
      "options": {
        "developer": "Software Developer",
        "designer": "UI/UX Designer",
        "manager": "Project Manager"
      }
    },
    "experience": {
      "type": "number",
      "label": "Years of Experience",
      "required": true,
      "placeholder": "5",
      "description": "",
      "defaultValue": "",
      "validation": {
        "min": 0,
        "max": 50
      }
    },
    "hasPortfolio": {
      "type": "radio-group",
      "label": "Do you have a portfolio?",
      "required": true,
      "placeholder": "",
      "description": "",
      "defaultValue": "",
      "validation": {},
      "options": {
        "yes": "Yes",
        "no": "No"
      },
      "dependencies": {
        "portfolioUrl": {
          "type": "url",
          "label": "Portfolio URL",
          "required": false,
          "placeholder": "https://yourportfolio.com",
          "description": "",
          "defaultValue": "",
          "validation": {},
          "conditionalOptions": {
            "operator": "eq",
            "value": "yes"
          }
        }
      }
    },
    "coverLetter": {
      "type": "textarea",
      "label": "Cover Letter",
      "required": true,
      "placeholder": "Tell us why you're a good fit...",
      "description": "Minimum 100 characters",
      "defaultValue": "",
      "validation": {
        "minLength": 100,
        "maxLength": 2000
      },
      "rows": 6
    },
    "resume": {
      "type": "file",
      "label": "Upload Resume",
      "required": true,
      "placeholder": "",
      "description": "PDF or DOCX format, max 5MB",
      "defaultValue": "",
      "validation": {},
      "fileOptions": {
        "maxSize": 5242880,
        "allowedExtensions": ["pdf", "docx"],
        "multiple": false
      }
    },
    "agreeToTerms": {
      "type": "checkbox",
      "label": "I agree to the terms and conditions",
      "required": true,
      "placeholder": "",
      "description": "",
      "defaultValue": "",
      "validation": {},
      "checked": false
    }
  },
  "layout": [
    {
      "text": "Please fill out all required fields. Incomplete applications will not be considered."
    },
    {
      "divider": true
    },
    {
      "h2": "Personal Information"
    },
    {
      "field": "fullName"
    },
    {
      "field": "email"
    },
    {
      "field": "phone"
    },
    {
      "divider": true
    },
    {
      "h2": "Application Details"
    },
    {
      "field": "position"
    },
    {
      "field": "experience"
    },
    {
      "field": "hasPortfolio"
    },
    {
      "divider": true
    },
    {
      "h2": "Documents"
    },
    {
      "field": "coverLetter"
    },
    {
      "field": "resume"
    },
    {
      "divider": true
    },
    {
      "h2": "Agreement"
    },
    {
      "field": "agreeToTerms"
    }
  ],
  "localization": {
    "en": {
      "formTitle": "Job Application Form",
      "formDescription": "Apply for a position with our company",
      "fullName.label": "Full Name",
      "position.label": "Position Applied For"
    },
    "si": {
      "formTitle": "රැකියා අයදුම් පත්‍රය",
      "formDescription": "අපගේ සමාගමේ රැකියාවක් සඳහා අයදුම් කරන්න",
      "fullName.label": "සම්පූර්ණ නම"
    }
  }
}
```

### Key Features Demonstrated

1. ✅ **Metadata** - Form version, title, description, locales
2. ✅ **Prefilled Fields** - Email is prefilled
3. ✅ **Submission Config** - API endpoint and method
4. ✅ **Multiple Field Types** - Text, email, tel, select, number, radio-group, textarea, file, checkbox
5. ✅ **Validation** - minLength, maxLength, min, max, pattern
6. ✅ **Conditional Fields** - Portfolio URL appears when "Yes" is selected
7. ✅ **Layout** - Headings, dividers, fields organized logically
8. ✅ **File Options** - Resume upload with size and extension limits
9. ✅ **Textarea Rows** - Cover letter with 6 rows
10. ✅ **Localization** - English and Sinhala translations

### Reference: life-insurance.json

For a production-ready example, see `src/forms/life-insurance.json`. It demonstrates:

- Complex conditional logic
- Multiple field types
- Comprehensive validation
- Full localization (en, si, ta)
- Well-organized layout structure

---

## Troubleshooting

### Common Issues and Solutions

#### Field Not Appearing

**Problem**: Field defined in `fields` but not showing in form.

**Solutions**:

- Check that the field name in `layout` matches the key in `fields`
- Verify the field is included in the `layout` array
- Check for JSON syntax errors (missing commas, quotes)

**Example**:

```json
// ❌ Wrong - field name mismatch
"fields": { "fullName": {...} }
"layout": [{ "field": "full_name" }]  // Should be "fullName"

// ✅ Correct
"fields": { "fullName": {...} }
"layout": [{ "field": "fullName" }]
```

#### Conditional Field Not Showing/Hiding

**Problem**: Conditional field doesn't appear or disappear when expected.

**Solutions**:

1. Verify `conditionalOptions.operator` is correct
2. Check that `conditionalOptions.value` matches the parent field's option value exactly
3. Ensure parent field is in `dependencies` of the correct parent
4. Check field types - some operators work differently for different types

**Debugging**:

- Check browser console for warnings
- Verify parent field value matches expected value (case-sensitive)
- Test with different operators (`eq` vs `neq`)

**Example**:

```json
// ❌ Wrong - value mismatch
"parent": {
  "options": { "yes": "Yes" },
  "dependencies": {
    "child": {
      "conditionalOptions": {
        "operator": "eq",
        "value": "Yes"  // Should be "yes" (option key, not label)
      }
    }
  }
}

// ✅ Correct
"conditionalOptions": {
  "operator": "eq",
  "value": "yes"  // Matches option key
}
```

#### Validation Not Working

**Problem**: Validation rules not being enforced.

**Solutions**:

1. Check that `validation` object is not empty `{}` if you want validation
2. Verify validation rules match field type (e.g., `min`/`max` for numbers, `minLength`/`maxLength` for text)
3. Ensure `required: true` is set for required fields
4. Check regex patterns - escape special characters with `\\`

**Example**:

```json
// ❌ Wrong - using min/max on text field
{
  "type": "text",
  "validation": {
    "min": 3,  // Should be minLength
    "max": 100  // Should be maxLength
  }
}

// ✅ Correct
{
  "type": "text",
  "validation": {
    "minLength": 3,
    "maxLength": 100
  }
}
```

#### JSON Syntax Errors

**Problem**: Form doesn't load, JSON parse errors.

**Solutions**:

1. Validate JSON syntax using a JSON validator
2. Check for:
   - Missing commas between objects
   - Trailing commas (not allowed in JSON)
   - Unclosed brackets/braces
   - Unescaped quotes in strings

**Common Mistakes**:

```json
// ❌ Trailing comma
{
  "field1": {...},
  "field2": {...},  // Remove this comma
}

// ✅ Correct
{
  "field1": {...},
  "field2": {...}
}
```

#### File Upload Issues

**Problem**: File upload not working or rejecting valid files.

**Solutions**:

1. Check `fileOptions.allowedExtensions` - extensions should be lowercase without dots
2. Verify `maxSize` is in bytes (e.g., 5MB = 5242880 bytes)
3. Ensure `multiple` is set correctly (boolean, not string)

**Example**:

```json
// ❌ Wrong - extensions with dots
"fileOptions": {
  "allowedExtensions": [".pdf", ".jpg"]  // Should be without dots
}

// ✅ Correct
"fileOptions": {
  "allowedExtensions": ["pdf", "jpg", "jpeg", "png"]
}
```

#### Localization Not Working

**Problem**: Translations not appearing.

**Solutions**:

1. Verify locale is in `metadata.availableLocales`
2. Check localization key format: `{fieldName}.label`, `{fieldName}.placeholder`, etc.
3. Ensure locale key exists in `localization` object
4. Check that field names match exactly (case-sensitive)
5. For layout items, ensure `key` property is added to the layout item
6. Verify translation keys match the `key` property values exactly

**Field Translation Example**:

```json
// ❌ Wrong - incorrect key format
"localization": {
  "en": {
    "full_name.label": "Full Name"  // Should match field key exactly
  }
}

// ✅ Correct
"localization": {
  "en": {
    "fullName.label": "Full Name"  // Matches field key "fullName"
  }
}
```

**Layout Item Translation Example**:

```json
// ❌ Wrong - missing key property in layout
{
  "layout": [
    {
      "h2": "Personal Information"
      // Missing "key" property - cannot be translated
    }
  ],
  "localization": {
    "en": {
      "h2.personal_information": "Personal Information"  // Key exists but layout item has no key property
    }
  }
}

// ✅ Correct
{
  "layout": [
    {
      "h2": "Personal Information",
      "key": "h2.personal_information"  // Key property matches localization key
    }
  ],
  "localization": {
    "en": {
      "h2.personal_information": "Personal Information"
    }
  }
}
```

**Option Translation Example**:

```json
// ❌ Wrong - using option label instead of option value
{
  "fields": {
    "gender": {
      "options": {
        "male": "Male",
        "female": "Female"
      }
    }
  },
  "localization": {
    "en": {
      "gender.options.Male": "Male"  // Should use option key "male", not label "Male"
    }
  }
}

// ✅ Correct
{
  "localization": {
    "en": {
      "gender.options.male": "Male",  // Uses option key "male"
      "gender.options.female": "Female"
    }
  }
}
```

#### Select/Radio Options Not Showing

**Problem**: Options not appearing in select or radio-group fields.

**Solutions**:

1. Verify `options` object exists and is not empty
2. Check that option values are strings
3. Ensure `options` is an object, not an array

**Example**:

```json
// ❌ Wrong - options as array
{
  "type": "select",
  "options": ["Option 1", "Option 2"]  // Should be object
}

// ✅ Correct
{
  "type": "select",
  "options": {
    "option1": "Option 1",
    "option2": "Option 2"
  }
}
```

### Validation Tips

1. **Test edge cases**: Empty values, maximum length, boundary values
2. **Use browser DevTools**: Check HTML5 validation attributes are applied
3. **Pattern testing**: Test regex patterns with various inputs
4. **Required fields**: Always set `required: true` for mandatory fields

### Conditional Rendering Debugging

1. **Check console warnings**: `ConditionalRenderer` logs warnings for missing operators/values
2. **Verify parent field value**: Use form store to check actual values
3. **Test operators**: Try different operators to see which works
4. **Field type matters**: Some operators behave differently for different field types

### Best Practices to Avoid Issues

1. **Use consistent naming**: Use camelCase for field names
2. **Validate JSON**: Use a JSON validator before testing
3. **Test incrementally**: Add fields one at a time and test
4. **Reference examples**: Use `life-insurance.json` as a reference
5. **Check types**: Ensure field types match their usage (e.g., `number` for numeric inputs)

---

## Additional Resources

### Code References

- **Form Interfaces**: [`src/common/interfaces/form.interfaces.ts`](src/common/interfaces/form.interfaces.ts)
- **Type Definitions**: [`src/common/types/form.types.ts`](src/common/types/form.types.ts)
- **Form Loading**: [`src/forms/index.ts`](src/forms/index.ts)
- **Form Rendering**: [`src/components/organism/form-view.tsx`](src/components/organism/form-view.tsx)
- **Layout Renderer**: [`src/components/molecules/layout-renderer.tsx`](src/components/molecules/layout-renderer.tsx)
- **Conditional Renderer**: [`src/components/molecules/conditional-renderer.tsx`](src/components/molecules/conditional-renderer.tsx)
- **Conditional Service**: [`src/services/conditinonal.service.ts`](src/services/conditinonal.service.ts)
- **Form Store**: [`src/stores/form.store.ts`](src/stores/form.store.ts)

### Example Forms

- **Life Insurance Form**: [`src/forms/life-insurance.json`](src/forms/life-insurance.json) - Complete production example

### Field Components

- **Text Field**: [`src/components/molecules/text-field.tsx`](src/components/molecules/text-field.tsx)
- **Select Field**: [`src/components/molecules/select-field.tsx`](src/components/molecules/select-field.tsx)
- **Radio Group**: [`src/components/molecules/radio-group-field.tsx`](src/components/molecules/radio-group-field.tsx)
- **Checkbox**: [`src/components/molecules/checkbox-field.tsx`](src/components/molecules/checkbox-field.tsx)
- **Checkbox Group**: [`src/components/molecules/checkbox-group-field.tsx`](src/components/molecules/checkbox-group-field.tsx)
- **Textarea**: [`src/components/molecules/textarea-field.tsx`](src/components/molecules/textarea-field.tsx)
- **File Field**: [`src/components/molecules/file-field.tsx`](src/components/molecules/file-field.tsx)
- **Text Card**: [`src/components/molecules/text-card.tsx`](src/components/molecules/text-card.tsx)
- **Row Layout**: [`src/components/molecules/row-layout.tsx`](src/components/molecules/row-layout.tsx)

---

## Conclusion

This guide covers all aspects of building forms in the JSON-based form system. For additional help:

1. Review the example form: `src/forms/life-insurance.json`
2. Check the TypeScript interfaces for type definitions
3. Refer to the troubleshooting section for common issues
4. Test your form incrementally as you build it

Happy form building!
