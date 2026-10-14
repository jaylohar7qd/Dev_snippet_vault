export function getApiUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  return configuredUrl ? configuredUrl.replace(/\/+$/, '') : null;
}
