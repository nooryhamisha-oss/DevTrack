async function callGroq(systemPrompt, prompt) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful assistant.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned empty content");
  return content;
}

async function callOpenRouter(systemPrompt, prompt) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://devtrack.netlify.app",
        "X-Title": "DevTrack",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: systemPrompt || "You are a helpful assistant.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return content;
}

async function callWithFallback(systemPrompt, prompt) {
  try {
    return await callGroq(systemPrompt, prompt);
  } catch (groqErr) {
    console.error("Groq failed, trying OpenRouter:", groqErr.message);
    try {
      return await callOpenRouter(systemPrompt, prompt);
    } catch (orErr) {
      console.error("OpenRouter also failed:", orErr.message);
      throw new Error("All AI services are temporarily unavailable.");
    }
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { prompt, systemPrompt } = JSON.parse(event.body);
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "The prompt is empty." }),
      };
    }

    const content = await callWithFallback(systemPrompt, prompt);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 502,
      body: JSON.stringify({
        error:
          "All AI services are temporarily unavailable. Please try again in a few minutes.",
      }),
    };
  }
};
