#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  
  if (nameIndex === -1 || nameIndex === args.length - 1) {
    console.error('Error: --name argument is required');
    console.error('Usage: pnpm new-form --name <form-name>');
    process.exit(1);
  }
  
  const formName = args[nameIndex + 1];
  
  if (!formName || formName.trim() === '') {
    console.error('Error: Form name cannot be empty');
    process.exit(1);
  }
  
  // Validate form name (kebab-case recommended)
  if (!/^[a-z0-9-]+$/.test(formName)) {
    console.warn('Warning: Form name should be in kebab-case (lowercase letters, numbers, and hyphens)');
  }
  
  return formName.trim();
}

/**
 * Generate empty form structure based on schema
 */
function generateEmptyForm(formName) {
  // Convert kebab-case to title case for display
  const titleCase = formName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const form = {
    metadata: {
      formVersion: 1,
      formTitle: titleCase,
      formDescription: `Form description for ${titleCase}`,
      availableLocales: ['en'],
      defaultLocale: 'en',
      otp: false
    },
    submission: {
      endpoint: `/api/forms/${formName}`,
      method: 'POST',
      requiresAccessToken: true
    },
    fields: {
      exampleField: {
        type: 'text',
        label: 'Example Field',
        required: false,
        placeholder: 'Enter value',
        description: 'This is an example field. Replace or remove as needed.'
      }
    },
    layout: [
      {
        h2: 'Form Section'
      },
      {
        field: 'exampleField'
      },
      {
        spacer: 20
      },
      {
        submit: 'Submit'
      }
    ],
    localization: {
      en: {},
      si: {},
      ta: {}
    }
  };
  
  return form;
}

/**
 * Main function
 */
function main() {
  try {
    const formName = parseArgs();
    const root = process.cwd();
    const formsDir = path.join(root, 'src', 'forms');
    const formFilePath = path.join(formsDir, `${formName}.json`);
    
    // Check if forms directory exists
    if (!fs.existsSync(formsDir)) {
      console.error(`Error: Forms directory not found: ${formsDir}`);
      process.exit(1);
    }
    
    // Check if file already exists
    if (fs.existsSync(formFilePath)) {
      console.error(`Error: Form file already exists: ${formFilePath}`);
      console.error('Please choose a different name or delete the existing file.');
      process.exit(1);
    }
    
    // Generate form structure
    const form = generateEmptyForm(formName);
    
    // Write to file with proper formatting
    const formJson = JSON.stringify(form, null, 2);
    fs.writeFileSync(formFilePath, formJson, 'utf8');
    
    console.log(`✓ Successfully created form: ${formFilePath}`);
    console.log(`\nForm ID: ${formName}`);
    console.log(`Access at: /forms/${formName}`);
    console.log(`\nNext steps:`);
    console.log(`1. Edit ${formFilePath} to customize fields and layout`);
    console.log(`2. Add fields to the "fields" object`);
    console.log(`3. Update the "layout" array to arrange form elements`);
    console.log(`4. Configure metadata (title, description, locales, OTP settings)`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

