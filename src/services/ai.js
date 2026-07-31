const FUNCTION_URL = "/.netlify/functions/analyze";

async function callAI(systemPrompt, prompt) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt, prompt }),
  });

  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(
      "The server took too long to respond. Please try again in a moment.",
    );
  }

  if (!res.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : "AI service is temporarily unavailable. Please try again shortly.";
    throw new Error(message);
  }
  return data.content;
}

function parseJSON(raw) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "The AI response could not be processed. Please try again.",
    );
  }
}

export async function analyzeRepository(
  repo,
  readme,
  languages,
  fileTree = [],
) {
  const systemPrompt = `You are a senior software engineer mentoring a junior developer.
You review a single GitHub repository and respond ONLY with valid JSON, no prose, no markdown fences.

CRITICAL RULES — you must follow these exactly:
1. Base your score and every insight ONLY on the concrete facts given below (README text, language
   breakdown, file/folder listing, stars/forks). Never invent features, tests, documentation, or
   functionality that is not evidenced by the given facts.
2. If information is thin (e.g. no README, very few files), do NOT compensate by guessing generously
   or harshly at random. Instead, score conservatively based only on what is verifiably present, and
   say explicitly in "insights" that key information (like a README) is missing — that itself is a
   real, actionable gap worth flagging.
3. Be consistent: given the same facts, you must reach the same conclusion every time. Do not vary
   your score for stylistic or creative reasons — this is a factual technical assessment, not creative
   writing.

Schema:
{
  "qualityScore": number (0-100),
  "recruiterSummary": string (1-2 plain-English sentences a recruiter with no time would read),
  "insights": string[] (3-5 short, specific, actionable bullet points — mix of strengths and gaps,
    grounded in the actual file names / README content given, not generic advice),
  "recruiterFirstImpression": string (one honest sentence: what a recruiter thinks in the first 6 seconds looking at this repo)
}`;

  const treeText = fileTree.length
    ? fileTree.join("\n")
    : "(no file listing available)";
  const prompt = `Repository name: ${repo.name}
Description: ${repo.description || "none provided"}
Primary languages (by bytes): ${Object.keys(languages).join(", ") || "unknown"}
Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}

Actual file/folder listing (real contents of the repository):
"""
${treeText}
"""

README content (may be empty):
"""
${readme.slice(0, 3000) || "(no README found)"}
"""`;
  const raw = await callAI(systemPrompt, prompt);
  return parseJSON(raw);
}
export async function evaluatePortfolio(repos, repoAnalyses) {
  const systemPrompt = `You are a technical hiring advisor evaluating a developer's overall GitHub portfolio.
Respond ONLY with valid JSON, no prose, no markdown fences.
Base your evaluation only on the per-repository scores and summaries given below — do not invent
additional repositories or capabilities. Be consistent: the same input scores should always produce
the same portfolio verdict.
Schema:
{
  "portfolioScore": number (0-100),
  "skillLevel": "Beginner" | "Intermediate" | "Advanced",
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (2-4 items),
  "summary": string (2-3 sentences, overall career-readiness verdict)
}`;
  const repoSummaries = repos
    .map((r) => {
      const a = repoAnalyses[r.name];
      return `- ${r.name}: quality ${a?.qualityScore ?? "N/A"}/100 — ${a?.recruiterSummary ?? r.description ?? "no summary"}`;
    })
    .join("\n");
  const prompt = `Here are ${repos.length} repositories selected by the developer as their best work:\n${repoSummaries}`;
  const raw = await callAI(systemPrompt, prompt);
  return parseJSON(raw);
}
export async function analyzeSkillGap(repos, languages, targetRole) {
  const systemPrompt = `You are a career coach specializing in software engineering roles.
Respond ONLY with valid JSON, no prose, no markdown fences.
Schema:
{
  "targetRole": string,
  "currentSkills": string[] (skills clearly demonstrated by the repos),
  "missingSkills": [{ "skill": string, "priority": "High" | "Medium" | "Low", "reason": string }],
  "readinessPercent": number (0-100, how ready this person is for the target role today)
}`;
  const prompt = `Target role: ${targetRole}
Languages used across repositories: ${languages.join(", ") || "unknown"}
Repository names and descriptions:

${repos.map((r) => `- ${r.name}: ${r.description || "no description"}`).join("\n")}`;
  const raw = await callAI(systemPrompt, prompt);
  return parseJSON(raw);
}

export async function getLearningPath(skillGapResult) {
  const systemPrompt = `You are a curriculum designer creating a short-term learning roadmap.
Respond ONLY with valid JSON, no prose, no markdown fences.
Schema:
{
  "steps": [{
    "title": string,
    "description": string (1 sentence),
    "estimatedWeeks": number,
    "resourceKeyword": string (2-4 word search term, e.g. "React testing library"),
    "projectIdea": string (1 sentence: a small practice project to apply this skill)
  }]
}Provide exactly 4-6 steps, ordered by priority, realistic for a working developer studying part-time.`;
  const missing = skillGapResult.missingSkills
    .map((m) => `${m.skill} (priority: ${m.priority})`)
    .join(", ");
  const prompt = `Target role: ${skillGapResult.targetRole}
Missing skills to address, in priority order: ${missing}`;
  const raw = await callAI(systemPrompt, prompt);
  return parseJSON(raw);
}

