import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

export default function SkillRadar({ currentSkills, missingSkills }) {
  const priorityToValue = { High: 25, Medium: 45, Low: 65 };

  const data = [
    ...currentSkills.slice(0, 3).map((skill) => ({ skill, value: 85 })),
    ...missingSkills.slice(0, 3).map((m) => ({
      skill: m.skill,
      value: priorityToValue[m.priority] ?? 50,
    })),
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#232838" />
        <PolarAngleAxis
          dataKey="skill"
          tick={{ fill: "#8B92A5", fontSize: 11, fontFamily: "JetBrains Mono" }}
        />
        <Radar
          dataKey="value"
          stroke="#8B5CF6"
          fill="#8B5CF6"
          fillOpacity={0.25}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
