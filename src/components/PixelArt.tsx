export default function PixelArt({
  rows,
  colors,
  size = 8,
  className,
}: {
  rows: string[];
  colors: Record<string, string>;
  size?: number;
  className?: string;
}) {
  const width = Math.max(...rows.map((row) => row.length));

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${rows.length}`}
      width={width * size}
      height={rows.length * size}
      shapeRendering="crispEdges"
      className={className}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          colors[cell] ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={colors[cell]}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
