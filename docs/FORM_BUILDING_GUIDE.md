# Form Building Guide

## Quick Start

Create a new form using the script:

```bash
pnpm new-form --name my-form
```

This creates `src/forms/my-form/` with these YAML files:

| File                       | Purpose                     |
| -------------------------- | --------------------------- |
| `my-form.metadata.yml`     | Title, description, locales |
| `my-form.otp.yml`          | OTP verification config     |
| `my-form.submission.yml`   | API endpoint config         |
| `my-form.fields.yml`       | Field definitions           |
| `my-form.layout.yml`       | Form structure/order        |
| `my-form.localization.yml` | Translations (en, si, ta)   |

Access form at: `/forms/my-form`

---

## File Structure

### metadata.yml

```yaml
formVersion: 1
formTitle: My Form
formDescription: Form description
showFormHeader: true
availableLocales:
  - en
  - si
  - ta
defaultLocale: en
searchParamsVariables:
  cs: contract_sequence
  id: card_id
```

### submission.yml

```yaml
endpoint: /api/forms/my-form
method: POST
requiresAccessToken: true
```

### fields.yml

```yaml
fieldName:
  type: text
  label: Field Label
  required: true
  placeholder: Enter value
  description: Help text
  defaultValue: ""
  validation:
    minLength: 3
    maxLength: 100
```

### layout.yml

```yaml
- h2: Section Title
- field: fieldName
- spacer: 20
- divider: true
- submit: Submit
```

### localization.yml

```yaml
en:
  fieldName.label: Field Label
  fieldName.placeholder: Enter value
si:
  fieldName.label: ක්ෂේත්‍ර නාමය
ta:
  fieldName.label: புல பெயர்
```

---

## Field Types

| Type             | Description           | Extra Properties          |
| ---------------- | --------------------- | ------------------------- |
| `text`           | Single-line text      | -                         |
| `email`          | Email with validation | -                         |
| `password`       | Masked input          | -                         |
| `tel`            | Phone number          | -                         |
| `url`            | URL input             | -                         |
| `number`         | Numeric input         | validation: `min`, `max`  |
| `date`           | Date picker           | -                         |
| `time`           | Time picker           | -                         |
| `datetime-local` | Date & time           | -                         |
| `textarea`       | Multi-line text       | `rows: 4`                 |
| `select`         | Dropdown              | `options: {value: Label}` |
| `radio-group`    | Radio buttons         | `options`, `orientation`  |
| `checkbox`       | Single checkbox       | `checked: false`          |
| `checkbox-group` | Multiple checkboxes   | `options: {value: Label}` |
| `file`           | File upload           | `fileOptions`             |
| `age`            | Age calculator        | `dateOfBirthField`, `format`, `toDate` |

### Field Examples

**Text with validation:**

```yaml
fullName:
  type: text
  label: Full Name
  required: true
  placeholder: e.g. John Doe
  validation:
    minLength: 3
    maxLength: 100
    pattern: "^[A-Za-z\\s]+$"
```

**Select/Dropdown:**

```yaml
country:
  type: select
  label: Country
  required: true
  placeholder: Select country
  options:
    lk: Sri Lanka
    us: United States
    uk: United Kingdom
```

**Radio Group:**

```yaml
gender:
  type: radio-group
  label: Gender
  required: true
  orientation: vertical
  options:
    male: Male
    female: Female
    other: Other
```

**File Upload:**

```yaml
document:
  type: file
  label: Upload Document
  required: true
  description: PDF or JPG, max 5MB
  fileOptions:
    maxSize: 5242880
    allowedExtensions:
      - pdf
      - jpg
      - png
    multiple: false
```

**Age Field (Auto-calculated):**

The age field automatically calculates age from a date of birth field. It updates in real-time when the date of birth changes.

```yaml
dateOfBirth:
  type: date
  label: Date of Birth
  required: true
  placeholder: Select your date of birth
  description: Your date of birth

age:
  type: age
  label: Age
  required: false
  placeholder: Automatically calculated
  description: Your age (automatically calculated)
  dateOfBirthField: dateOfBirth  # Required: name of the date of birth field
  format: "{y} years, {m} months, {d} days"  # Optional: format string (default: "{y}")
  toDate: "{{$today}}"  # Optional: target date for calculation (defaults to current date)
```

**Format String Placeholders:**
- `{y}` - Years
- `{m}` - Months
- `{d}` - Days

