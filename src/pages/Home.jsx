import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const MOTIVATIONAL_LINES = [
  "Every commit you push is proof you're building something real.",
  "The gap between where you are and where you want to be starts closing today.",
  "Your next opportunity is one strong repository away.",
  "Consistency beats perfection — keep shipping.",
];

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [motivationalLine] = useState(
    () =>
      MOTIVATIONAL_LINES[Math.floor(Math.random() * MOTIVATIONAL_LINES.length)],
  );

  return (
    <div>
      <p className="label-eyebrow mb-3">AI Career Mentor</p>
      <div className="max-w-xl mb-8">
        <p className="font-display text-2xl font-semibold mb-2">
          {getTimeGreeting()},{" "}
          <span className="text-gradient">
            {profile?.first_name || user?.email?.split("@")[0] || "there"}
          </span>{" "}
          👋
        </p>
        <div className="flex items-start gap-2 mb-4 px-3.5 py-2.5 rounded-card bg-violet-soft border border-violet/20 w-fit">
          <Sparkles size={15} className="text-violet shrink-0 mt-0.5" />
          <p className="text-xs text-ink-soft italic leading-relaxed">
            {motivationalLine}
          </p>
        </div>
        <h1 className="font-display text-[34px] font-semibold leading-tight mb-3">
          Turn your GitHub into a job-ready portfolio.
        </h1>
        <p className="text-ink-soft text-sm leading-relaxed mb-5">
          DevTrack reads your repositories the way a recruiter would — then
          tells you exactly what to fix, build, and learn next.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary inline-flex items-center gap-2"
        >
          Start Analysis <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
