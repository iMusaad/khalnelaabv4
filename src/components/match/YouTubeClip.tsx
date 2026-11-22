"use client";

import { useEffect, useRef } from "react";
import {
  YOUTUBE_ENDED,
  isValidYouTubeId,
  loadYouTubeApi,
  type YouTubePlayer,
} from "@/lib/youtube";

const EXTRA_WAIT_SECONDS = 20;

export default function YouTubeClip({
  youtubeId,
  start,
  end,
  controls,
  onEnded,
  onError,
}: {
  youtubeId: string;
  start: number;
  end: number;
  controls: boolean;
  onEnded?: () => void;
  onError: () => void;
}) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const endedRef = useRef(onEnded);
  const errorRef = useRef(onError);

  endedRef.current = onEnded;
  errorRef.current = onError;

  useEffect(() => {
    if (!isValidYouTubeId(youtubeId) || end <= start) {
      errorRef.current();
      return;
    }

    let player: YouTubePlayer | null = null;
    let cancelled = false;
    let finished = false;

    function finish() {
      if (!finished) {
        finished = true;
        endedRef.current?.();
      }
    }

    const fallback = endedRef.current
      ? setTimeout(finish, (end - start + EXTRA_WAIT_SECONDS) * 1000)
      : null;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !holderRef.current) {
          return;
        }

        const mount = document.createElement("div");
        holderRef.current.appendChild(mount);

        player = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          videoId: youtubeId,
          width: "100%",
          height: "100%",
          playerVars: {
            start,
            end,
            autoplay: 1,
            mute: 1,
            controls: controls ? 1 : 0,
            playsinline: 1,
            rel: 0,
            disablekb: controls ? 0 : 1,
          },
          events: {
            onReady: (event) => event.target.playVideo(),
            onStateChange: (event) => {
              if (event.data === YOUTUBE_ENDED) {
                finish();
              }
            },
            onError: () => {
              if (!cancelled) {
                errorRef.current();
              }
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          errorRef.current();
        }
      });

    return () => {
      cancelled = true;

      if (fallback) {
        clearTimeout(fallback);
      }

      player?.destroy();
    };
  }, [youtubeId, start, end, controls]);

  return (
    <div
      ref={holderRef}
      className="mx-auto aspect-video w-full max-w-[640px] overflow-hidden rounded-3xl bg-black [&_iframe]:h-full [&_iframe]:w-full"
    />
  );
}
