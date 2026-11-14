export default function SaudiMadeSticker({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="-rotate-3 rounded-2xl bg-white p-1.5 shadow-[0_6px_0_#0e0a1f] transition-transform hover:rotate-0">
        <div className="rounded-xl bg-[#00843d] px-5 py-2 text-center text-white">
          <span className="block text-lg font-black leading-tight">
            صُنع في السعودية
          </span>

          <span className="mt-1 block text-[11px] font-black tracking-[0.35em] text-white/80">
            SAUDI MADE
          </span>
        </div>
      </div>
    </div>
  );
}
