import express from "express";
import authMiddleware from "../middleware/auth-middleware.js"; // adjust path/name to match yours
import ProjectRisk from "../models/projectRisk.js";
import { runRiskScoringForProject } from "../libs/riskJob.js";

const router = express.Router();

router.get("/:projectId/latest", authMiddleware, async (req, res) => {
  try {
    const latest = await ProjectRisk.findOne({ project: req.params.projectId })
      .sort({ computedAt: -1 });
    if (!latest) {
      return res.status(404).json({ message: "No risk data yet for this project" });
    }
    res.status(200).json(latest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:projectId/history", authMiddleware, async (req, res) => {
  try {
    const history = await ProjectRisk.find({ project: req.params.projectId })
      .sort({ computedAt: 1 })
      .limit(30);
    res.status(200).json(history);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:projectId/recompute", authMiddleware, async (req, res) => {
  try {
    const snapshot = await runRiskScoringForProject(req.params.projectId);
    res.status(200).json(snapshot);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;