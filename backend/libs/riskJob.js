import Task from "../models/task.js";
import Project from "../models/project.js";
import ProjectRisk from "../models/projectRisk.js";
import { recordActivity } from "./index.js";
import {
  calculateOverdueRate,
  calculateStaleRate,
  calculateWorkloadDistribution,
  calculateVariance,
  computeRiskScore,
  getRiskLevel,
  getActiveTasks,
} from "./riskEngine.js";
import { generateRiskSummary } from "./aiRiskSummary.js";

async function runRiskScoringForProject(projectId) {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  const tasks = await Task.find({ project: projectId });

  const overdueRate = calculateOverdueRate(tasks);
  const staleRate = calculateStaleRate(tasks);
  const workloadDistribution = calculateWorkloadDistribution(tasks, project.members);
  const workloadVarianceScore = calculateVariance(workloadDistribution);

  const riskScore = computeRiskScore({ overdueRate, staleRate, workloadVarianceScore });
  const riskLevel = getRiskLevel(riskScore);

  const activeTasks = getActiveTasks(tasks);
  const metrics = {
    totalActiveTasks: activeTasks.length,
    overdueTasks: Math.round(overdueRate * activeTasks.length),
    overdueRate,
    staleTasks: Math.round(staleRate * activeTasks.length),
    staleRate,
    workloadDistribution,
    workloadVarianceScore,
  };

  let aiSummary = "AI summary unavailable.";
  let aiRecommendations = [];
  try {
    const result = await generateRiskSummary(metrics, project.title);
    aiSummary = result.summary;
    aiRecommendations = result.recommendations;
  } catch (err) {
    console.log("Risk summary AI call failed:", err.message);
  }

  const snapshot = await ProjectRisk.create({
    project: project._id,
    workspace: project.workspace,
    metrics,
    riskScore,
    riskLevel,
    aiSummary,
    aiRecommendations,
  });

  try {
    await recordActivity(project.createdBy, "ai_risk_computed", "Project", project._id, {
      description: `AI computed project risk: ${riskLevel} (score ${riskScore})`,
    });
  } catch (err) {
    console.log("Activity log failed (non-critical):", err.message);
  }

  console.log(`✅ Risk computed for "${project.title}": ${riskLevel} (${riskScore})`);
  return snapshot;
}

async function runRiskScoringForAllProjects() {
  const projects = await Project.find({ isArchived: false });
  for (const project of projects) {
    try {
      await runRiskScoringForProject(project._id);
    } catch (err) {
      console.log(`Risk scoring failed for project ${project._id}:`, err.message);
    }
  }
}

export { runRiskScoringForProject, runRiskScoringForAllProjects };