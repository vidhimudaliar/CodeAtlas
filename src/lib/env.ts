export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key];
  return value ?? fallback;
}
