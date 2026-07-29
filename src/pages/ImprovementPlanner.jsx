import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  RefreshCw,
  ExternalLink,
  Lightbulb,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import { getLearningPath, buildResourceLinks } from "../services/ai.js";

export default function ImprovementPlanner() {
  const { skillGapResult, portfolioResult, learningPath, setLearningPath } =
    useDevTrack();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openStep, setOpenStep] = useState(0);

  useEffect(() => {
    if (!skillGapResult || learningPath) return;
    buildPath();
  
  }, [skillGapResult]);

  async function buildPath() {
    setLoading(true);
    setError("");
    try {
      const result = await getLearningPath(skillGapResult);
      setLearningPath(result);
      setOpenStep(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!skillGapResult) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-soft mb-6">
          Pick a target role on the Skill Gap page first.
        </p>
        <Link to="/skill-gap" className="btn-primary inline-block">
          Go to Skill Gap
        </Link>
      </div>
    );
  }

  const totalWeeks = learningPath?.steps.reduce(
    (s, x) => s + x.estimatedWeeks,
    0,
  );
  return (
    <div>
      <p className="label-eyebrow mb-2">Your Journey</p>
      <h1 className="font-display text-2xl font-semibold mb-1">
        Roadmap to {skillGapResult.targetRole}
      </h1>
      {learningPath && (
        <p className="text-ink-faint text-sm mb-6">
          ~{totalWeeks} weeks total, {learningPath.steps.length} milestones
        </p>
      )}

      {portfolioResult && (
        <div className="card p-5 mb-8 bg-gradient-to-br from-violet-soft to-transparent border-violet/25">
          <div className="flex items-start gap-3">
            <Briefcase size={18} className="text-violet shrink-0 mt-0.5" />
            <div>
              <p className="label-eyebrow mb-2">
                How this helps your job search
              </p>
              <p className="text-xs text-ink-soft leading-relaxed">
                Your portfolio currently scores{" "}
                <strong className="text-ink">
                  {portfolioResult.portfolioScore}/100
                </strong>{" "}
                and you're at{" "}
                <strong className="text-ink">
                  {skillGapResult.readinessPercent}%
                </strong>{" "}
                readiness for {skillGapResult.targetRole} roles. Each milestone
                below targets a specific gap recruiters actually screen for.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card px-5 py-4 mb-6 flex items-center gap-3 text-sm text-ink-soft font-mono">
          <Loader2 size={16} className="animate-spin" /> Building your
          roadmap...
        </div>
      )}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
          {error}
        </div>
      )}

      {learningPath && !loading && (
        <>
          <div className="relative overflow-x-auto pb-4 mb-6 -mx-1 px-1">
            <div className="flex items-start gap-0 min-w-max">
              {learningPath.steps.map((step, i) => (
                <div key={i} className="flex items-start">
                  <button
                    onClick={() => setOpenStep(i)}
                    className="flex flex-col items-center w-[132px] shrink-0 group"
                  >
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-display text-sm font-semibold border-2 transition-all ${
                        openStep === i
                          ? "bg-gradient-to-br from-violet to-cyan text-bg border-transparent scale-110"
                          : "bg-panel2 text-ink-soft border-border group-hover:border-violet/50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p
                      className={`text-[11px] font-mono text-center mt-2 leading-snug ${
                        openStep === i
                          ? "text-ink font-semibold"
                          : "text-ink-faint"
                      }`}
                    >
                      {step.title}
                    </p>
                    <span className="text-[10px] text-ink-faint mt-1">
                      {step.estimatedWeeks}w
                    </span>
                  </button>
                  {i < learningPath.steps.length - 1 && (
                    <div className="w-10 h-[2px] mt-[22px] border-t-2 border-dashed border-border shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {learningPath.steps[openStep] && (
            <div className="card p-5 mb-8">
              {(() => {
                const step = learningPath.steps[openStep];
                const links = buildResourceLinks(
                  step.resourceKeyword || step.title,
                );
                return (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="label-eyebrow mb-1">
                          Milestone {openStep + 1} of{" "}
                          {learningPath.steps.length}
                        </p>
                        <h3 className="font-display text-lg font-semibold">
                          {step.title}
                        </h3>
                      </div>
                      <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-violet-soft text-violet shrink-0">
                        ~{step.estimatedWeeks} weeks
                      </span>
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed mb-4">
                      {step.description}
                    </p>
                    {step.projectIdea && (
                      <div className="flex items-start gap-2 mb-4 p-3 rounded-card bg-panel">
                        <Lightbulb
                          size={14}
                          className="text-flag shrink-0 mt-0.5"
                        />
                        <p className="text-xs text-ink-soft">
                          <span className="text-ink-faint">Project idea:</span>{" "}
                          {step.projectIdea}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1.5 rounded-card border border-border text-ink-soft hover:border-violet/40 hover:text-violet transition-colors"
                        >
                          {link.label} <ExternalLink size={11} />
                        </a>
                      ))}
                    </div>
                    <div className="flex justify-between mt-5 pt-4 border-t border-border">
                      <button
                        disabled={openStep === 0}
                        onClick={() => setOpenStep((s) => s - 1)}
                        className="text-xs font-mono text-ink-faint hover:text-ink disabled:opacity-30 flex items-center gap-1"
                      >
                        <ChevronDown size={13} className="rotate-90" /> Previous
                      </button>
                      <button
                        disabled={openStep === learningPath.steps.length - 1}
                        onClick={() => setOpenStep((s) => s + 1)}
                        className="text-xs font-mono text-ink-faint hover:text-ink disabled:opacity-30 flex items-center gap-1"
                      >
                        Next <ChevronDown size={13} className="-rotate-90" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <button
            onClick={buildPath}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={14} /> Regenerate roadmap
          </button>
        </>
      )}
    </div>
  );
}
