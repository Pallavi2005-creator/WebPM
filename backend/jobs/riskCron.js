import cron from "node-cron";
import { runRiskScoringForAllProjects } from "../libs/riskJob.js";

function startRiskCron() {
  // Runs daily at 6 AM server time
  cron.schedule("0 6 * * *", () => {
    console.log("⏰ Running scheduled risk scoring...");
    runRiskScoringForAllProjects();
  });
}

export { startRiskCron };