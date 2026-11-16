// Hanya alamat yang aman. Menolak javascript:, dsb.

export function isSafeHref(value: string): boolean {
  if (value.startsWith("//")) return false;
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("mailto:") ||
    value.startsWith("/") ||
    value.startsWith("#")
  );
}

export function isSafeImageUrl(value: string): boolean {
  if (value.startsWith("//")) return false;
  return (
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("/") ||
    value.startsWith("data:image/")
  );
}