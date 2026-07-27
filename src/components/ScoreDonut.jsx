import { PieChart, Pie, Cell } from "recharts";

export default function ScoreDonut({ score, size = 120 }) {
  const data = [{ value: score }, { value: 100 - score }];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size / 2 - 12}
          outerRadius={size / 2}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          <Cell fill="#8B5CF6" />
          <Cell fill="#232838" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{score}</span>
        <span className="font-mono text-[9px] text-ink-faint tracking-wider">
          SCORE
        </span>
      </div>
    </div>
  );
}
