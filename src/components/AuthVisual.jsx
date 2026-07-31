import {
  GitBranch,
  GitCommit,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const INSIGHT_LINES = [
  { text: "README structure — clear", ok: true },
  { text: "Component architecture — solid", ok: true },
  { text: "Test coverage — missing", ok: false },
  { text: "CI pipeline — not detected", ok: false },
];

export default function AuthVisual() {
  return (
    <div className="relative hidden lg:flex flex-1 items-center justify-center overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.16]"
        viewBox="0 0 500 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M40 20 V200 C40 240 70 240 110 260 S180 300 180 360 V580"
          stroke="#22D3EE"
          strokeWidth="1.5"
        />
        <path
          d="M40 200 C40 240 80 230 130 240 S240 220 240 160 V0"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />
        <path
          d="M420 40 V220 C420 260 380 260 340 280 S280 320 280 380 V580"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />
        {[
          [40, 20],
          [40, 200],
          [180, 360],
          [240, 0],
          [130, 240],
          [420, 40],
          [340, 280],
          [280, 580],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#EDEFF5" />
        ))}
      </svg>

      <div className="absolute top-[16%] left-[10%] animate-float-slow">
        <div className="flex items-center gap-2 px-3 py-2 rounded-card bg-panel2/90 border border-border backdrop-blur-sm shadow-lg">
          <Star size={13} className="text-flag" />
          <span className="font-mono text-[11px] text-ink-soft">
            Portfolio +14 this month
          </span>
        </div>
      </div>
      <div className="absolute bottom-[20%] right-[8%] animate-float-slower">
        <div className="flex items-center gap-2 px-3 py-2 rounded-card bg-panel2/90 border border-border backdrop-blur-sm shadow-lg">
          <GitCommit size={13} className="text-cyan" />
          <span className="font-mono text-[11px] text-ink-soft">
            3 repos analyzed
          </span>
        </div>
      </div>

      <div className="relative z-10 w-[300px]">
        <div className="relative overflow-hidden rounded-card border border-border bg-panel2/95 backdrop-blur-sm shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-cyan/25 via-cyan/5 to-transparent animate-scan-sweep pointer-events-none" />
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <GitBranch size={14} className="text-violet" />
            <span className="font-mono text-xs text-ink-soft truncate">
              your-username/portfolio
            </span>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <span className="label-eyebrow">Quality Score</span>
              <span className="font-display text-3xl font-bold text-gradient animate-fade-in-up">
                87
              </span>
            </div>
            <div className="space-y-2.5">
              {INSIGHT_LINES.map((line, i) => (
                <div
                  key={line.text}
                  className="flex items-center gap-2 animate-fade-in-up"
                  style={{ animationDelay: `${0.15 * i + 0.2}s` }}
                >
                  {line.ok ? (
                    <CheckCircle2 size={13} className="text-grow shrink-0" />
                  ) : (
                    <AlertCircle size={13} className="text-flag shrink-0" />
                  )}
                  <span className="font-mono text-[11px] text-ink-soft">
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-ink-faint mt-6 leading-relaxed max-w-[240px] mx-auto">
          DevTrack reads your repositories the way a recruiter would —
          <span className="text-ink-soft"> in seconds, not scrolls.</span>
        </p>
      </div>
    </div>
  );
}
