const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_SEND = 5; // max 5 code sends per window
const MAX_VERIFY = 10; // max 10 verify attempts per window

function getKey(ip: string, type: string) {
  return `${type}:${ip}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) {
      attempts.delete(key);
    }
  }
}

export function checkRateLimit(
  ip: string,
  type: "send" | "verify"
): { allowed: boolean; retryAfterSeconds?: number } {
  cleanup();

  const key = getKey(ip, type);
  const max = type === "send" ? MAX_SEND : MAX_VERIFY;
  const now = Date.now();

  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= max) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true };
}
