/** Convert empty strings to null for optional DB columns */
export function emptyToNull<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    if (out[key] === "") out[key] = null;
  }
  return out as T;
}
