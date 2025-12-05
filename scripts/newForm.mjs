#!/usr/bin/env node

import fs from "fs";
import path from "path";

import yaml from "yaml";

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf("--name");

  if (nameIndex === -1 || nameIndex === args.length - 1) {
    console.error("Error: --name argument is required");
    console.error("Usage: pnpm new-form --name <form-name>");
    process.exit(1);
  }

  const formName = args[nameIndex + 1];

  if (!formName || formName.trim() === "") {
    console.error("Error: Form name cannot be empty");
    process.exit(1);
  }

  // Validate form name (kebab-case recommended)
  if (!/^[a-z0-9-]+$/.test(formName)) {
    console.warn(
      "Warning: Form name should be in kebab-case (lowercase letters, numbers, and hyphens)"
    );
  }

  return formName.trim();
}

/**
 * Convert kebab-case to Title Case
 */
function toTitleCase(formName) {
  return formName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate metadata.yml content
 */
function generateMetadata(formName, titleCase) {
  const comment = `# ${formName} form metadata

`;

  const data = {
    formVersion: 1,
    formTitle: titleCase,
    formDescription: `Form description for ${titleCase}`,
    showFormHeader: true,
    availableLocales: ["en"],
    defaultLocale: "en",
  };

  return comment + yaml.stringify(data);
}

/**
 * Generate otp.yml content (boilerplate from otp form)
 */
function generateOtp(formName) {
  const comment = `# ${formName} form otp

`;

  const data = {
    enabled: true,
    dialog: {
      title: "OTP Verification",
      content:
        "Thank you for accessing the digital forms of Ceylinco Life. In order to proceed ahead, please enter the OTP you received via SMS.",
      button: "Verify OTP",
      inputLabel: "OTP",
      inputPlaceholder: "Enter OTP",
    },
    verification: {
      method: "GET",
      baseUrl: "https://app.workhub24.com",
      endpoint:
        "/api/view/MB4EALVIJI66HLKVX6LISPLOZ6HYZL6C/Y5RKJDCXHHOUI7YHMDE27WS7JCSCIZV7",
      headers: [
        { name: "Accept", value: "application/json" },
        { name: "Authorization", value: "Bearer {{$WORKHUB_TOKEN}}" },
      ],
      queryParams: [
        { name: "OTP", value: "{{otp}}" },
        { name: "Contract_Sequence", value: "{{contract_sequence}}" },
        { name: "Card_ID", value: "{{card_id}}" },
      ],
      response: {
        variableMapping: [
          {
            path: "[0].cLOUReferenceNumber",
            to: "clou_reference",
            required: true,
          },
          { path: "[0].clientEmail", to: "client_email", required: false },
          { path: "[0].clientName", to: "client_name", required: true },
          { path: "[0].clientNumber", to: "client_number", required: false },
          { path: "[0].contactNo1", to: "contact_1", required: false },
          { path: "[0].contactNo2", to: "contact_2", required: false },
          { path: "[0].contractNumber", to: "contract_number", required: true },
          {
            path: "[0].questionnaire",
            to: "questionnaire_type",
            required: false,
          },
          { path: "[0].requestType", to: "request_type", required: false },
          { path: "[0].language", to: "preferred_language", required: false },
        ],
      },
    },
  };

  return comment + yaml.stringify(data);
}

/**
 * Generate submission.yml content
 */
function generateSubmission(formName) {
  const comment = `# ${formName} form submission

`;

  const data = {
    endpoint: `/api/forms/${formName}`,
    method: "POST",
    requiresAccessToken: true,
  };

  return comment + yaml.stringify(data);
}

/**
 * Generate fields.yml content
 */
function generateFields(formName) {
  const comment = `# ${formName} form fields
# Types: text, number, email, password, date, time, datetime-local, checkbox, radio-group, checkbox-group, select, textarea, file, url, tel

`;

  const data = {
    exampleField: {
      type: "text",
      label: "Example Field",
      required: false,
      placeholder: "Enter value",
      description: "This is an example field. Replace or remove as needed.",
    },
  };

  return comment + yaml.stringify(data);
}

/**
 * Generate layout.yml content
 */
function generateLayout(formName) {
  const comment = `# ${formName} form layout
# Items: field, h1, h2, h3, h4, h5, h6, text, spacer, divider, card, row, submit, reset

`;

  const data = [
    { h2: "Form Section" },
    { field: "exampleField" },
    { spacer: 20 },
    { submit: "Submit" },
  ];

  return comment + yaml.stringify(data);
}

/**
 * Generate localization.yml content
 */
function generateLocalization(formName) {
  const comment = `# ${formName} form localization
# Locales: en, si, ta

`;

  const data = {
    en: {},
    si: {},
    ta: {},
  };

  return comment + yaml.stringify(data);
}

/**
 * Main function
 */
function main() {
  try {
    const formName = parseArgs();
    const titleCase = toTitleCase(formName);
    const root = process.cwd();
    const formsDir = path.join(root, "src", "forms");
    const formFolder = path.join(formsDir, formName);

    // Check if forms directory exists
    if (!fs.existsSync(formsDir)) {
      console.error(`Error: Forms directory not found: ${formsDir}`);
      process.exit(1);
    }

    // Check if form folder already exists
    if (fs.existsSync(formFolder)) {
      console.error(`Error: Form folder already exists: ${formFolder}`);
      console.error(
        "Please choose a different name or delete the existing folder."
      );
      process.exit(1);
    }

    // Create form folder
    fs.mkdirSync(formFolder, { recursive: true });

    // Generate and write each YAML file
    const files = [
      {
        name: `${formName}.metadata.yml`,
        content: generateMetadata(formName, titleCase),
      },
      { name: `${formName}.otp.yml`, content: generateOtp(formName) },
      {
        name: `${formName}.submission.yml`,
        content: generateSubmission(formName),
      },
      { name: `${formName}.fields.yml`, content: generateFields(formName) },
      { name: `${formName}.layout.yml`, content: generateLayout(formName) },
      {
        name: `${formName}.localization.yml`,
        content: generateLocalization(formName),
      },
    ];

    files.forEach(({ name, content }) => {
      const filePath = path.join(formFolder, name);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  Created: ${name}`);
    });

    console.log(`\n✓ Successfully created form: ${formFolder}`);
    console.log(`\nForm ID: ${formName}`);
    console.log(`Access at: /forms/${formName}`);
    console.log(`\nNext steps:`);
    console.log(`1. Edit files in ${formFolder}/ to customize the form`);
    console.log(`2. Update ${formName}.fields.yml to add form fields`);
    console.log(`3. Update ${formName}.layout.yml to arrange form elements`);
    console.log(
      `4. Configure ${formName}.metadata.yml for title, description, locales`
    );
    console.log(
      `5. If OTP is not needed, set enabled: false in ${formName}.otp.yml`
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
