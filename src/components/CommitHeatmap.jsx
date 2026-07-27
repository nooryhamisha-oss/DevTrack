export default function CommitHeatmap({ score }) {
  const totalCells = 78;
  const fillProbability = score / 100;

  return (
    <div className="grid grid-cols-[repeat(26,1fr)] gap-[3px]">
      {Array.from({ length: totalCells }).map((_, i) => {
        const filled = Math.random() < fillProbability;
        let colorClass = "bg-[#e4e8ee] dark:bg-[#252A32]";
        if (filled) {
          const r = Math.random();
          colorClass =
            r < 0.3
              ? "bg-grow-600"
              : r < 0.65
                ? "bg-grow-400"
                : "bg-grow-100 dark:bg-grow-600/40";
        }
        return (
          <div
            key={i}
            className={`aspect-square rounded-sm opacity-0 ${colorClass}`}
            style={{
              animation: "fillCell 0.4s ease-out forwards",
              animationDelay: `${i * 8}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
