import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BarChart3,
  ShieldCheck,
  LogOut,
  Mail,
  Lock,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../services/supabase.js";
import { fetchHistory } from "../services/history.js";

const AVATAR_PALETTE = [
  "#8B5CF6",
  "#22D3EE",
  "#3DDC97",
  "#F0B75C",
  "#F0618B",
  "#5B9EF0",
];
function autoAvatarColor(seed) {
  if (!seed) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "progress", label: "Progress Report", icon: BarChart3 },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "account", label: "Account", icon: LogOut },
];

export default function Settings() {
  const { profile, user, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [saved, setSaved] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailError, setEmailError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [period, setPeriod] = useState("week");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetchHistory(user.id)
      .then(setHistory)
      .catch(() => {});
  }, [user?.id]);

  const PERIOD_MS = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
  };
  const cutoff = Date.now() - PERIOD_MS[period];
  const inRange = history.filter(
    (h) => new Date(h.analyzed_at).getTime() >= cutoff,
  );
  const avgScore = inRange.length
    ? Math.round(
        inRange.reduce((s, h) => s + h.quality_score, 0) / inRange.length,
      )
    : null;
  const maxScore = Math.max(1, ...inRange.map((h) => h.quality_score));

  const displayName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.email;
  const avatarColor = autoAvatarColor(user?.email || firstName);

  async function handleSaveProfile(e) {
    e.preventDefault();
    await updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      avatar_color: avatarColor,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleChangeEmail(e) {
    e.preventDefault();
    setEmailError("");
    setEmailStatus("");
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) setEmailError(error.message);
    else {
      setEmailStatus(
        "Confirmation links sent to both emails. Click them to complete the change.",
      );
      setNewEmail("");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPasswordError(error.message);
    else {
      setPasswordStatus("Password updated successfully.");
      setNewPassword("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-ink-faint hover:text-ink mb-6 font-mono"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-semibold text-bg shrink-0"
          style={{ background: avatarColor }}
        >
          {displayName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold truncate">
            {displayName}
          </h1>
          <p className="text-sm text-ink-faint truncate font-mono">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "border-violet text-violet"
                  : "border-transparent text-ink-faint hover:text-ink"
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <div className="card p-6">
          <p className="label-eyebrow mb-1">Profile</p>
          <h2 className="font-display text-lg font-semibold mb-5">
            Name &amp; identity
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <User size={12} /> First name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <User size={12} /> Last name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              {saved && <Check size={15} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "progress" && (
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <p className="label-eyebrow mb-1">Progress Report</p>
              <h2 className="font-display text-lg font-semibold">
                Your analysis activity
              </h2>
            </div>
            <div className="flex gap-1">
              {["day", "week", "month"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-card capitalize transition-colors ${
                    period === p
                      ? "bg-violet-soft text-violet font-semibold"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {inRange.length === 0 ? (
            <p className="text-sm text-ink-faint">
              No analyses in this period yet.
            </p>
          ) : (
            <>
              <div className="flex gap-8 mb-6">
                <div>
                  <p className="font-display text-2xl font-semibold">
                    {inRange.length}
                  </p>
                  <p className="text-[11px] text-ink-faint">
                    analyses this {period}
                  </p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold">
                    {avgScore}
                  </p>
                  <p className="text-[11px] text-ink-faint">average score</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                {inRange.map((h) => (
                  <div
                    key={h.id}
                    title={`${h.repo_name}: ${h.quality_score}/100`}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-violet to-cyan opacity-80 hover:opacity-100 transition-opacity"
                    style={{
                      height: `${(h.quality_score / maxScore) * 100}%`,
                      minHeight: 4,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="card p-6">
            <p className="label-eyebrow mb-1">Security</p>
            <h2 className="font-display text-lg font-semibold mb-1">
              Change email
            </h2>
            <p className="text-xs text-ink-faint mb-4">
              Current:{" "}
              <span className="font-mono text-ink-soft">{user?.email}</span>
            </p>
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <Mail size={12} /> New email address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              {emailError && <p className="text-xs text-flag">{emailError}</p>}
              {emailStatus && (
                <p className="text-xs text-grow leading-relaxed">
                  {emailStatus}
                </p>
              )}
              <button type="submit" className="btn-secondary text-sm w-full">
                Update Email
              </button>
            </form>
          </div>

          <div className="card p-6">
            <p className="label-eyebrow mb-1">Security</p>
            <h2 className="font-display text-lg font-semibold mb-4">
              Change password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="label-eyebrow flex items-center gap-1.5 mb-2">
                  <Lock size={12} /> New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
                />
              </div>
              {passwordError && (
                <p className="text-xs text-flag">{passwordError}</p>
              )}
              {passwordStatus && (
                <p className="text-xs text-grow">{passwordStatus}</p>
              )}
              <button type="submit" className="btn-secondary text-sm w-full">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="card p-6">
          <p className="label-eyebrow mb-1">Account</p>
          <h2 className="font-display text-lg font-semibold mb-5">Sign out</h2>
          <p className="text-sm text-ink-soft mb-5">
            You'll need to log in again to access your dashboard and history.
          </p>
          <button
            onClick={signOut}
            className="btn-secondary flex items-center gap-2 text-sm text-flag border-flag/30 hover:bg-flag-soft"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
