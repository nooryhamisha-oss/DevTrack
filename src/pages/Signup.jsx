import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GitBranch, Loader2, Sparkles, Target, Milestone } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(email, password, firstName, lastName);
      if (data.session) {
        navigate("/app");
      } else {
        setCheckEmail(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-xl font-semibold mb-2">
            Check your email
          </h1>
          <p className="text-sm text-ink-soft">
            We sent a confirmation link to <strong>{email}</strong>. Click it,
            then come back and log in.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-block mt-6 px-6 py-2.5"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-bg text-ink flex">
      <div
        className="hidden md:flex md:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #8b5cf6, #22d3ee)" }}
      >
        <div
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "#fff" }}
        />
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-semibold text-lg text-bg relative"
        >
          <span className="w-8 h-8 rounded-lg bg-bg/20 backdrop-blur flex items-center justify-center">
            <GitBranch size={16} strokeWidth={2.5} />
          </span>
          DevTrack
        </Link>

        <div className="relative">
          <p className="font-display text-3xl font-semibold text-bg leading-tight mb-8">
            Your progress, saved to an account that's actually yours.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-bg/90">
              <span className="w-8 h-8 rounded-lg bg-bg/20 flex items-center justify-center shrink-0">
                <Sparkles size={15} />
              </span>
              <p className="text-sm">Every analysis saved permanently</p>
            </div>
            <div className="flex items-center gap-3 text-bg/90">
              <span className="w-8 h-8 rounded-lg bg-bg/20 flex items-center justify-center shrink-0">
                <Target size={15} />
              </span>
              <p className="text-sm">Track your score over time</p>
            </div>
            <div className="flex items-center gap-3 text-bg/90">
              <span className="w-8 h-8 rounded-lg bg-bg/20 flex items-center justify-center shrink-0">
                <Milestone size={15} />
              </span>
              <p className="text-sm">Secure — only visible to you</p>
            </div>
          </div>
        </div>

        <p className="text-bg/70 text-xs relative">© 2026 DevTrack.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="md:hidden flex items-center gap-2 font-display font-semibold text-lg mb-8 justify-center"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
              <GitBranch size={15} strokeWidth={2.5} />
            </span>
            DevTrack
          </Link>

          <p className="label-eyebrow mb-2">Get started</p>
          <h1 className="font-display text-2xl font-semibold mb-8">
            Create your account
          </h1>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-eyebrow block mb-1.5">First name</label>
                <input
                  type="text"
                  required
                  placeholder="Hamisha"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="label-eyebrow block mb-1.5">Last name</label>
                <input
                  type="text"
                  required
                  placeholder="Hamrah"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>
            <div>
              <label className="label-eyebrow block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-card border border-border bg-panel text-ink text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
            </div>

            {error && <p className="text-xs text-flag">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-faint mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-violet font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
