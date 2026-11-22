export type YouTubePlayer = {
  playVideo: () => void;
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
};

type YouTubePlayerEvent = { target: YouTubePlayer; data: number };

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string;
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onError?: (event: YouTubePlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
};

type YouTubeWindow = Window & {
  YT?: YouTubeNamespace;
  onYouTubeIframeAPIReady?: () => void;
};

export const YOUTUBE_ENDED = 0;

export const YOUTUBE_PLAYING = 1;

export const YOUTUBE_PAUSED = 2;

let loading: Promise<YouTubeNamespace> | null = null;

export function isValidYouTubeId(id: string) {
  return /^[A-Za-z0-9_-]{11}$/.test(id);
}

export function loadYouTubeApi() {
  const target = window as YouTubeWindow;

  if (target.YT?.Player) {
    return Promise.resolve(target.YT);
  }

  if (!loading) {
    loading = new Promise<YouTubeNamespace>((resolve, reject) => {
      const previous = target.onYouTubeIframeAPIReady;

      target.onYouTubeIframeAPIReady = () => {
        previous?.();

        if (target.YT) {
          resolve(target.YT);
        }
      };

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        loading = null;
        reject(new Error("youtube"));
      };
      document.head.appendChild(script);
    });
  }

  return loading;
}
