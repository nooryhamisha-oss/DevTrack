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

CRITICAL RULES:
1. Base your score and every insight ONLY on the concrete facts given below.
2. Never invent features, tests, documentation, or functionality that is not evidenced.
3. If information is thin, score conservatively and explicitly mention missing information.
4. Be consistent: given the same facts, reach the same conclusion every time.

Schema:
{
  "qualityScore": number (0-100),
  "recruiterSummary": string,
  "insights": string[],
  "recruiterFirstImpression": string
}`;

  const treeText = fileTree.length
    ? fileTree.join("\n")
    : "(no file listing available)";

  const prompt = `Repository name: ${repo.name}
Description: ${repo.description || "none provided"}
Primary languages (by bytes): ${Object.keys(languages).join(", ") || "unknown"}
Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}

Actual file/folder listing:
"""
${treeText}
"""

README content:
"""
${readme.slice(0, 3000) || "(no README found)"}
"""`;

  const raw = await callAI(systemPrompt, prompt);

  return parseJSON(raw);
}

export async function evaluatePortfolio(repos, repoAnalyses) {
  const systemPrompt = `You are a technical hiring advisor evaluating a developer's overall GitHub portfolio.
Respond ONLY with valid JSON, no prose, no markdown fences.

Base your evaluation only on the repository scores and summaries given below.

Schema:
{
  "portfolioScore": number,
  "skillLevel": "Beginner" | "Intermediate" | "Advanced",
  "strengths": string[],
  "weaknesses": string[],
  "summary": string
}`;

  const repoSummaries = repos
    .map((r) => {
      const a = repoAnalyses[r.name];

      return `- ${r.name}: quality ${
        a?.qualityScore ?? "N/A"
      }/100 — ${a?.recruiterSummary ?? r.description ?? "no summary"}`;
    })
    .join("\n");

  const prompt = `Here are ${repos.length} repositories selected by the developer as their best work:

${repoSummaries}`;

  const raw = await callAI(systemPrompt, prompt);

  return parseJSON(raw);
}

export async function analyzeSkillGap(repos, languages, targetRole) {
  const systemPrompt = `You are a career coach specializing in software engineering roles.
Respond ONLY with valid JSON, no prose, no markdown fences.

Schema:
{
  "targetRole": string,
  "currentSkills": string[],
  "missingSkills": [
    {
      "skill": string,
      "priority": "High" | "Medium" | "Low",
      "reason": string
    }
  ],
  "readinessPercent": number
}`;

  const prompt = `Target role: ${targetRole}
Languages used across repositories: ${languages.join(", ") || "unknown"}

Repository names and descriptions:
${repos
  .map((r) => `- ${r.name}: ${r.description || "no description"}`)
  .join("\n")}`;

  const raw = await callAI(systemPrompt, prompt);

  return parseJSON(raw);
}

export async function getLearningPath(skillGapResult) {
  const systemPrompt = `You are a curriculum designer creating a short-term learning roadmap.
Respond ONLY with valid JSON, no prose, no markdown fences.

Schema:
{
  "steps": [
    {
      "title": string,
      "description": string,
      "estimatedWeeks": number,
      "resourceKeyword": string,
      "projectIdea": string
    }
  ]
}

Provide exactly 4-6 steps, ordered by priority.`;

  const missing = skillGapResult.missingSkills
    .map((m) => `${m.skill} (priority: ${m.priority})`)
    .join(", ");

  const prompt = `Target role: ${skillGapResult.targetRole}

Missing skills to address, in priority order:
${missing}`;

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
      url: `https://www.youtube.com/results?search_query=${q}+tutorial`,
    },
  ];
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

  return `${opener} I'm DreamEagle, your guide here at DevTrack.

I can analyze your GitHub repositories, score your portfolio, find your skill gaps, and build you a learning roadmap — all powered by AI.

If you're not sure how to use this site, don't worry — I'll walk you through it step by step until you reach your goal. Just ask me anything!`;
}

const GUIDE_SYSTEM_PROMPT = `You are "DreamEagle", the in-app assistant for DevTrack — an AI tool that analyzes a developer's GitHub repositories and turns them into a job-ready portfolio evaluation.

DevTrack has these pages:
Dashboard, Project Analysis, Repository Analysis, Skill Gap, Roadmap, History, and Settings.

You ONLY discuss:
1. How to use DevTrack and what its pages/features do.
2. The specific user's own analysis results when given to you.
3. Programming, software engineering, developer tools, and tech career topics.

If asked something outside this scope, briefly decline and redirect to what you can help with.

STYLE:
Warm, concise (2-4 sentences), and concrete.
Always engage with the specific thing the user asked.
Never invent a score, skill, or feature.
Always respond in English only.

If the user hasn't analyzed anything yet, tell them to start on the Dashboard page with their GitHub username.`;

export async function askGuideBot(
  conversationHistory,
  currentPage,
  contextData = {},
) {
  const contextNote = `User is currently on the "${currentPage}" page.`;

  const { username, portfolioResult, skillGapResult, learningPath } =
    contextData;

  const factsParts = [];

  if (username) {
    factsParts.push(`GitHub username: ${username}`);
  }

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
      `Missing skills: ${skillGapResult.missingSkills
        .map((m) => `${m.skill} (${m.priority})`)
        .join(", ")}`,
    );
  }

  if (learningPath) {
    factsParts.push(
      `Roadmap steps: ${learningPath.steps.map((s) => s.title).join(" -> ")}`,
    );
  }

  const factsBlock = factsParts.length
    ? `

Here is this user's real, current data — use it to give specific answers instead of generic advice:
${factsParts.join("\n")}`
    : `

(This user hasn't analyzed any repositories yet.)`;

  const lastUserMessage =
    conversationHistory.length > 0
      ? conversationHistory[conversationHistory.length - 1].content
      : "";

  const historyText = conversationHistory
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = `${contextNote}${factsBlock}

${historyText ? `${historyText}\n` : ""}User: ${lastUserMessage}`;

  return callAI(GUIDE_SYSTEM_PROMPT, prompt);
}
