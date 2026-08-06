import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Loader2,
  Star,
  GitFork,
  ArrowRight,
  History,
  Share2,
  Check,
  Copy,
} from "lucide-react";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createSnapshot } from "../services/share.js";
import {
  fetchGithubUser,
  fetchUserRepos,
  fetchRepoReadme,
  fetchRepoLanguages,
  fetchRepoTree,
} from "../services/github.js";
import { analyzeRepository, evaluatePortfolio } from "../services/ai.js";
import ScoreDonut from "../components/ScoreDonut.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    username,
    setUsername,
    setProfile,
    repos,
    setRepos,
    selectedRepos,
    setSelectedRepos,
    analyses,
    saveAnalysis,
    portfolioResult,
    setPortfolioResult,
    pushGuideNotification,
  } = useDevTrack();

  const [inputValue, setInputValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [started, setStarted] = useState(false);

  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedRepoObjects = repos.filter((r) =>
    selectedRepos.includes(r.name),
  );

  async function handleSearch(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const [userData, repoData] = await Promise.all([
        fetchGithubUser(inputValue.trim()),
        fetchUserRepos(inputValue.trim()),
      ]);
      setUsername(inputValue.trim());
      setProfile(userData);
      setRepos(repoData);
      setSelectedRepos([]);
      setInputValue("");
    } catch (err) {
      setSearchError(err.message);
      setProfile(null);
      setRepos([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function toggleRepo(repoName) {
    setSelectedRepos((prev) =>
      prev.includes(repoName)
        ? prev.filter((r) => r !== repoName)
        : [...prev, repoName],
    );
  }

  useEffect(() => {
    if (!started || selectedRepoObjects.length === 0) return;
    let cancelled = false;

    async function runPipeline() {
      setError("");
      const localAnalyses = { ...analyses };
      for (const repo of selectedRepoObjects) {
        if (localAnalyses[repo.name]) continue;
        setStep(`Analyzing ${repo.name}...`);
        try {
          const [readme, languages, fileTree] = await Promise.all([
            fetchRepoReadme(username, repo.name),
            fetchRepoLanguages(username, repo.name),
            fetchRepoTree(username, repo.name),
          ]);
          const result = await analyzeRepository(
            repo,
            readme,
            languages,
            fileTree,
          );
          if (cancelled) return;
          localAnalyses[repo.name] = result;
          saveAnalysis(repo, result);
        } catch (err) {
          if (!cancelled) setError(err.message);
          return;
        }
      }
      if (!portfolioResult) {
        setStep("Calculating overall portfolio score...");
        try {
          const result = await evaluatePortfolio(
            selectedRepoObjects,
            localAnalyses,
          );
          if (!cancelled) {
            setPortfolioResult(result);
            pushGuideNotification(
              ` Analysis complete! Your portfolio score is ${result.portfolioScore}/100. Check out Skill Gap next to see what to learn.`,
            );
          }
        } catch (err) {
          if (!cancelled) setError(err.message);
        }
      }
      if (!cancelled) setStep("");
    }
    runPipeline();
    return () => {
      cancelled = true;
    };
  }, [started, selectedRepos.join(",")]);
  const avgQuality = Object.values(analyses).length
    ? Math.round(
        Object.values(analyses).reduce((s, a) => s + a.qualityScore, 0) /
          Object.values(analyses).length,
      )
    : null;

  async function handleShare() {
    if (!portfolioResult || !user) return;
    setSharing(true);
    try {
      const snapshotData = {
        username,
        portfolioResult,
        repos: selectedRepoObjects.map((r) => ({
          name: r.name,
          qualityScore: analyses[r.name]?.qualityScore,
        })),
      };
      const slug = await createSnapshot(user.id, username, snapshotData);
      const url = `${window.location.origin}/share/${slug}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  }

  if (!started) {
    return (
      <div>
        <p className="label-eyebrow mb-2">Project Analysis</p>
        <h1 className="font-display text-2xl font-semibold mb-1">
          Analyze a GitHub profile
        </h1>
        <p className="text-ink-faint text-sm mb-6">
          Enter a GitHub username, pick the repositories you want reviewed, then
          start the analysis.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2.5 mb-8">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                username
                  ? `Currently: ${username} — type a new username`
                  : "GitHub username (e.g. torvalds)"
              }
              className="w-full pl-11 pr-4 py-3 rounded-card border border-border bg-panel text-ink font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet"
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={searchLoading}
          >
            {searchLoading && <Loader2 size={16} className="animate-spin" />}
            {searchLoading ? "Fetching..." : "Search"}
          </button>
        </form>

        {searchError && (
          <div className="mb-8 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
            {searchError}
          </div>
        )}

        {repos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="label-eyebrow mb-0">
                {repos.length} repositories found
              </p>
              <span className="label-eyebrow">
                {selectedRepos.length} selected
              </span>
            </div>
            <div className="space-y-2 mb-6">
              {repos.map((repo) => (
                <label
                  key={repo.id}
                  className="card card-hover flex items-center gap-4 px-4 py-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRepos.includes(repo.name)}
                    onChange={() => toggleRepo(repo.name)}
                    className="accent-violet w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[13px] font-semibold truncate">
                      {repo.name}
                    </p>
                    <p className="text-xs text-ink-faint truncate mt-0.5">
                      {repo.description || "No description provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-faint font-mono shrink-0">
                    <span className="flex items-center gap-1">
                      <Star size={12} /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} /> {repo.forks_count}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => setStarted(true)}
              disabled={selectedRepos.length === 0}
              className="btn-primary w-full py-3.5"
            >
              Analyze {selectedRepos.length} selected repositories
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="label-eyebrow mb-2">Portfolio Dashboard</p>
          <h1 className="font-display text-2xl font-semibold">{username}</h1>
        </div>
        <div className="flex items-center gap-2">
          {portfolioResult && (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
            >
              {copied ? (
                <Check size={14} className="text-grow" />
              ) : (
                <Share2 size={14} />
              )}
              {copied ? "Link copied!" : sharing ? "Sharing..." : "Share"}
            </button>
          )}
          <Link
            to="/history"
            className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
          >
            <History size={14} /> Track Progress
          </Link>
        </div>
      </div>

      {shareUrl && (
        <div className="mb-6 px-4 py-3 rounded-card bg-violet-soft border border-violet/30 text-xs font-mono flex items-center gap-2 justify-between">
          <span className="truncate">{shareUrl}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="shrink-0 text-violet"
          >
            <Copy size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
          {error}
        </div>
      )}
      {step && (
        <div className="card px-5 py-4 mb-6 flex items-center gap-3 text-sm text-ink-soft font-mono">
          <Loader2 size={16} className="animate-spin" /> {step}
        </div>
      )}

      {portfolioResult && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="card p-4">
              <p className="label-eyebrow mb-2">Portfolio Score</p>
              <p className="font-display text-2xl font-semibold">
                {portfolioResult.portfolioScore}/100
              </p>
              <p className="text-[11px] text-grow mt-1">
                {portfolioResult.skillLevel}
              </p>
            </div>
            <div className="card p-4">
              <p className="label-eyebrow mb-2">Repositories</p>
              <p className="font-display text-2xl font-semibold">
                {selectedRepoObjects.length}
              </p>
              <p className="text-[11px] text-ink-faint mt-1">analyzed</p>
            </div>
            <div className="card p-4">
              <p className="label-eyebrow mb-2">Avg Quality</p>
              <p className="font-display text-2xl font-semibold">
                {avgQuality ?? "—"}
              </p>
              <p className="text-[11px] text-ink-faint mt-1">
                across selection
              </p>
            </div>
            <div className="card p-4">
              <p className="label-eyebrow mb-2">Status</p>
              <p className="font-display text-2xl font-semibold">Ready</p>
              <p className="text-[11px] text-ink-faint mt-1">for skill gap</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-3.5 mb-6">
            <div className="card p-5 flex items-center gap-5">
              <ScoreDonut score={portfolioResult.portfolioScore} />
              <p className="text-sm text-ink-soft leading-relaxed">
                {portfolioResult.summary}
              </p>
            </div>
            <div className="card p-5 bg-gradient-to-br from-violet-soft to-transparent border-violet/25">
              <p className="label-eyebrow mb-3">Strengths & gaps</p>
              <div className="mb-3">
                {portfolioResult.strengths.slice(0, 2).map((s, i) => (
                  <p key={i} className="text-xs mb-1.5 flex items-start gap-2">
                    <span className="text-grow">✓</span> {s}
                  </p>
                ))}
              </div>
              <div>
                {portfolioResult.weaknesses.slice(0, 2).map((w, i) => (
                  <p key={i} className="text-xs mb-1.5 flex items-start gap-2">
                    <span className="text-flag">!</span> {w}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {Object.keys(analyses).length > 0 && (
        <div>
          <p className="label-eyebrow mb-3">Repository breakdown</p>
          <div className="space-y-2 mb-8">
            {selectedRepoObjects.map((repo) => {
              const a = analyses[repo.name];
              if (!a) return null;
              const good = a.qualityScore >= 70;
              return (
                <Link
                  to={`/repo/${repo.name}`}
                  key={repo.name}
                  className="card card-hover flex items-center justify-between px-4 py-3"
                >
                  <span className="font-mono text-sm">{repo.name}</span>
                  <span
                    className={`font-mono text-xs px-2.5 py-1 rounded-full ${good ? "bg-grow-soft text-grow" : "bg-flag-soft text-flag"}`}
                  >
                    {a.qualityScore}/100
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {portfolioResult && (
        <Link
          to="/skill-gap"
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
        >
          Continue to Skill Gap Analysis <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
