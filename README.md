# Ceylinco Life Customer Form Portal

A dynamic, JSON-based form builder system built with Next.js, React, and TypeScript for Ceylinco Life Insurance Company. This portal enables customers to complete insurance applications, policy updates, and onboarding processes digitally, replacing traditional manual form-filling workflows.

## 🚀 Overview

The Ceylinco Life Customer Form Portal is a comprehensive form rendering system designed to digitalize and streamline customer interactions with Ceylinco Life Insurance Company. The system allows form administrators to create complex, multi-language forms through simple JSON definitions without writing React components, while providing customers with an intuitive, accessible form-filling experience.

### Business Value

This portal addresses the critical need to **digitalize manual form filling processes**, enabling:

- **Streamlined Customer Experience**: Customers can complete insurance applications and policy updates online
- **Multi-Language Support**: Forms are available in English, Sinhala, and Tamil to serve Sri Lankan customers
- **Reduced Processing Time**: Digital forms eliminate manual data entry and reduce processing delays
- **Improved Data Quality**: Built-in validation ensures accurate and complete submissions
- **Scalability**: New forms can be created quickly without code changes

### Key Features

- **JSON-Based Form Definition** - Define entire forms using JSON files without writing React components
- **Multi-Language Support** - Built-in localization for English (en), Sinhala (si), and Tamil (ta)
- **Conditional Fields** - Dynamic forms that show/hide fields based on customer responses
- **Comprehensive Validation** - Client-side validation with customizable rules for data quality
- **Multiple Field Types** - Text, email, number, date, select, radio, checkbox, checkbox-group, textarea, file upload
- **Dynamic Layout System** - Flexible layout with headings, text, cards, rows, dividers, and spacers
- **Markdown Support** - Rich text formatting in headings and text components
- **Layout Styling** - Customizable alignment, font size, and margins for layout items
- **OTP Integration** - Support for OTP verification and prefilled customer data
- **Type-Safe** - Full TypeScript support with strict type definitions
- **State Management** - Zustand-powered form state management
- **Modern UI** - Built with Radix UI and Tailwind CSS for professional, accessible interfaces

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **State Management**: Zustand 5
- **UI Components**: Radix UI (Checkbox, Label, Radio Group, Select, Separator)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React

## 📋 System Architecture

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
    ↓
