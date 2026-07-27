import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Star, GitFork } from "lucide-react";
import { useDevTrack } from "../context/DevTrackContext.jsx";
import { fetchGithubUser, fetchUserRepos } from "../services/github.js";

export default function Home() {
  const navigate = useNavigate();
  const {
    username,
    setUsername,
    setProfile,
    repos,
    setRepos,
    selectedRepos,
    setSelectedRepos,
  } = useDevTrack();
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setLoading(true);
    setError("");
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
      setError(err.message);
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleRepo(repoName) {
    setSelectedRepos((prev) =>
      prev.includes(repoName)
        ? prev.filter((r) => r !== repoName)
        : [...prev, repoName],
    );
  }

  return (
    <div>
      <p className="label-eyebrow mb-3">AI Career Mentor</p>
      <div className="max-w-xl mb-8">
        <h1 className="font-display text-[34px] font-semibold leading-tight mb-3">
          Turn your GitHub into a job-ready portfolio.
        </h1>
        <p className="text-ink-soft text-sm leading-relaxed">
          DevTrack reads your repositories the way a recruiter would — then
          tells you exactly what to fix, build, and learn next.
        </p>
      </div>

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
          disabled={loading}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Fetching..." : "Analyze"}
        </button>
      </form>

      {error && (
        <div className="mb-8 px-4 py-3 rounded-card bg-flag-soft border border-flag/30 text-sm text-flag">
          {error}
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
            onClick={() => navigate("/dashboard")}
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
