import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  ArrowRight,
  Code2,
  Server,
  Layers,
  Database,
  Smartphone,
} from "lucide-react";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import { analyzeSkillGap } from "../services/ai.js";

const ROLES = [
  {
    name: "Frontend Developer",
    icon: Code2,
    blurb: "UI, interactivity, and everything the user touches.",
  },
  {
    name: "Backend Developer",
    icon: Server,
    blurb: "APIs, databases, and the logic behind the scenes.",
  },
  {
    name: "Full-Stack Developer",
    icon: Layers,
    blurb: "Comfortable owning both ends of the stack.",
  },
  {
    name: "Data Engineer",
    icon: Database,
    blurb: "Pipelines, data quality, and large-scale processing.",
  },
  {
    name: "Mobile Developer",
    icon: Smartphone,
    blurb: "Native or cross-platform apps people carry in their pocket.",
  },
];

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_STYLES = {
  High: "bg-flag-soft text-flag border-flag/30",
  Medium: "bg-panel2 text-ink-soft border-border",
  Low: "bg-grow-soft text-grow border-grow/20",
};

function ReadinessGauge({ percent }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-[140px] h-[140px] mx-auto shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--c-border)"
          strokeWidth="16"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-3xl font-semibold">{percent}%</p>
        <p className="label-eyebrow">ready</p>
      </div>
    </div>
  );
}
export default function SkillGap() {
  const {
    repos,
    selectedRepos,
    targetRole,
    setTargetRole,
    skillGapResult,
    setSkillGapResult,
  } = useDevTrack();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedRepoObjects = repos.filter((r) =>
    selectedRepos.includes(r.name),
  );
  const languages = [
    ...new Set(selectedRepoObjects.map((r) => r.language).filter(Boolean)),
  ];

  async function handleAnalyze(role) {
    setTargetRole(role);
    setLoading(true);
    setError("");
    try {
      const result = await analyzeSkillGap(
        selectedRepoObjects,
        languages,
        role,
      );
      setSkillGapResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (selectedRepoObjects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft mb-6">
          Select and analyze at least one repository from Home first.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Go to Home
        </Link>
      </div>
    );
  }

  const sortedMissing = skillGapResult
    ? [...skillGapResult.missingSkills].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      )
    : [];

  return (
    <div>
      <p className="label-eyebrow mb-2">Choose your path</p>
      <h1 className="font-display text-2xl font-semibold mb-6">
        Which role are you targeting?
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {ROLES.map(({ name, icon: Icon, blurb }) => {
          const active = targetRole === name;
          return (
            <button
              key={name}
              onClick={() => handleAnalyze(name)}
              disabled={loading}
              className={`text-left p-4 rounded-card border transition-all duration-200 ${
                active
                  ? "border-violet bg-violet-soft"
                  : "border-border bg-panel2 hover:border-violet/40 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                  active
                    ? "bg-gradient-to-br from-violet to-cyan text-bg"
                    : "bg-panel text-ink-soft"
                }`}
              >
                <Icon size={17} />
              </span>
              <p className="text-sm font-semibold mb-1">{name}</p>
              <p className="text-[11px] text-ink-faint leading-snug">{blurb}</p>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="card px-5 py-4 mb-6 flex items-center gap-3 text-sm text-ink-soft font-mono">
          <Loader2 size={16} className="animate-spin" /> Analyzing skills for{" "}
          {targetRole}...
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
          {error}
        </div>
      )}

      {skillGapResult && !loading && (
        <>
          <div className="card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6">
            <ReadinessGauge percent={skillGapResult.readinessPercent} />
            <div className="flex-1 text-center sm:text-left">
              <p className="label-eyebrow mb-1">
                Readiness for {skillGapResult.targetRole}
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {skillGapResult.currentSkills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-grow-soft text-grow"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="label-eyebrow mb-3">Missing skills, by priority</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {sortedMissing.map((m, i) => (
              <div
                key={i}
                title={m.reason}
                className={`px-3.5 py-2 rounded-card border text-xs font-mono flex items-center gap-2 ${PRIORITY_STYLES[m.priority]}`}
              >
                <span className="font-semibold">{m.skill}</span>
                <span className="opacity-70">{m.priority}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 mb-8">
            {sortedMissing.map((m, i) => (
              <p key={i} className="text-xs text-ink-faint">
                <span className="text-ink-soft font-mono">{m.skill}:</span>{" "}
                {m.reason}
              </p>
            ))}
          </div>

          <Link
            to="/planner"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          >
            Build my learning roadmap <ArrowRight size={16} />
          </Link>
        </>
      )}
    </div>
  );
}
