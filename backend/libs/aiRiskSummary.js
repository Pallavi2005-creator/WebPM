import { callClaudeJSON } from "./aiClient.js";

async function generateRiskSummary(metrics, projectName) {
  const prompt = `You are a project management analyst. Given this structured risk data for project "${projectName}", write a short status summary and recommendations.

Data:
${JSON.stringify(metrics, null, 2)}

Respond with ONLY this JSON, no markdown fences:
{
  "summary": "2-3 sentence plain-English summary of project health, referencing the actual numbers above",
  "recommendations": ["specific action 1", "specific action 2"]
}

Do not invent information not present in the data above.`;

  return callClaudeJSON(prompt, 400);
}

export { generateRiskSummary };