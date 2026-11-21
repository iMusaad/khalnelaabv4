import type { FunnelEvent } from "@/lib/money";

export function trackFunnel(event: FunnelEvent, oncePerVisit = false) {
  const flag = `kn_tracked:${event}`;

  try {
    if (oncePerVisit && sessionStorage.getItem(flag)) {
      return;
    }

    sessionStorage.setItem(flag, "1");
  } catch {}

  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

export function readCookie(name: string) {
  try {
    const match = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
  } catch {
    return "";
  }
}
