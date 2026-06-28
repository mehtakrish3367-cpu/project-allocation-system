import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, FolderPlus, Loader2, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddProject,
  useDeleteProject,
  useProjects,
} from "../hooks/useQueries";

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { data: projects, isLoading } = useProjects();
  const addProject = useAddProject();
  const deleteProject = useDeleteProject();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Please enter a project name");
      return;
    }
    const id = BigInt(Date.now());
    await addProject.mutateAsync({
      id,
      name: trimmedName,
      description: description.trim(),
    });
    setName("");
    setDescription("");
    toast.success(`Project "${trimmedName}" added`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage available projects
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {projects?.length ?? 0} projects
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Table */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              Project List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold w-16">
                      ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Description
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right w-24">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p, i) => (
                    <TableRow
                      key={p.id.toString()}
                      data-ocid={`projects.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {p.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                        <span className="line-clamp-2">
                          {p.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-ocid={`projects.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject.mutate(p.id)}
                          disabled={deleteProject.isPending}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div
                data-ocid="projects.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No projects added yet</p>
                <p className="text-xs mt-1">
                  Use the form to add your first project
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Form */}
        <Card className="shadow-card border-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-primary" />
              Add New Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="project-name" className="text-xs font-medium">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  data-ocid="projects.input"
                  placeholder="e.g. Machine Learning Pipeline"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project-desc" className="text-xs font-medium">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="project-desc"
                  data-ocid="projects.textarea"
                  placeholder="Brief description of the project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <Button
                type="submit"
                data-ocid="projects.submit_button"
                disabled={addProject.isPending || !name.trim()}
                className="w-full"
              >
                {addProject.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 mr-2" /> Add Project
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
