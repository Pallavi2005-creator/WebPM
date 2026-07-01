import { callClaudeJSON } from "./aiClient.js";

async function triageTask({ title, description, existingTags = [] }) {
  const prompt = `You are a project management assistant. Analyze this task and respond with ONLY valid JSON, no other text, no markdown fences.

Task title: ${title}
Task description: ${description || "No description provided"}
Existing tags used in this project: ${existingTags.join(", ") || "none yet"}

Respond with exactly this JSON shape:
{
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "complexity": "S" | "M" | "L" | "XL",
  "suggestedTags": ["tag1", "tag2"],
  "reasoning": "one short sentence explaining the priority choice"
}

Rules:
- "Urgent" only for blocking/production issues or explicit deadlines within 48 hours
- Complexity reflects estimated effort, not urgency
- Suggest 1-3 tags. Reuse existing tags where they genuinely fit. Only invent a new tag if nothing existing applies
- Be decisive — always pick one priority and one complexity, never leave ambiguous`;

  return callClaudeJSON(prompt, 300);
}

export { triageTask };