import { notFound } from "next/navigation";

import { WHO_GAME } from "@/data/scramble";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const person = WHO_GAME.find((p) => p.id === id);

  if (!person) {
    notFound();
  }

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 py-6 text-center text-white">
      <p className="text-sm font-black text-white/45">منهو ذا؟</p>

      <img
        src={person.image}
        alt="الشخصية"
        className="max-h-[75dvh] w-auto max-w-full rounded-3xl object-contain"
      />

      <p className="text-sm font-black text-[#ffb21e]">
        اوصفها بدون ما تقول الاسم
      </p>
    </main>
  );
}
