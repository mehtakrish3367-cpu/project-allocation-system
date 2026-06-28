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
import { Loader2, Trash2, UserPlus, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddStudent,
  useDeleteStudent,
  useStudents,
} from "../hooks/useQueries";

export default function StudentsPage() {
  const [name, setName] = useState("");
  const { data: students, isLoading } = useStudents();
  const addStudent = useAddStudent();
  const deleteStudent = useDeleteStudent();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a student name");
      return;
    }
    const id = BigInt(Date.now());
    await addStudent.mutateAsync({ id, name: trimmed });
    setName("");
    toast.success(`Student "${trimmed}" added`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl px-6 py-5 shadow-card border border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage enrolled students
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {students?.length ?? 0} students
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* Table */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Student List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold w-16">
                      ID
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right w-24">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s, i) => (
                    <TableRow
                      key={s.id.toString()}
                      data-ocid={`students.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {s.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          data-ocid={`students.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStudent.mutate(s.id)}
                          disabled={deleteStudent.isPending}
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
                data-ocid="students.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No students added yet</p>
                <p className="text-xs mt-1">
                  Use the form to add your first student
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Form */}
        <Card className="shadow-card border-border h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Add New Student
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="student-name" className="text-xs font-medium">
                  Student Name
                </Label>
                <Input
                  id="student-name"
                  data-ocid="students.input"
                  placeholder="e.g. John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button
                type="submit"
                data-ocid="students.submit_button"
                disabled={addStudent.isPending || !name.trim()}
                className="w-full"
              >
                {addStudent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Add Student
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
