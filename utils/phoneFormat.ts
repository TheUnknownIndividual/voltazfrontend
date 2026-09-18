export const groupDigits = (digits: string, groups: number[]): string => {
  const parts: string[] = [];
  let index = 0;
  for (const size of groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }
  if (index < digits.length) parts.push(digits.slice(index));
  return parts.join(' ');
};

// AZ local number typed after a separate "+994" prefix, e.g. "50 123 45 67"
export const formatAzLocalNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  return groupDigits(digits, [2, 3, 2, 2]);
};

// AZ national number typed with the leading 0 inline, e.g. "050 123 45 67"
export const formatAzNationalNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  return groupDigits(digits, [3, 3, 2, 2]);
};

// Remaining 7 digits after a separate operator-code dropdown, e.g. "123 45 67"
export const formatAzSevenDigits = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 7);
  return groupDigits(digits, [3, 2, 2]);
};