Form submission to configured endpoint
```

### Core Components

- **FormView** (`src/components/organism/form-view.tsx`) - Main form container component
- **LayoutRenderer** (`src/components/molecules/layout-renderer.tsx`) - Renders layout items (headings, text, dividers, fields)
- **ConditionalRenderer** (`src/components/molecules/conditional-renderer.tsx`) - Handles conditional field visibility
- **Field Components** (`src/components/molecules/*-field.tsx`) - Individual field type components
- **Form Store** (`src/stores/form.store.ts`) - Zustand store for form state management
- **Localization Store** (`src/stores/localization.store.ts`) - Manages multi-language translations

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Accessing Forms

Forms are accessible via the route pattern:

```
/forms/{form-id}
```

For example, if you have `life-insurance.json` in `src/forms/`, access it at:

```
/forms/life-insurance
```

**Note**: In production, customers access forms through dedicated links provided by Ceylinco Life (via email, SMS, or other communication channels). Direct access to the main portal page is not intended for end users.

## 📝 Form Building Guide Summary

### Form Structure

Forms are defined as JSON files in `src/forms/` directory. Each form follows this structure:

```json
{
  "metadata": {
    "formVersion": 1,
    "formTitle": "Form Title",
    "formDescription": "Form description",
    "availableLocales": ["en", "si", "ta"],
    "otpRequired": false
  },
  "submission": {
    "endpoint": "/api/forms/form-name",
    "method": "POST",
    "requiresAccessToken": true
  },
  "fields": {
    "fieldName": {
      "type": "text",
      "label": "Field Label",
      "required": true,
      "validation": {}
    }
  },
  "layout": [{ "h2": "Section Title" }, { "field": "fieldName" }],
  "localization": {
    "en": {},
    "si": {},
    "ta": {}
  }
}
```

### Supported Field Types

- **Text Inputs**: `text`, `email`, `password`, `tel`, `url`, `number`, `date`, `time`, `datetime-local`
- **Select**: Dropdown selection with options
- **Radio Group**: Radio button group (vertical/horizontal orientation)
- **Checkbox**: Single checkbox field
- **Checkbox Group**: Multiple checkbox selection (stores `string[]`)
- **Textarea**: Multi-line text input
- **File**: File upload with size and extension restrictions

### Layout Items

- **Headings**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6` (with markdown support)
- **Text**: Plain text paragraphs (with markdown support)
- **Card**: Text card with neutral background and border (supports nested items)
- **Row**: Grid-based row layout with configurable columns and colspan
- **Divider**: Horizontal separator line
- **Spacer**: Vertical spacing (pixels)
- **Field**: Reference to a field defined in `fields` object

### Conditional Fields

Fields can be shown/hidden based on other field values using conditional operators:

- `eq` - Equals
- `neq` - Not equals
- `gt` / `gte` - Greater than / Greater than or equal
- `lt` / `lte` - Less than / Less than or equal
- `contains` / `notContains` - String contains / does not contain
- `startsWith` / `endsWith` - String starts/ends with

### Validation Rules

- `minLength` / `maxLength` - Text length constraints
- `min` / `max` - Numeric value constraints
- `pattern` - Regex pattern matching
- `required` - Field requirement flag

### Localization

Multi-language support through the `localization` object:

- Form metadata: `formTitle`, `formDescription`
- Field properties: `{fieldName}.label`, `{fieldName}.placeholder`, `{fieldName}.description`
- Field options: `{fieldName}.options.{optionValue}`
- Layout items: Use `key` property in layout items for translation

### Complete Documentation

For detailed form building instructions, see the **[Form Building Guide](./docs/FORM_BUILDING_GUIDE.md)**.

## 📁 Project Structure

```
workspace/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── forms/[id]/         # Dynamic form route
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── atoms/              # Basic UI components
│   │   ├── molecules/          # Field components & layout renderer
│   │   └── organism/           # Form view component
│   ├── common/
│   │   ├── interfaces/         # TypeScript interfaces
│   │   └── types/              # Type definitions
│   ├── forms/                  # Form JSON files
│   │   ├── index.ts            # Form loader utility
│   │   └── *.json              # Form definitions
│   ├── hooks/                  # React hooks
│   ├── services/               # Business logic services
│   ├── stores/                 # Zustand stores
│   └── utils/                  # Utility functions
├── docs/
│   └── FORM_BUILDING_GUIDE.md  # Complete form building documentation
├── public/                     # Static assets
└── README.md                   # This file
```

## 🔧 Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Type Checking

The project uses TypeScript with strict type checking. Run type checking via your IDE or:

```bash
npx tsc --noEmit
```

## 📚 Key Concepts

### Form Definition Flow

1. **Create JSON File** - Add a new `.json` file in `src/forms/`
2. **Define Fields** - Specify field types, labels, validation rules
3. **Create Layout** - Order fields and add headings/text/dividers
4. **Add Localization** - Provide translations for supported locales
5. **Access Form** - Navigate to `/forms/{form-id}` to view

### Field Rendering

- Fields are automatically rendered based on their `type` property
- Each field type has a corresponding component in `src/components/molecules/`
- Field values are managed by the Zustand form store
- Validation is handled client-side using HTML5 validation attributes

### Conditional Rendering

- Conditional fields are defined in `dependencies` of parent fields
- Each conditional field has `conditionalOptions` specifying when to show
- The `ConditionalRenderer` component evaluates conditions reactively
- Hidden fields have their values cleared automatically

### Localization System

- Translations are stored in the `localization` object by locale
- The `useTranslation()` hook provides translation lookup
- Falls back to original field values if translations are missing
- Layout items use `key` property for translation support

## 🎯 Example Form

See `src/forms/life-insurance.json` for a complete production-ready example demonstrating:

- Complex conditional logic
- Multiple field types
- Comprehensive validation
- Full localization (en, si, ta)
- Well-organized layout structure

## 📖 Additional Resources

- **[Form Building Guide](./docs/FORM_BUILDING_GUIDE.md)** - Complete documentation for building forms
- **Type Definitions** - `src/common/interfaces/form.interfaces.ts`
- **Form Types** - `src/common/types/form.types.ts`

## 🤝 Contributing

When adding new features:

1. Update TypeScript interfaces in `src/common/interfaces/`
2. Add corresponding types in `src/common/types/`
3. Implement field components in `src/components/molecules/`
4. Update the Form Building Guide if adding new field types or features
5. Add example usage in form JSON files

## 👥 Development & Maintenance

**Main Developer**: [Sihilel H](https://github.com/sihilelh)

**Maintained by**: Sihilel H on behalf of Coltex (External Vendor)

## 📄 License

This project contains dual intellectual property ownership:

- **Form Building Algorithm and Code**: Copyright © 2025 Sihilel Himasara Wickramarathna. All rights reserved.
- **Form Data and Information**: Copyright © 2025 Ceylinco Life Insurance Limited. All rights reserved.

For complete licensing terms, restrictions, and usage rights, see [LICENSE.md](./LICENSE.md).

**Key Points:**

- Usage is limited to the Ceylinco Life Customer Form Portal project
- Code modifications are permitted but void warranty/support from the original developer
- Form data ownership and responsibility belong to Ceylinco Life Insurance Limited
- Algorithm and code may not be sublicensed or used in other projects without authorization

For licensing inquiries, contact: hello@sihilel.com

---

**Ceylinco Life Customer Form Portal**  
_Digitalizing insurance form processes for Ceylinco Life Insurance Company, Sri Lanka_
