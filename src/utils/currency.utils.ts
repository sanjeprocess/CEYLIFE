/**
 * Formats a number for currency display with comma separators
 * @param value - The numeric value to format
 * @returns Formatted string with commas (e.g., "100,000" or "100,000.50")
 */
export function formatCurrencyDisplay(
  value: number | null | undefined
): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Convert to string and split by decimal point
  const parts = value.toString().split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Combine with decimal part if it exists
  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

/**
 * Parses a currency input string (with commas) to a number
 * @param input - The input string (may contain commas)
 * @returns Parsed number or null if input is empty/invalid
 */
export function parseCurrencyInput(input: string): number | null {
  if (!input || input.trim() === "") {
    return null;
  }

  // Remove all commas and whitespace
  const cleaned = input.replace(/,/g, "").trim();

  // Check if it's a valid number (allows decimals)
  if (!/^-?\d*\.?\d*$/.test(cleaned)) {
    // If not a valid number format, return null
    return null;
  }

  // Convert to number
  const parsed = parseFloat(cleaned);

  // Check if parsing resulted in NaN
  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

