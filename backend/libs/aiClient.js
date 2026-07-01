import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

async function callClaudeJSON(prompt, maxTokens = 400) {
  if (USE_MOCK_AI) {
    return mockResponse(prompt);
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Crude but effective: detects which prompt type this is and fakes a plausible answer
function mockResponse(prompt) {
  if (prompt.includes("suggestedTags")) {
    // task triage prompt
    const urgentWords = ["urgent", "blocking", "crash", "production", "asap", "critical"];
    const isUrgent = urgentWords.some((w) => prompt.toLowerCase().includes(w));
    return Promise.resolve({
      priority: isUrgent ? "Urgent" : "Medium",
      complexity: "M",
      suggestedTags: isUrgent ? ["bug", "urgent"] : ["general"],
      reasoning: isUrgent
        ? "Contains urgent/blocking language."
        : "No strong urgency signals detected; defaulting to medium.",
    });
  }

  // risk summary prompt
  return Promise.resolve({
    summary:
      "This is a mocked AI summary for local testing without API credits. Replace with real data once billing is set up.",
    recommendations: [
      "Mocked recommendation 1",
      "Mocked recommendation 2",
    ],
  });
}


export { callClaudeJSON };