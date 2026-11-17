import type { NextRequest, NextResponse } from "next/server";
import { MAX_DEVICES } from "@/lib/deviceLimit";
import { toHex } from "@/lib/license";
import { getMessageStore, type KvStore } from "@/lib/messageStore";

export const DEVICE_COOKIE = "kn_device";

const PREFIX = "dev:";

const DEVICE_PATTERN = /^[0-9a-f]{32}$/;

export function readDeviceId(request: NextRequest) {
  const value = request.cookies.get(DEVICE_COOKIE)?.value ?? "";

  return DEVICE_PATTERN.test(value) ? value : null;
}

export function newDeviceId() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export function setDeviceCookie(response: NextResponse, deviceId: string) {
  response.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
  });
}

export async function devicesFor(store: KvStore, licenseId: string) {
  const raw = await store.get(`${PREFIX}${licenseId}`);

  if (!raw) {
    return [];
  }

  try {
    const list = JSON.parse(raw);

    return Array.isArray(list)
      ? list.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function registerDevice(
  store: KvStore,
  licenseId: string,
  deviceId: string,
  max = MAX_DEVICES,
) {
  const devices = await devicesFor(store, licenseId);

  if (devices.includes(deviceId)) {
    return true;
  }

  if (devices.length >= max) {
    return false;
  }

  await store.put(
    `${PREFIX}${licenseId}`,
    JSON.stringify([...devices, deviceId]),
  );

  return true;
}

export async function resetDevices(store: KvStore, licenseId: string) {
  const count = (await devicesFor(store, licenseId)).length;

  await store.delete(`${PREFIX}${licenseId}`);

  return count;
}

export async function claimDevice(request: NextRequest, licenseId: string) {
  const deviceId = readDeviceId(request) ?? newDeviceId();
  const store = await getMessageStore();

  if (!store) {
    return { allowed: true, deviceId };
  }

  return {
    allowed: await registerDevice(store, licenseId, deviceId),
    deviceId,
  };
}
