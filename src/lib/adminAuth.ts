async function sha256(text: string) {
  return new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
  );
}

export async function adminPasswordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return false;
  }

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
