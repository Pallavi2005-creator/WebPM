import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UseProjectRiskQuery,
  UseRecomputeProjectRisk,
} from "@/hooks/use-project";

const levelStyles: Record<string, string> = {
  Low: "bg-green-500/10 text-green-500 border-green-500/20",
  Moderate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export const ProjectHealthCard = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, isError } = UseProjectRiskQuery(projectId);
  const { mutate: recompute, isPending } = UseRecomputeProjectRisk();

  const risk = data as
    | {
        riskScore: number;
        riskLevel: "Low" | "Moderate" | "High" | "Critical";
        aiSummary: string;
        aiRecommendations: string[];
      }
    | undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-muted-foreground" />
          <CardTitle className="text-base font-medium">
            Project Health
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => recompute(projectId)}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : isError || !risk ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              No health data yet for this project.
            </p>
            <Button size="sm" onClick={() => recompute(projectId)} disabled={isPending}>
              {isPending ? "Computing..." : "Compute Now"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full border",
                  levelStyles[risk.riskLevel]
                )}
              >
                {risk.riskLevel} Risk
              </span>
              <span className="text-sm text-muted-foreground">
                Score: {risk.riskScore}/100
              </span>
            </div>

            <p className="text-sm">{risk.aiSummary}</p>

            {risk.aiRecommendations?.length > 0 && (
              <ul className="space-y-1 pt-1">
                {risk.aiRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};