import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GitBranch,
  ArrowRight,
  Target,
  TrendingUp,
  Milestone,
  Sparkles,
  FileWarning,
  Clock,
  Compass,
  ChevronDown,
  Mail,
  ExternalLink,
  MapPin,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Repository Analysis",
    desc: "AI reviews your code the way a recruiter would — in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Score",
    desc: "One clear number showing how job-ready your GitHub really is.",
  },
  {
    icon: Sparkles,
    title: "Skill Gap Detection",
    desc: "Compare your skills against any target role, ranked by priority.",
  },
  {
    icon: Milestone,
    title: "Learning Roadmap",
    desc: "A personalized, time-estimated plan with real resources to follow.",
  },
  {
    icon: FileWarning,
    title: "Recruiter First Impression",
    desc: "See exactly what a recruiter thinks in the first 6 seconds of your repo.",
  },
  {
    icon: Compass,
    title: "AI Guide, DreamEagle",
    desc: "Ask questions and get unstuck anywhere in the app, on any page.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Enter your GitHub username",
    desc: "No connecting accounts, no permissions — just type your public username.",
  },
  {
    step: "2",
    title: "Pick your best repositories",
    desc: "Select the projects you want reviewed, like a recruiter would see them.",
  },
  {
    step: "3",
    title: "AI analyzes the real content",
    desc: "README, file structure, and languages are reviewed — not guesses.",
  },
  {
    step: "4",
    title: "Get your score & roadmap",
    desc: "A portfolio score, skill gaps for your target role, and what to build next.",
  },
];

