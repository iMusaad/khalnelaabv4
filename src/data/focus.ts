type FocusClipBase = {
  id: string;
  question: string;
  answer: string;
  credit: string;
};

export type FocusFileClip = FocusClipBase & {
  kind: "file";
  video: string;
  poster?: string;
};

export type FocusYouTubeClip = FocusClipBase & {
  kind: "youtube";
  youtubeId: string;
  start: number;
  end: number;
};

export type FocusClip = FocusFileClip | FocusYouTubeClip;

export const FOCUS_CLIPS: FocusClip[] = [
  {
    id: "yt-fw9sqxb4o-timer",
    kind: "youtube",
    youtubeId: "-FW9Sqxb-4o",
    start: 47,
    end: 66,
    question: "كم كان المؤقت؟",
    answer: "دقيقتين و30 ثانية (2:30)",
    credit: "يوتيوب",
  },
];
