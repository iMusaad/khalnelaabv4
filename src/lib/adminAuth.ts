import type { NextRequest } from "next/server";
import { getMessageStore } from "@/lib/messageStore";

const MAX_FAILURES = 10;

async function sha256(text: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
  );
}

export async function adminPasswordMatches(
  input: string,
  request: NextRequest,
) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

  const store = await getMessageStore();
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const failKey = `adminfail:${ip}`;
  const failures = store ? Number((await store.get(failKey)) ?? "0") : 0;

  if (failures >= MAX_FAILURES) {
    return false;
  }

  const matches = await sameHash(input, expected);

  if (!matches && store) {
    await store.put(failKey, String(failures + 1), { expirationTtl: 3600 });
  }

  return matches;
}

async function sameHash(input: string, expected: string) {
  const [a, b] = await Promise.all([sha256(input), sha256(expected)]);
  let diff = 0;

  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }

  return diff === 0;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}
