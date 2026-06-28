import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import React from "react";
import {
  useLastAllocation,
  useProjects,
  useStats,
  useStudents,
} from "../hooks/useQueries";

export default function ResultsPage() {
  const { data: allocation, isLoading } = useLastAllocation();
  const { data: students } = useStudents();
  const { data: projects } = useProjects();
  const { data: stats } = useStats();

  const getStudentName = (id: bigint) =>
    students?.find((s) => s.id === id)?.name ?? `Student ${id}`;
  const getProjectName = (id: bigint) =>
    projects?.find((p) => p.id === id)?.name ?? `Project ${id}`;

  const matchCount = allocation?.matches.length ?? 0;
  const unmatchedCount = allocation?.unmatchedStudents.length ?? 0;
  const total = matchCount + unmatchedCount;
  const matchRate = total > 0 ? Math.round((matchCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border">
        <h1 className="text-2xl font-bold text-foreground">
          Allocation Results
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Last saved allocation from the matching algorithm
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !allocation || allocation.matches.length === 0 ? (
        <Card className="shadow-card border-border">
          <CardContent
            data-ocid="results.empty_state"
            className="flex flex-col items-center py-16 text-muted-foreground"
          >
            <Clock className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No allocation results yet</p>
            <p className="text-xs mt-1">
              Run the matching algorithm to generate results
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card border-border">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {Number(stats?.totalStudents ?? 0n)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {Number(stats?.totalProjects ?? 0n)}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border bg-emerald-50 border-emerald-200">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                  Matched
                </p>
                <p className="text-3xl font-bold text-emerald-800 mt-1">
                  {matchCount}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border bg-red-50 border-red-200">
              <CardContent className="p-5">
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Unmatched
                </p>
                <p className="text-3xl font-bold text-red-700 mt-1">
                  {unmatchedCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Match Rate
                </p>
                <span className="text-sm font-bold text-primary">
                  {matchRate}%
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${matchRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {matchCount} out of {total} students successfully matched to a
                project
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Pairs
                  <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
                    {matchCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-xs font-semibold">#</TableHead>
                      <TableHead className="text-xs font-semibold">
                        Student
                      </TableHead>
                      <TableHead className="text-xs font-semibold w-8" />
                      <TableHead className="text-xs font-semibold">
                        Project Assigned
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocation.matches.map(([sid, pid], i) => (
                      <TableRow
                        key={`${sid}-${pid}`}
                        data-ocid={`results.match.item.${i + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {getStudentName(sid).charAt(0)}
                            </div>
                            <span className="font-medium text-sm">
                              {getStudentName(sid)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {getProjectName(pid)}
                            </span>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                              Matched
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Unmatched
                  <Badge className="ml-auto bg-red-100 text-red-600 border-0">
                    {unmatchedCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unmatchedCount === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-medium text-emerald-700">
                      All students matched!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allocation.unmatchedStudents.map((sid, i) => (
                      <div
                        key={sid.toString()}
                        data-ocid={`results.unmatched.item.${i + 1}`}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="text-sm font-medium text-red-800">
                          {getStudentName(sid)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card border-border">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Algorithm Summary
                  </span>
                </div>
                {[
                  {
                    label: "Total Students",
                    value: Number(stats?.totalStudents ?? 0n),
                  },
                  {
                    label: "Total Projects",
                    value: Number(stats?.totalProjects ?? 0n),
                  },
                  {
                    label: "Successful Matches",
                    value: matchCount,
                    highlight: true,
                  },
                  { label: "Unmatched", value: unmatchedCount },
                  {
                    label: "Match Rate",
                    value: `${matchRate}%`,
                    highlight: true,
                  },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p
                      className={`text-lg font-bold ${item.highlight ? "text-primary" : "text-foreground"}`}
                    >
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
