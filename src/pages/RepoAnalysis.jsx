import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, GitFork, CheckCircle2 } from "lucide-react";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import ScoreDonut from "../components/ScoreDonut.jsx";

export default function RepoAnalysis() {
  const { repoName } = useParams();
  const navigate = useNavigate();
  const { repos, analyses } = useDevTrack();
  const repo = repos.find((r) => r.name === repoName);
  const analysis = analyses[repoName];

  if (!repo || !analysis) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft mb-6">
          No analysis found for this repository yet. Analyze it from the
          Dashboard first.
        </p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-ink-faint hover:text-ink mb-6 font-mono"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <div className="flex items-start justify-between mb-2">
        <h1 className="font-display text-2xl font-semibold font-mono">
          {repo.name}
        </h1>
        <ScoreDonut score={analysis.qualityScore} size={56} />
      </div>
      <p className="text-ink-soft text-sm mb-3">
        {repo.description || "No description"}
      </p>
      <div className="flex items-center gap-4 text-xs text-ink-faint font-mono mb-8">
        <span className="flex items-center gap-1">
          <Star size={13} /> {repo.stargazers_count}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={13} /> {repo.forks_count}
        </span>
      </div>

      <div className="card p-5 mb-4 bg-gradient-to-br from-violet-soft to-transparent border-violet/25">
        <p className="label-eyebrow mb-2">Recruiter's first impression</p>
        <p className="text-sm italic text-ink-soft leading-relaxed">
          {analysis.recruiterFirstImpression}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="card p-5">
          <p className="label-eyebrow mb-3 text-grow">Strengths</p>
          <ul className="space-y-2">
            {analysis.insights
              .filter((_, i) => i % 2 === 0)
              .map((ins, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-grow shrink-0 mt-0.5"
                  />{" "}
                  {ins}
                </li>
              ))}
          </ul>
        </div>
        <div className="card p-5">
          <p className="label-eyebrow mb-3 text-flag">Areas to improve</p>
          <ul className="space-y-2">
            {analysis.insights
              .filter((_, i) => i % 2 !== 0)
              .map((ins, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <span className="text-flag shrink-0">!</span> {ins}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
