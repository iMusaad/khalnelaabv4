import type { ContactMessage, KvStore } from "@/lib/messageStore";

const CHAT_KEY = "tg:chat";
const API = "https://api.telegram.org";

async function telegram(token: string, method: string, body?: object) {
  const response = await fetch(`${API}/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(4000),
  });

  return (await response.json().catch(() => null)) as {
    ok?: boolean;
    result?: unknown;
  } | null;
}

async function findChatId(store: KvStore, token: string) {
  const fixed = process.env.TELEGRAM_CHAT_ID;

  if (fixed) {
    return fixed;
  }

  const saved = await store.get(CHAT_KEY);

  if (saved) {
    return saved;
  }

  const updates = await telegram(token, "getUpdates");
  const list = Array.isArray(updates?.result) ? updates.result : [];

  for (const update of list as {
    message?: { chat?: { id?: number; type?: string } };
  }[]) {
    const chat = update.message?.chat;

    if (chat?.id && chat.type === "private") {
      const id = String(chat.id);
      await store.put(CHAT_KEY, id);
      return id;
    }
  }

  return null;
}

export async function notifyNewMessage(
  store: KvStore,
  message: ContactMessage,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return;
  }

  try {
    const chatId = await findChatId(store, token);

    if (!chatId) {
      return;
    }

    const lines = [
      "رسالة جديدة من خل نلعب",
      "",
      `الاسم: ${message.name}`,
      message.email && `الإيميل: ${message.email}`,
      message.phone && `الجوال: ${message.phone}`,
      "",
      message.message,
    ];

    await telegram(token, "sendMessage", {
      chat_id: chatId,
      text: lines
        .filter((line) => typeof line === "string")
        .join("\n")
        .slice(0, 4000),
      disable_web_page_preview: true,
    });
  } catch {}
}

export async function notifyOwner(store: KvStore, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return;
  }

  try {
    const chatId = await findChatId(store, token);

    if (!chatId) {
      return;
    }

    await telegram(token, "sendMessage", {
      chat_id: chatId,
      text: text.slice(0, 4000),
      disable_web_page_preview: true,
    });
  } catch {}
}
