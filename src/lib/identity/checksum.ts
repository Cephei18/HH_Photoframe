/**
 * A real, verifiable mod-10 check digit over the serial's digits — a
 * Luhn-style alternating weight sum, not a decorative extra random field.
 * Anyone can recompute this by hand from the serial alone.
 */
export function computeChecksum(serialDigits: string): number {
  let sum = 0;
  for (let i = 0; i < serialDigits.length; i++) {
    const digit = Number(serialDigits[i]);
    sum += digit * (i % 2 === 0 ? 2 : 1);
  }
  return sum % 10;
}
