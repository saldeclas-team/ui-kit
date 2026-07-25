/**
 * Parse a user-typed currency-style string back into a `number | null`.
 * Strips the prefix, thousands separator, and any other non-numeric
 * noise the user may have typed. Locale-aware so `1.234,56` (es-CO)
 * and `1,234.56` (en-US) both parse to `1234.56` when `decimals > 0`.
 *
 *   parseCurrency("$1,234",   { locale: "en-US", decimals: 0 })  // 1234
 *   parseCurrency("1.234",    { locale: "es-CO", decimals: 0 })  // 1234
 *   parseCurrency("1,234.56", { locale: "en-US", decimals: 2 })  // 1234.56
 *   parseCurrency("1.234,56", { locale: "es-CO", decimals: 2 })  // 1234.56
 *   parseCurrency("",         { locale: "en-US", decimals: 0 })  // null
 *   parseCurrency("abc",      { locale: "en-US", decimals: 0 })  // null
 */
export function parseCurrency(
  text: string,
  options: { locale: string; decimals: number }
): number | null {
  const { locale, decimals } = options;

  if (decimals === 0) {
    // Integer mode: strip everything except digits and an optional
    // leading minus. Any separator (`.`, `,`, whitespace, prefix) is
    // treated as noise.
    const digits = text.replace(/[^0-9-]/g, "");
    if (digits.length === 0 || digits === "-") return null;
    // `parseInt` on a validated digit-only string (with optional leading
    // `-`) cannot return NaN — no defensive NaN check needed.
    return Number.parseInt(digits, 10);
  }

  // Decimal mode: detect the locale's decimal separator, allow ONE
  // occurrence, strip everything else non-numeric.
  const decimalSeparator = detectDecimalSeparator(locale);
  const escapedSeparator = escapeRegex(decimalSeparator);
  const cleaned = text.replace(new RegExp(`[^0-9\\-${escapedSeparator}]`, "g"), "");

  // If the user typed multiple decimal separators, keep the first,
  // drop the rest (mirrors how most currency inputs behave).
  const firstSepIndex = cleaned.indexOf(decimalSeparator);
  const normalizedInput =
    firstSepIndex === -1
      ? cleaned
      : cleaned.slice(0, firstSepIndex + 1) +
        cleaned.slice(firstSepIndex + 1).replace(new RegExp(escapedSeparator, "g"), "");

  // Convert to standard `.` decimal for parseFloat.
  const forParse =
    decimalSeparator === "." ? normalizedInput : normalizedInput.replace(decimalSeparator, ".");

  if (forParse.length === 0 || forParse === "-" || forParse === ".") return null;

  const parsed = Number.parseFloat(forParse);
  if (Number.isNaN(parsed)) return null;

  // Round to `decimals` places so `"1.239"` with `decimals=2` yields `1.24`.
  const factor = Math.pow(10, decimals);
  return Math.round(parsed * factor) / factor;
}

// --- private helpers ---

/**
 * Read the locale's decimal separator via `Intl.NumberFormat.formatToParts`.
 * Falls back to `.` if the runtime does not expose parts data (very old
 * environments; RN + Hermes support this since 0.71).
 */
function detectDecimalSeparator(locale: string): string {
  // Every real BCP 47 locale returns a "decimal" part from
  // `formatToParts(1.1)`; if the runtime somehow does not, fall back
  // to `.` so parsing stays deterministic. We do not assert-not-null
  // to keep the parser safe on exotic locale strings.
  const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
  for (const part of parts) {
    if (part.type === "decimal") return part.value;
  }
  return ".";
}

/**
 * Escape a single character for safe inclusion in a `RegExp` character
 * class. Only `.` needs escaping among the plausible decimal separators
 * (`.`, `,`, space, apostrophe) but the generic escape keeps the caller
 * simple.
 */
function escapeRegex(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
