const ACTIVE_STATUSES = ["To Do", "In Progress", "Review"];
const COMPLEXITY_WEIGHT = { S: 1, M: 2, L: 3, XL: 5 };
const STALE_DAYS = 5;

function getActiveTasks(tasks) {
  return tasks.filter((t) => ACTIVE_STATUSES.includes(t.status) && !t.isArchived);
}

function calculateOverdueRate(tasks) {
  const active = getActiveTasks(tasks);
  if (active.length === 0) return 0;
  const now = new Date();
  const overdue = active.filter((t) => t.dueDate && new Date(t.dueDate) < now);
  return overdue.length / active.length;
}

function calculateStaleRate(tasks) {
  const active = getActiveTasks(tasks);
  if (active.length === 0) return 0;
  const now = new Date();
  const stale = active.filter((t) => {
    const daysSince = (now - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24);
    return daysSince >= STALE_DAYS;
  });
  return stale.length / active.length;
}

function calculateWorkloadDistribution(tasks, members) {
  const loadMap = {};
  members.forEach((m) => {
    const userId = m.user.toString();
    loadMap[userId] = { user: m.user, assignedCount: 0, weightedLoad: 0, overdueCount: 0 };
  });

  const now = new Date();
  const active = getActiveTasks(tasks);

  active.forEach((task) => {
    (task.assignees || []).forEach((assigneeId) => {
      const userId = assigneeId.toString();
      if (!loadMap[userId]) return;
      loadMap[userId].assignedCount += 1;
      loadMap[userId].weightedLoad += COMPLEXITY_WEIGHT[task.aiComplexity] || 2;
      if (task.dueDate && new Date(task.dueDate) < now) {
        loadMap[userId].overdueCount += 1;
      }
    });
  });

  return Object.values(loadMap);
}

function calculateVariance(distribution) {
  const loads = distribution.map((d) => d.weightedLoad);
  if (loads.length === 0) return 0;
  const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
  if (mean === 0) return 0;
  const variance = loads.reduce((sum, l) => sum + (l - mean) ** 2, 0) / loads.length;
  const stdDev = Math.sqrt(variance);
  return Math.min(stdDev / mean, 1);
}

function computeRiskScore({ overdueRate, staleRate, workloadVarianceScore }) {
  const score = overdueRate * 40 + staleRate * 25 + workloadVarianceScore * 35;
  return Math.round(Math.min(score, 100));
}

function getRiskLevel(score) {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 75) return "High";
  return "Critical";
}

export {
  getActiveTasks,
  calculateOverdueRate,
  calculateStaleRate,
  calculateWorkloadDistribution,
  calculateVariance,
  computeRiskScore,
  getRiskLevel,
};