export function buildResourceLinks(keyword) {
  const q = encodeURIComponent(keyword);
  return [
    {
      label: "freeCodeCamp",
      url: `https://www.freecodecamp.org/news/search/?query=${q}`,
    },
    {
      label: "MDN Docs",
      url: `https://developer.mozilla.org/en-US/search?q=${q}`,
    },
    {
      label: "W3Schools",
      url: `https://www.google.com/search?q=site:w3schools.com+${q}`,
    },
    {
      label: "YouTube",
      url: ` https://www.youtube.com/results?search_query=${q}+tutorial`,
    },
  ];
}

const GUIDE_SYSTEM_PROMPT = `You are "DreamEagle", the friendly in-app guide for DevTrack, an AI tool that
analyzes a developer's GitHub repositories and turns them into a job-ready portfolio evaluation.

DevTrack has these pages:
1. Home — enter a GitHub username, pick repos to analyze.
2. Dashboard — overall Portfolio Score, strengths/weaknesses, per-repo quality scores.
3. Repository Analysis — detailed review of one repo: recruiter's first impression, strengths, gaps.
4. Skill Gap — pick a target role, see missing skills ranked by priority.
5. Roadmap — a personalized, time-estimated learning plan with real resource links and project ideas.
6. History — track how your repository scores change over time as you improve them.
7. Settings — personalize your display name and avatar color.

Your personality: warm, encouraging, concise (2-4 sentences), practical. Always respond in English only,
regardless of what language the user writes in. Never invent features that don't exist. If the user seems
lost, tell them to start on the Home page with their GitHub username.

If the user's message includes a block of their real current data (portfolio score, skill gap, roadmap),
use those exact numbers and facts when answering — never make up a score or skill the user hasn't actually
gotten. If no data block is given, it means they haven't analyzed anything yet — tell them to start on Home.`;

export async function askGuideBot(
  conversationHistory,
  currentPage,
  contextData = {},
) {
  const contextNote = `[User is currently on the "${currentPage}" page]`;
  const { username, portfolioResult, skillGapResult, learningPath } =
    contextData;
  const factsParts = [];
  if (username) factsParts.push(`GitHub username: ${username}`);
  if (portfolioResult) {
    factsParts.push(
      `Portfolio score: ${portfolioResult.portfolioScore}/100 (${portfolioResult.skillLevel})`,
    );
    factsParts.push(`Strengths: ${portfolioResult.strengths.join(", ")}`);
    factsParts.push(`Weaknesses: ${portfolioResult.weaknesses.join(", ")}`);
  }
  if (skillGapResult) {
    factsParts.push(`Target role: ${skillGapResult.targetRole}`);
    factsParts.push(`Readiness: ${skillGapResult.readinessPercent}%`);
    factsParts.push(
      `Missing skills: ${skillGapResult.missingSkills.map((m) => `${m.skill} (${m.priority})`).join(", ")}`,
    );
  }
  if (learningPath) {
    factsParts.push(
      `Roadmap steps: ${learningPath.steps.map((s) => s.title).join(" -> ")}`,
    );
  }
  const factsBlock = factsParts.length
    ? `\n\nHere is this user's real, current data — use it to give specific answers instead of generic advice:\n${factsParts.join("\n")}`
    : "\n\n(This user hasn't analyzed any repositories yet.)";

  const lastUserMessage =
    conversationHistory[conversationHistory.length - 1].content;
  const historyText = conversationHistory
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  const prompt = `${contextNote}${factsBlock}\n\n${historyText ? historyText + "\n" : ""}User: ${lastUserMessage}`;
  return callAI(GUIDE_SYSTEM_PROMPT, prompt);
}

const MOTIVATIONAL_OPENERS = [
  "Every line of code in your repos is proof you showed up and built something real.",
  "Most people talk about learning to code. You actually shipped projects. That matters.",
  "Your GitHub isn't just a profile — it's evidence of everything you've pushed through to get here.",
  "You're not starting from zero. You're starting from everything you've already built.",
  "The fact that you're here, improving your portfolio, already puts you ahead of most.",
];

export function buildGreeting() {
  const opener =
    MOTIVATIONAL_OPENERS[
      Math.floor(Math.random() * MOTIVATIONAL_OPENERS.length)
    ];
  return `${opener}  I'm **DreamEagle**, your guide here at DevTrack.

I can analyze your GitHub repositories, score your portfolio, find your skill gaps, and build you a learning roadmap — all powered by AI.

If you're not sure how to use this site, don't worry — I'll walk you through it step by step until you reach your goal. Just ask me anything!`;
}
