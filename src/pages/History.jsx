import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchHistory } from "../services/history.js";

export default function HistoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchHistory(user.id)
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const grouped = entries.reduce((acc, entry) => {
    if (!acc[entry.repo_name]) acc[entry.repo_name] = [];
    acc[entry.repo_name].push(entry);
    return acc;
  }, {});
  const repoGroups = Object.entries(grouped).map(([name, list]) => ({
    name,
    entries: list.sort(
      (a, b) => new Date(a.analyzed_at) - new Date(b.analyzed_at),
    ),
  }));

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-ink-faint hover:text-ink mb-6 font-mono"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <p className="label-eyebrow mb-2">Progress History</p>
      <h1 className="font-display text-2xl font-semibold mb-1">
        Compare your progress over time
      </h1>
      <p className="text-xs text-ink-faint mb-6">
        Saved permanently to your account — visible from any device.
      </p>

      {loading && (
        <div className="flex items-center gap-2 text-ink-faint text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading your history...
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
          {error}
        </div>
      )}

      {!loading && repoGroups.length === 0 && (
        <p className="text-ink-soft text-sm">
          No analyses saved yet. Analyze a repository from Home to get started.
        </p>
      )}

      {repoGroups.map((group) => {
        const first = group.entries[0];
        const latest = group.entries[group.entries.length - 1];
        const delta = latest.quality_score - first.quality_score;
        return (
          <div key={group.name} className="card card-hover p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm font-semibold">
                {group.name}
              </span>
              {group.entries.length > 1 && (
                <span
                  className={`flex items-center gap-1 text-xs font-mono ${delta > 0 ? "text-grow" : delta < 0 ? "text-flag" : "text-ink-faint"}`}
                >
                  {delta > 0 ? (
                    <TrendingUp size={13} />
                  ) : delta < 0 ? (
                    <TrendingDown size={13} />
                  ) : (
                    <Minus size={13} />
                  )}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-card bg-panel border border-border"
                >
                  <span className="font-mono text-xs">
                    {e.quality_score}/100
                  </span>
                  <span className="text-[10px] text-ink-faint">
                    {new Date(e.analyzed_at).toLocaleDateString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