**Examples:**
- `format: "{y}"` → "25"
- `format: "{y} years"` → "25 years"
- `format: "{y} years, {m} months"` → "25 years, 3 months"
- `format: "{y} years, {m} months, {d} days"` → "25 years, 3 months, 10 days"

**toDate Variable Support:**
The `toDate` field supports variables like `{{$today}}` for dynamic date calculation. If not specified, it defaults to the current date.

---

## Layout Items

| Item     | Syntax                      | Description                          |
| -------- | --------------------------- | ------------------------------------ |
| Headings | `h1: Title` to `h6: Title`  | Section headings (supports markdown) |
| Text     | `text: Content`             | Paragraph text (supports markdown)   |
| Field    | `field: fieldName`          | Renders a field                      |
| Spacer   | `spacer: 20`                | Vertical space (pixels)              |
| Divider  | `divider: true`             | Horizontal line                      |
| Submit   | `submit: Submit`            | Submit button                        |
| Reset    | `reset: Reset`              | Reset button                         |
| Card     | `card: Title` + `items: []` | Grouped content                      |
| Row      | `row: 2` + `columns: []`    | Multi-column layout                  |

### Row Layout

```yaml
- row: 2
  columns:
    - field: firstName
      colspan: 1
    - field: lastName
      colspan: 1
```

### Card Layout

```yaml
- card: Important Notice
  items:
    - text: Please review carefully.
    - field: confirmCheckbox
```

### Styling

```yaml
- h2: Centered Title
  align: center
  fontSize: 24
  margin: "20px 0"
```

---

## Conditional Fields

Fields that show/hide based on another field's value.

```yaml
hasInsurance:
  type: radio-group
  label: Do you have insurance?
  options:
    yes: "Yes"
    no: "No"
  dependencies:
    insuranceDetails:
      type: textarea
      label: Insurance Details
      conditionalOptions:
        operator: eq
        value: "yes"
```

### Operators

| Operator      | Description             |
| ------------- | ----------------------- |
| `eq`          | Equals                  |
| `neq`         | Not equals              |
| `gt`          | Greater than            |
| `gte`         | Greater than or equal   |
| `lt`          | Less than               |
| `lte`         | Less than or equal      |
| `contains`    | String contains         |
| `notContains` | String does not contain |
| `startsWith`  | String starts with      |
| `endsWith`    | String ends with        |

---

## Validation

```yaml
validation:
  minLength: 3 # Text: minimum characters
  maxLength: 100 # Text: maximum characters
  min: 0 # Number: minimum value
  max: 100 # Number: maximum value
  pattern: "^[A-Za-z]+$" # Regex pattern
```

---

## Localization

### Field Translations

```yaml
en:
  fieldName.label: English Label
  fieldName.placeholder: Enter value
  fieldName.description: Help text
  fieldName.options.value1: Option 1
  fieldName.options.value2: Option 2
si:
  fieldName.label: සිංහල ලේබලය
```

### Layout Translations

Add `key` to layout items:

```yaml
# layout.yml
- h2: Personal Info
  key: h2.personal_info
- text: Fill all fields
  key: text.instructions
```

```yaml
# localization.yml
en:
  h2.personal_info: Personal Information
  text.instructions: Please fill all required fields.
si:
  h2.personal_info: පුද්ගලික තොරතුරු
```

---

## OTP Configuration

```yaml
enabled: true
dialog:
  title: OTP Verification
  content: Enter the OTP sent to your phone.
  button: Verify
  inputLabel: OTP
  inputPlaceholder: Enter OTP
verification:
  method: GET
  baseUrl: https://api.example.com
  endpoint: /verify-otp
  headers:
    - name: Authorization
      value: Bearer {{$TOKEN}}
  queryParams:
    - name: otp
      value: "{{otp}}"
    - name: id
      value: "{{user_id}}"
  response:
    variableMapping:
      - path: "[0].clientName"
        to: client_name
        required: true
      - path: "[0].email"
        to: email
        required: false
```

Set `enabled: false` to disable OTP.

---

## Quick Reference

### Create Form

```bash
pnpm new-form --name form-name
```

### Form URL

```
/forms/{form-name}
```

### File Locations

```
src/forms/{form-name}/
├── {form-name}.metadata.yml
├── {form-name}.otp.yml
├── {form-name}.submission.yml
├── {form-name}.fields.yml
├── {form-name}.layout.yml
└── {form-name}.localization.yml
```

### Type Definitions

- `src/common/interfaces/form.interfaces.ts`
- `src/common/types/form.types.ts`

### Example Forms

- `src/forms/life-insurance/` - Full production example
- `src/forms/otp/` - OTP form example
