import mongoose, { Schema } from "mongoose";

const projectRiskSchema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    computedAt: { type: Date, default: Date.now },

    metrics: {
      totalActiveTasks: Number,
      overdueTasks: Number,
      overdueRate: Number,
      staleTasks: Number,
      staleRate: Number,
      workloadDistribution: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User" },
          assignedCount: Number,
          weightedLoad: Number,
          overdueCount: Number,
        },
      ],
      workloadVarianceScore: Number,
    },

    riskScore: { type: Number, min: 0, max: 100 },
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Critical"],
    },
    aiSummary: { type: String },
    aiRecommendations: [{ type: String }],
  },
  { timestamps: true }
);

const ProjectRisk = mongoose.model("ProjectRisk", projectRiskSchema);

export default ProjectRisk;