import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  GitMerge,
  Loader2,
  Play,
  Users,
  XCircle,
} from "lucide-react";
import React from "react";
import {
  useLastAllocation,
  useProjects,
  useRunMatching,
  useStats,
  useStudents,
} from "../hooks/useQueries";

type Tab =
  | "dashboard"
  | "students"
  | "projects"
  | "preferences"
  | "run"
  | "results";

interface DashboardProps {
  onNavigate: (tab: Tab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: lastAllocation } = useLastAllocation();
  const runMatching = useRunMatching();

  const statCards = [
    {
      label: "Total Students",
      value: stats ? Number(stats.totalStudents) : 0,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Projects",
      value: stats ? Number(stats.totalProjects) : 0,
      icon: <FolderOpen className="w-5 h-5" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Matched Pairs",
      value: stats ? Number(stats.matchedCount) : 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Unmatched",
      value: stats ? Number(stats.unmatchedCount) : 0,
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your project allocation system
        </p>
      </div>

      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="dashboard.section"
      >
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="shadow-card border-border"
            data-ocid={`dashboard.${card.label.toLowerCase().replace(/ /g, "_")}.card`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {card.label}
                  </p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-12 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {card.value}
                    </p>
                  )}
                </div>
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}
                >
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Recent Students</span>
                <button
                  type="button"
                  data-ocid="dashboard.students.link"
                  onClick={() => onNavigate("students")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : students && students.length > 0 ? (
                <div className="space-y-1">
                  {students.slice(0, 5).map((s, i) => (
                    <div
                      key={s.id.toString()}
                      data-ocid={`dashboard.student.item.${i + 1}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {s.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {s.name}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        ID: {s.id.toString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="dashboard.students.empty_state"
                  className="text-center py-6 text-muted-foreground text-sm"
                >
                  No students yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Recent Projects</span>
                <button
                  type="button"
                  data-ocid="dashboard.projects.link"
                  onClick={() => onNavigate("projects")}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="space-y-1">
                  {projects.slice(0, 5).map((p, i) => (
                    <div
                      key={p.id.toString()}
                      data-ocid={`dashboard.project.item.${i + 1}`}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                          <FolderOpen className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="dashboard.projects.empty_state"
                  className="text-center py-6 text-muted-foreground text-sm"
                >
                  No projects yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-primary" />
                Run Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Execute the bipartite matching algorithm to optimally assign
                students to their preferred projects.
              </p>
              <Button
                data-ocid="dashboard.run_matching.primary_button"
                onClick={() => runMatching.mutate()}
                disabled={runMatching.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 text-sm"
              >
                {runMatching.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> RUN MATCHING ALGORITHM
                  </>
                )}
              </Button>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Checklist
                </p>
                {[
                  {
                    label: "Students loaded",
                    done: (students?.length ?? 0) > 0,
                  },
                  {
                    label: "Projects loaded",
                    done: (projects?.length ?? 0) > 0,
                  },
                  {
                    label: "Preferences set",
                    done: (stats ? Number(stats.totalStudents) : 0) > 0,
                  },
                  {
                    label: "Last run complete",
                    done:
                      lastAllocation !== null && lastAllocation !== undefined,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    {item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span
                      className={
                        item.done ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {lastAllocation && lastAllocation.matches.length > 0 && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Latest Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lastAllocation.matches.slice(0, 4).map(([sid, pid], i) => (
                    <div
                      key={`${sid}-${pid}`}
                      data-ocid={`dashboard.result.item.${i + 1}`}
                      className="flex items-center gap-2 text-xs py-1.5 px-2 rounded bg-emerald-50 border border-emerald-100"
                    >
                      <span className="font-medium text-foreground">
                        Student {sid.toString()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-emerald-500" />
                      <span className="font-medium text-foreground">
                        Project {pid.toString()}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  data-ocid="dashboard.results.link"
                  onClick={() => onNavigate("results")}
                  className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View full results <ArrowRight className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
