import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  BarChart3,
  ShieldCheck,
  LogOut,
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
export default function Settings() {
  const { profile, user, updateProfile, signOut } = useAuth();
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
    if (error) {
      setEmailError(error.message);
    } else {
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
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordStatus("Password updated successfully.");
      setNewPassword("");
    }
  }
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <SettingsIcon size={28} />
          SETTINGS
        </h1>
        <p className="text-lg font-semibold mt-2">Account Settings</p>
        <p className="text-ink-faint">
          Manage your profile, progress, and account security.
        </p>
      </div>

      <div className="card p-6 mb-5">
        <p className="label-eyebrow mb-4">Profile</p>

        <div className="flex items-center gap-3 mb-5">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-display font-semibold text-bg shrink-0"
            style={{ background: avatarColor }}
          >
            {(firstName || "U").charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0">
            <p className="font-semibold truncate">
              {firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : "Unnamed user"}
            </p>
            <p className="text-xs text-ink-faint truncate">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-2 gap-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
          />

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
          />

          <button type="submit" className="btn-primary col-span-2 mt-1">
            {saved ? "Saved ✓" : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="label-eyebrow flex items-center gap-2">
            <BarChart3 size={13} />
            Progress Report
          </p>

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
          <p className="text-xs text-ink-faint">
            No analyses in this period yet.
          </p>
        ) : (
          <>
            <div className="flex gap-6 mb-5">
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

            <div className="flex items-end gap-1.5 h-20">
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

      <div className="card p-6 mb-5">
        <p className="label-eyebrow mb-4 flex items-center gap-2">
          <ShieldCheck size={13} />
          Security
        </p>

        <form onSubmit={handleChangeEmail} className="mb-5">
          <p className="text-xs text-ink-faint mb-2">
            Change email — current:{" "}
            <span className="font-mono text-ink-soft">{user?.email}</span>
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              required
              className="flex-1 px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
            />

            <button type="submit" className="btn-secondary text-sm px-4">
              Update
            </button>
          </div>

          {emailError && <p className="text-xs text-flag mt-2">{emailError}</p>}

          {emailStatus && (
            <p className="text-xs text-grow mt-2">{emailStatus}</p>
          )}
        </form>

        <form onSubmit={handleChangePassword}>
          <p className="text-xs text-ink-faint mb-2">Change password</p>

          <div className="flex gap-2">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              required
              className="flex-1 px-3 py-2.5 rounded-card border border-border bg-panel text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet"
            />

            <button type="submit" className="btn-secondary text-sm px-4">
              Update
            </button>
          </div>

          {passwordError && (
            <p className="text-xs text-flag mt-2">{passwordError}</p>
          )}

          {passwordStatus && (
            <p className="text-xs text-grow mt-2">{passwordStatus}</p>
          )}
        </form>
      </div>

      <div className="card p-6">
        <p className="label-eyebrow mb-4">Account</p>

        <button
          onClick={signOut}
          className="btn-secondary flex items-center gap-2 text-sm text-flag border-flag/30 hover:bg-flag-soft"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </>
  );
}
