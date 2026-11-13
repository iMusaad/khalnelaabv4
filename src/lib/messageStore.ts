import { getCloudflareContext } from "@opennextjs/cloudflare";

export type ContactMessage = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type KvStore = {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
  delete(key: string): Promise<void>;
  list(options: { prefix: string; cursor?: string }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
};

const PREFIX = "msg:";

export async function getMessageStore() {
  try {
    const { env } = await getCloudflareContext({ async: true });

    return (
      (env as unknown as { CONTACT_MESSAGES?: KvStore }).CONTACT_MESSAGES ??
      null
    );
  } catch {
    return null;
  }
}

export function newMessageId(now = Date.now()) {
  const reversed = (9999999999999 - now).toString().padStart(13, "0");
  const random = Math.random().toString(36).slice(2, 8);

  return `${reversed}-${random}`;
}

export async function saveMessage(store: KvStore, message: ContactMessage) {
  await store.put(`${PREFIX}${message.id}`, JSON.stringify(message));
}

export async function listMessages(store: KvStore) {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await store.list({ prefix: PREFIX, cursor });
    keys.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && keys.length < 500);

  const values = await Promise.all(
    keys.slice(0, 200).map((key) => store.get(key)),
  );

  return values
    .map((value) => {
      try {
        return value ? (JSON.parse(value) as ContactMessage) : null;
      } catch {
        return null;
      }
    })
    .filter((message): message is ContactMessage => message !== null);
}

export async function deleteMessage(store: KvStore, id: string) {
  await store.delete(`${PREFIX}${id}`);
}

export async function isRateLimited(store: KvStore, ip: string) {
  const key = `rate:${ip}`;
  const count = Number((await store.get(key)) ?? "0");

  if (count >= 5) {
    return true;
  }

  await store.put(key, String(count + 1), { expirationTtl: 3600 });

  return false;
}
