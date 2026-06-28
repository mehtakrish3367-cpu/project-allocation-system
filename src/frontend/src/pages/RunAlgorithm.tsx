import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  GitMerge,
  Loader2,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import type { AllocationResult } from "../backend.d";
import {
  useClearAll,
  useProjects,
  useRunMatching,
  useStats,
  useStudents,
} from "../hooks/useQueries";

interface RunAlgorithmProps {
  onDone: () => void;
}

export default function RunAlgorithm({ onDone }: RunAlgorithmProps) {
  const [result, setResult] = useState<AllocationResult | null>(null);
  const runMatching = useRunMatching();
  const clearAll = useClearAll();
  const { data: students } = useStudents();
  const { data: projects } = useProjects();
  const { data: stats } = useStats();

  const getStudentName = (id: bigint) =>
    students?.find((s) => s.id === id)?.name ?? `Student ${id}`;
  const getProjectName = (id: bigint) =>
    projects?.find((p) => p.id === id)?.name ?? `Project ${id}`;

  const handleRun = async () => {
    const res = await runMatching.mutateAsync();
    setResult(res);
  };

  const handleClear = () => {
    clearAll.mutate();
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border">
        <h1 className="text-2xl font-bold text-foreground">
          Run Allocation Algorithm
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Execute bipartite matching to optimally assign students to projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-primary" />
              Bipartite Matching Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-muted/60 rounded-xl p-5">
              <p className="text-sm text-foreground font-medium mb-2">
                How it works
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The algorithm uses <strong>maximum bipartite matching</strong>{" "}
                (augmenting paths via DFS) to assign each student to exactly one
                project based on their stated preferences. Students are matched
                to available projects, maximizing the total number of successful
                assignments.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Students",
                  value: students?.length ?? 0,
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  label: "Projects",
                  value: projects?.length ?? 0,
                  color: "text-violet-600 bg-violet-50",
                },
                {
                  label: "Pref. Sets",
                  value: Number(stats?.totalStudents ?? 0n),
                  color: "text-amber-600 bg-amber-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg p-3 ${item.color}`}
                >
                  <p className="text-xs font-medium opacity-75">{item.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <Button
              data-ocid="run.primary_button"
              onClick={handleRun}
              disabled={runMatching.isPending}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base py-6"
            >
              {runMatching.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Running
                  Algorithm...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> RUN BIPARTITE MATCHING
                </>
              )}
            </Button>

            {runMatching.isPending && (
              <div
                data-ocid="run.loading_state"
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing preference graph...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result && (
              <Button
                data-ocid="run.view_results.secondary_button"
                variant="outline"
                className="w-full"
                onClick={onDone}
              >
                <ArrowRight className="w-4 h-4 mr-2" /> View Full Results
              </Button>
            )}
            <Button
              data-ocid="run.clear.delete_button"
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
              onClick={handleClear}
              disabled={clearAll.isPending}
            >
              {clearAll.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Clearing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" /> Clear All Data
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Clears all students, projects and preferences
            </p>
          </CardContent>
        </Card>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
          data-ocid="run.success_state"
        >
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-card border-border bg-emerald-50 border-emerald-200">
              <CardContent className="p-5 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Matched
                  </p>
                  <p className="text-3xl font-bold text-emerald-800">
                    {result.matches.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border bg-red-50 border-red-200">
              <CardContent className="p-5 flex items-center gap-4">
                <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-600">Unmatched</p>
                  <p className="text-3xl font-bold text-red-700">
                    {result.unmatchedStudents.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.matches.length > 0 && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Matched Pairs</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {result.matches.length} matches
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
                        Project
                      </TableHead>
                      <TableHead className="text-xs font-semibold">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.matches.map(([sid, pid], i) => (
                      <TableRow
                        key={`${sid}-${pid}`}
                        data-ocid={`run.match.item.${i + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {getStudentName(sid)}
                        </TableCell>
                        <TableCell>
                          <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {getProjectName(pid)}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                            Matched
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {result.unmatchedStudents.length > 0 && (
            <Card className="shadow-card border-border border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" /> Unmatched Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.unmatchedStudents.map((sid, i) => (
                    <Badge
                      key={sid.toString()}
                      data-ocid={`run.unmatched.item.${i + 1}`}
                      variant="destructive"
                      className="text-xs"
                    >
                      {getStudentName(sid)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
