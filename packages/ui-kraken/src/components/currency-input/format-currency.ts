/**
 * Format a numeric value as a locale-aware currency-style string —
 * WITHOUT the currency symbol (the CurrencyInput component draws the
 * prefix separately via its `prefix` prop).
 *
 * Uses `Intl.NumberFormat` under the hood. Returns `""` for `null` and
 * `NaN` so the underlying `<TextInput>` shows the placeholder.
 *
 *   formatCurrency(1234, { locale: "en-US", decimals: 0 })     // "1,234"
 *   formatCurrency(1234.56, { locale: "en-US", decimals: 2 })  // "1,234.56"
 *   formatCurrency(1234.56, { locale: "es-CO", decimals: 2 })  // "1.234,56"
 *   formatCurrency(null,    { locale: "en-US", decimals: 0 })  // ""
 */
export function formatCurrency(
  value: number | null,
  options: { locale: string; decimals: number }
): string {
  if (value === null || Number.isNaN(value)) return "";
  const { locale, decimals } = options;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return formatter.format(value);
}
