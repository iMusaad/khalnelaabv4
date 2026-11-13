import Image from "next/image";
import Link from "next/link";
import { UPCOMING_GAMES } from "@/data/upcomingGames";
import { posterThumb } from "@/lib/poster";

export default function AdminUpcoming() {
  if (UPCOMING_GAMES.length === 0) {
    return (
      <p className="rounded-2xl bg-[#221a3f] p-6 text-center font-bold text-white/60">
        كل الألعاب نازلة
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {UPCOMING_GAMES.map((game) => (
        <article
          key={game.id}
          className="flex gap-4 rounded-2xl bg-[#221a3f] p-3 shadow-[0_5px_0_#140f29]"
        >
          <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={posterThumb(game.image)}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="flex min-w-0 flex-col">
            <h3 className="text-lg font-black">{game.name}</h3>

            <ul className="mt-1 space-y-0.5 text-sm font-bold text-white/60">
              {game.content.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>

            <Link
              href={`/match?game=${game.id}`}
              className="btn-primary mt-auto w-fit px-5 py-2 text-sm"
            >
              جرّبها
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
