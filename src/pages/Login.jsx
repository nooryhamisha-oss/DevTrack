import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthVisual from "../components/AuthVisual.jsx";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#EDEFF5 1px, transparent 1px), linear-gradient(90deg, #EDEFF5 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="absolute top-[-15%] right-[10%] w-[480px] h-[480px] rounded-full opacity-[0.14] blur-[130px] bg-violet pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[5%] w-[420px] h-[420px] rounded-full opacity-[0.12] blur-[130px] bg-cyan pointer-events-none" />

      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-semibold text-lg mb-10"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
              <GitBranch size={15} strokeWidth={2.5} className="text-bg" />
            </span>
            DevTrack
          </Link>

          <p className="label-eyebrow mb-2">Welcome back</p>
          <h1 className="font-display text-2xl font-semibold mb-1">
            Log in to your account
          </h1>
          <p className="text-sm text-ink-faint mb-8">
            Pick up right where your portfolio progress left off.
          </p>

          <div className="relative card p-6 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet to-cyan" />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet transition-shadow"
                />
              </div>
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet transition-shadow"
                />
              </div>
              {error && (
                <p className="text-xs text-flag bg-flag-soft border border-flag/25 rounded-card px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ArrowRight size={15} />
                )}
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-ink-faint mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-violet font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <AuthVisual />
    </div>
  );
}
