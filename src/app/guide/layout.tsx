import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "طريقة اللعب",
  description:
    "شرح طريقة لعب كل ألعاب خل نلعب: وش علمك، منهو ذا، عينك عالشعار، خمن المثل، أسئلة وأجوبة وغيرها.",
  alternates: { canonical: "/guide" },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
