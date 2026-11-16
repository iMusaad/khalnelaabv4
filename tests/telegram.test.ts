import { afterEach, describe, expect, it, vi } from "vitest";
import type { KvStore } from "@/lib/messageStore";
import { notifyNewMessage } from "@/lib/telegram";

function memoryStore(): KvStore {
  const data = new Map<string, string>();

  return {
    async get(key) {
      return data.get(key) ?? null;
    },
    async put(key, value) {
      data.set(key, value);
    },
    async delete(key) {
      data.delete(key);
    },
    async list() {
      return { keys: [], list_complete: true };
    },
  };
}

const message = {
  id: "1",
  createdAt: "2026-11-16T00:00:00.000Z",
  name: "مساعد",
  email: "",
  phone: "+966 5",
  message: "هلا",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("telegram notifications", () => {
  it("does nothing without a bot token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await notifyNewMessage(memoryStore(), message);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("finds the owner's chat and sends the message", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "TEST");
    const store = memoryStore();
    const fetchMock = vi.fn(async (url: string) => ({
      json: async () =>
        url.endsWith("/getUpdates")
          ? {
              ok: true,
              result: [{ message: { chat: { id: 42, type: "private" } } }],
            }
          : { ok: true },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await notifyNewMessage(store, message);

    const [url, init] = fetchMock.mock.calls[1] as unknown as [
      string,
      { body: string },
    ];
    const sent = JSON.parse(init.body);

    expect(url).toContain("/sendMessage");
    expect(sent.chat_id).toBe("42");
    expect(sent.text).toContain("مساعد");
    expect(sent.text).toContain("+966 5");
    expect(sent.text).not.toContain("الإيميل");
    expect(await store.get("tg:chat")).toBe("42");
  });
});
