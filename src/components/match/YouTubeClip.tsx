"use client";

import { useEffect, useRef, useState } from "react";
import {
  YOUTUBE_ENDED,
  YOUTUBE_PLAYING,
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
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [needsSound, setNeedsSound] = useState(false);
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
            mute: 0,
            controls: controls ? 1 : 0,
            playsinline: 1,
            rel: 0,
            disablekb: controls ? 0 : 1,
          },
          events: {
            onReady: (event) => {
              playerRef.current = event.target;
              event.target.playVideo();

              setTimeout(() => {
                if (
                  !cancelled &&
                  event.target.getPlayerState() !== YOUTUBE_PLAYING
                ) {
                  event.target.mute();
                  event.target.playVideo();
                  setNeedsSound(true);
                }
              }, 1500);
            },
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
      playerRef.current = null;
    };
  }, [youtubeId, start, end, controls]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={holderRef}
        className="h-full w-full overflow-hidden bg-black [&_iframe]:h-full [&_iframe]:w-full"
      />

      {needsSound && (
        <button
          type="button"
          onClick={() => {
            playerRef.current?.unMute();
            setNeedsSound(false);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ffc23d] px-5 py-2 text-sm font-black text-[#241339] shadow-[0_4px_0_#c27700]"
        >
          شغّل الصوت
        </button>
      )}
    </div>
  );
}
