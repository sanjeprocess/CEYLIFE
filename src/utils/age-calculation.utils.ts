/**
 * Calculates the age in years, months, and days between two dates
 * @param dateOfBirth - The date of birth (string or Date object)
 * @param toDate - The target date to calculate age up to (string or Date object, defaults to now)
 * @returns An object with years, months, and days, or null if dates are invalid
 */
export function calculateAge(
  dateOfBirth: string | Date | null | undefined,
  toDate: string | Date | null | undefined = new Date()
): { years: number; months: number; days: number } | null {
  // Handle null/undefined
  if (!dateOfBirth) {
    return null;
  }

  // Parse dates
  const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  const target =
    toDate instanceof Date ? toDate : new Date(toDate ?? new Date());

  // Validate dates
  if (isNaN(dob.getTime()) || isNaN(target.getTime())) {
    return null;
  }

  // If date of birth is in the future, return null
  if (dob > target) {
    return null;
  }

  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(
      target.getFullYear(),
      target.getMonth(),
      0
    ).getDate();
    days += lastMonth;
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/**
 * Formats age according to a format string
 * @param age - Age object with years, months, and days, or null
 * @param format - Format string with placeholders {y}, {m}, {d} (default: "{y}")
 * @returns Formatted age string, or empty string if age is null
 */
export function formatAge(
  age: { years: number; months: number; days: number } | null,
  format: string = "{y}"
): string {
  if (!age) {
    return "";
  }

  return format
    .replace(/{y}/g, String(age.years))
    .replace(/{m}/g, String(age.months))
    .replace(/{d}/g, String(age.days));
}
