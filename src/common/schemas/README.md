# Form JSON Schema

This directory contains the JSON schema for Ceylinco form definitions.

## Usage

### Automatic Schema Association

The schema is automatically associated with all JSON files in the `src/forms/` directory via VS Code settings (`.vscode/settings.json`). When you open a form JSON file, you'll get:

- **Autocomplete** for all properties
- **Validation** of field types and values
- **IntelliSense** hints and descriptions
- **Error highlighting** for invalid properties or values

### Manual Schema Reference

You can also manually reference the schema in your JSON files by adding this at the top:

```json
{
  "$schema": "./src/common/schemas/form.schema.json",
  "metadata": {
    ...
  }
}
```

### Schema Features

The schema validates:

- ✅ **Form Structure**: metadata, submission, fields, layout, localization
- ✅ **Field Types**: All 15 field types (text, number, email, password, date, time, datetime-local, checkbox, radio-group, checkbox-group, select, textarea, file, url, tel)
- ✅ **Validation Rules**: minLength, maxLength, min, max, pattern
- ✅ **Conditional Fields**: Dependencies and conditional options
- ✅ **Layout Items**: All layout types (field, h1-h6, text, spacer, divider, card, row, submit, reset)
- ✅ **File Options**: maxSize, allowedExtensions, multiple
- ✅ **Localization**: Multi-language support (en, si, ta)
- ✅ **Enums**: HTTP methods, field types, operators, alignments, etc.

### Example

When editing `src/forms/my-form.json`, you'll see autocomplete suggestions for:

- Field types: `"text"`, `"email"`, `"select"`, etc.
- HTTP methods: `"GET"`, `"POST"`, `"PUT"`, etc.
- Conditional operators: `"eq"`, `"neq"`, `"contains"`, etc.
- Layout item types: `"field"`, `"h1"`, `"card"`, `"row"`, etc.

### Troubleshooting

If autocomplete isn't working:

1. Make sure your JSON file is in the `src/forms/` directory
2. Restart VS Code
3. Check that `.vscode/settings.json` exists and is correct
4. Verify the schema file exists at `src/common/schemas/form.schema.json`

### Schema Version

This schema is based on the TypeScript interfaces defined in:
- `src/common/interfaces/form.interfaces.ts`
- `src/common/types/form.types.ts`
- `src/common/types/common.types.ts`

