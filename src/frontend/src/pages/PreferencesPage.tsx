import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Loader2, Settings2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  usePreferences,
  useProjects,
  useSetPreferences,
  useStudents,
} from "../hooks/useQueries";

interface StudentPrefsProps {
  studentId: bigint;
  studentName: string;
  studentIndex: number;
}

function StudentPrefsRow({
  studentId,
  studentName,
  studentIndex,
}: StudentPrefsProps) {
  const [open, setOpen] = useState(studentIndex === 0);
  const { data: projects } = useProjects();
  const { data: savedPrefs, isLoading } = usePreferences(studentId);
  const setPrefs = useSetPreferences();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (savedPrefs) {
      setSelected(new Set(savedPrefs.map((id) => id.toString())));
    }
  }, [savedPrefs]);

  const toggle = (projectId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const handleSave = () => {
    const projectIds = Array.from(selected).map((id) => BigInt(id));
    setPrefs.mutate({ studentId, projectIds });
  };

  return (
    <div
      className="bg-card border border-border rounded-xl shadow-card overflow-hidden"
      data-ocid={`preferences.student.item.${studentIndex + 1}`}
    >
      <button
        type="button"
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
            {studentName.charAt(0)}
          </div>
          <span className="font-semibold text-sm text-foreground">
            {studentName}
          </span>
          {savedPrefs && savedPrefs.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {savedPrefs.length} preference{savedPrefs.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border px-5 pt-4 pb-5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-7 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-3">
                Select projects this student prefers:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {projects?.map((project, pi) => (
                  <button
                    key={project.id.toString()}
                    type="button"
                    data-ocid={`preferences.project.checkbox.${pi + 1}`}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors text-left w-full ${
                      selected.has(project.id.toString())
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                    onClick={() => toggle(project.id.toString())}
                  >
                    <Checkbox
                      id={`${studentId}-${project.id}`}
                      checked={selected.has(project.id.toString())}
                      onCheckedChange={() => toggle(project.id.toString())}
                      className="mt-0.5 pointer-events-none"
                    />
                    <div>
                      <Label
                        htmlFor={`${studentId}-${project.id}`}
                        className="text-xs font-semibold pointer-events-none"
                      >
                        {project.name}
                      </Label>
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {selected.size} project{selected.size !== 1 ? "s" : ""}{" "}
                  selected
                </span>
                <Button
                  data-ocid={`preferences.save_button.${studentIndex + 1}`}
                  size="sm"
                  onClick={handleSave}
                  disabled={setPrefs.isPending}
                >
                  {setPrefs.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PreferencesPage() {
  const { data: students, isLoading } = useStudents();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border">
        <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Set which projects each student prefers
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : students && students.length > 0 ? (
        <div className="space-y-3">
          {students.map((s, i) => (
            <StudentPrefsRow
              key={s.id.toString()}
              studentId={s.id}
              studentName={s.name}
              studentIndex={i}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-card">
          <div
            data-ocid="preferences.empty_state"
            className="flex flex-col items-center py-16 text-muted-foreground"
          >
            <Settings2 className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No students found</p>
            <p className="text-xs mt-1">
              Add students first to set their preferences
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
