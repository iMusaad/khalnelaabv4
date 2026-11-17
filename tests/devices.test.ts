import { describe, expect, it } from "vitest";
import { devicesFor, registerDevice, resetDevices } from "@/lib/devices";
import {
  createLicenseCode,
  derivePurchaseId,
  toHex,
  verifyLicenseCode,
} from "@/lib/license";
import type { KvStore } from "@/lib/messageStore";

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

describe("device limit", () => {
  it("allows three devices and blocks the fourth", async () => {
    const store = memoryStore();

    expect(await registerDevice(store, "lic", "a")).toBe(true);
    expect(await registerDevice(store, "lic", "b")).toBe(true);
    expect(await registerDevice(store, "lic", "c")).toBe(true);
    expect(await registerDevice(store, "lic", "d")).toBe(false);
  });

  it("lets an already registered device back in without counting it again", async () => {
    const store = memoryStore();

    await registerDevice(store, "lic", "a");
    await registerDevice(store, "lic", "a");

    expect(await devicesFor(store, "lic")).toEqual(["a"]);
  });

  it("frees the slots after a reset", async () => {
    const store = memoryStore();

    for (const device of ["a", "b", "c"]) {
      await registerDevice(store, "lic", device);
    }

    expect(await resetDevices(store, "lic")).toBe(3);
    expect(await registerDevice(store, "lic", "d")).toBe(true);
  });

  it("uses the same license id for the code and its payment", async () => {
    const secret = "test-secret";
    const id = await derivePurchaseId(secret, "pay_aaaaaaaa");
    const code = await createLicenseCode({ type: "purchase", id, secret });
    const check = await verifyLicenseCode(code, { purchase: secret });

    expect(check.valid && check.id).toBe(toHex(id));
  });
});