const FAQS = [
  {
    q: "Does DevTrack need access to my GitHub account?",
    a: "No. DevTrack only reads public repository data through GitHub's public API — no login, no permissions, no write access.",
  },
  {
    q: "How does the AI score my repositories?",
    a: "It reads your README, file/folder structure, and languages used, then evaluates quality, documentation, and structure the way a recruiter or senior engineer would.",
  },
  {
    q: "Will I get the same score every time?",
    a: "Yes, results are cached per repository. If you re-analyze the same unchanged repo, the same result is reused instead of generating a new one.",
  },
  {
    q: "Can I target a specific job role?",
    a: "Yes. On the Skill Gap page you can enter any target role and DevTrack will compare your current skills against what that role typically needs.",
  },
  {
    q: "Is DevTrack free to use?",
    a: "Yes, this is a student project built to help developers understand their GitHub portfolio better.",
  },
];
export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="px-6 md:px-10 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet to-cyan flex items-center justify-center">
            <GitBranch size={15} strokeWidth={2.5} />
          </span>
          DevTrack
        </div>
        <Link to="/login" className="btn-secondary text-sm px-4 py-2">
          Get Started
        </Link>
      </header>
      <main
        className="relative bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundPosition: "center 25%",
        }}
      >
        <div className="absolute inset-0 bg-bg/40" />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #22d3ee)" }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-24">
          <p className="label-eyebrow mb-4">AI Career Mentor for Developers</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl mb-6">
            Turn your GitHub into a{" "}
            <span className="text-gradient">job-ready portfolio</span>.
          </h1>
          <p className="text-ink-soft text-base leading-relaxed max-w-xl mb-10">
            DevTrack analyzes your repositories with AI, scores your portfolio,
            finds your skill gaps against any target role, and builds you a
            personalized roadmap — powered by{" "}
            <strong className="text-ink">DreamEagle</strong>, your in-app AI
            guide.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2 px-7 py-3.5"
          >
            Analyze my GitHub <ArrowRight size={16} />
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-xs text-ink-faint font-mono">
            <span>✓ No GitHub login required</span>
            <span>✓ Public repository data only</span>
            <span>✓ Powered by real AI analysis</span>
          </div>
        </div>
      </main>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <p className="label-eyebrow mb-3">THE PROBLEM</p>
        <h2 className="font-display text-3xl font-semibold mb-4 max-w-xl">
          You build projects. You don't know{" "}
          <span className="text-gradient">how recruiters read them</span>.
        </h2>
        <p className="text-ink-soft text-sm leading-relaxed max-w-xl mb-10">
          Most developers have no idea what's actually missing from their GitHub
          — a weak README, no tests, unclear structure — until a recruiter has
          already scrolled past. DevTrack tells you before they do.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card card-hover p-5">
            <FileWarning size={18} className="text-flag mb-3" />
            <p className="text-sm font-semibold mb-1">No idea what's missing</p>
            <p className="text-xs text-ink-soft leading-relaxed">
              Tests? Docs? Structure? Hard to self-assess your own code.
            </p>
          </div>
          <div className="card card-hover p-5">
            <Clock size={18} className="text-flag mb-3" />
            <p className="text-sm font-semibold mb-1">Hours lost guessing</p>
            <p className="text-xs text-ink-soft leading-relaxed">
              Searching scattered tutorials instead of following a clear plan.
            </p>
          </div>
          <div className="card card-hover p-5">
            <Compass size={18} className="text-flag mb-3" />
            <p className="text-sm font-semibold mb-1">No clear next step</p>
            <p className="text-xs text-ink-soft leading-relaxed">
              Knowing what to learn next for a specific job is genuinely hard.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <p className="label-eyebrow mb-3">FEATURES</p>
        <h2 className="font-display text-3xl font-semibold mb-10 max-w-xl">
          Everything you need to{" "}
          <span className="text-gradient">become job-ready</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover p-6">
              <Icon size={20} className="text-violet mb-3" />
              <h3 className="font-display text-sm font-semibold mb-1.5">
                {title}
              </h3>
              <p className="text-xs text-ink-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <p className="label-eyebrow mb-3">HOW IT WORKS</p>
        <h2 className="font-display text-3xl font-semibold mb-10 max-w-xl">
          Four steps from{" "}
          <span className="text-gradient">GitHub to roadmap</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="card card-hover p-6 flex gap-5">
              <span className="font-display text-2xl font-semibold text-violet shrink-0">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold mb-1">{title}</p>
                <p className="text-xs text-ink-soft leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="max-w-5xl mx-auto px-6 py-20 border-t border-border"
      >
        <p className="label-eyebrow mb-3">FAQ</p>
        <h2 className="font-display text-3xl font-semibold mb-10 max-w-xl">
          Questions <span className="text-gradient">before you start</span>
        </h2>
        <div className="space-y-2 max-w-2xl">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="card card-hover overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-ink-faint transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-xs text-ink-soft leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <p className="label-eyebrow mb-3">ABOUT DEVTRACK</p>
        <h2 className="font-display text-3xl font-semibold mb-6 max-w-xl">
          Built to close the gap between{" "}
          <span className="text-gradient">code and career</span>
        </h2>
        <div className="max-w-2xl space-y-4 text-sm text-ink-soft leading-relaxed">
          <p>
            DevTrack is an AI-powered developer analytics platform built to help
            programmers understand how their GitHub portfolio actually reads to
            a recruiter — and what to do about it.
          </p>
          <p>
            Instead of guessing what's missing from a project, users connect
            their public GitHub username and DevTrack's AI reviews real
            repository content — README quality, file structure, and languages —
            the way a technical hiring manager would in the first few seconds.
          </p>
          <p>
            The platform combines repository analysis, portfolio scoring, skill
            gap detection against any target role, and a personalized learning
            roadmap into a single workspace — plus{" "}
            <strong className="text-ink">DreamEagle</strong>, an in-app AI guide
            available on every page.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="max-w-5xl mx-auto px-6 py-20 border-t border-border"
      >
        <p className="label-eyebrow mb-3">CONTACT</p>
        <h2 className="font-display text-3xl font-semibold mb-10 max-w-xl">
          Questions? <span className="text-gradient">Reach out</span>.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
          <a
            href="mailto:nooryhamisha@gmail.com"
            className="card card-hover p-5 flex items-center gap-3"
          >
            <Mail size={18} className="text-violet shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">Email</p>
              <p className="text-sm font-mono truncate">
                nooryhamisha@gmail.com
              </p>
            </div>
          </a>
          <a
            href="https://github.com/nooryhamisha-oss"
            target="_blank"
            rel="noreferrer"
            className="card card-hover p-5 flex items-center gap-3"
          >
            <GitBranch size={18} className="text-violet shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">GitHub</p>
              <p className="text-sm font-mono truncate">Hamisha Noori</p>
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/hamisha-noori-47149b396?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noreferrer"
            className="card card-hover p-5 flex items-center gap-3"
          >
            <ExternalLink size={18} className="text-violet shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">LinkedIn</p>
              <p className="text-sm font-mono truncate">Hamisha Noori</p>
            </div>
          </a>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-ink-faint mt-4">
          <MapPin size={12} /> Afghanistan
        </p>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="font-display font-semibold text-sm mb-3">DevTrack</p>
            <p className="text-xs text-ink-faint leading-relaxed">
              Turning GitHub repositories into job-ready portfolios, one
              analysis at a time.
            </p>
          </div>
          <div>
            <p className="label-eyebrow mb-3">Quick Links</p>
            <div className="flex flex-col gap-2 text-xs text-ink-soft">
              <Link to="/" className="hover:text-ink transition-colors">
                Home
              </Link>
              <a href="#faq" className="hover:text-ink transition-colors">
                FAQ
              </a>
              <a href="#contact" className="hover:text-ink transition-colors">
                Contact
              </a>
              <Link to="/login" className="hover:text-ink transition-colors">
                Log In
              </Link>
            </div>
          </div>
          <div>
            <p className="label-eyebrow mb-3">Connect</p>
            <div className="flex flex-col gap-2 text-xs text-ink-soft">
              <a
                href="mailto:nooryhamisha@gmail.com"
                className="hover:text-ink transition-colors"
              >
                Email
              </a>
              <a
                href="https://github.com/nooryhamisha-oss"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/nooryhamisha-oss"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="text-center text-xs text-ink-faint py-5">
            © 2026 DevTrack.
          </p>
        </div>
      </footer>
    </div>
  );
}
