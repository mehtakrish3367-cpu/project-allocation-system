import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AllocationResult, Project, Student } from "../backend.d";
import { useActor } from "./useActor";

export function useStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor)
        return {
          totalStudents: 0n,
          totalProjects: 0n,
          matchedCount: 0n,
          unmatchedCount: 0n,
        };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePreferences(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["preferences", studentId?.toString()],
    queryFn: async () => {
      if (!actor || studentId === null) return [];
      const result = await actor.getPreferences(studentId);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && studentId !== null,
  });
}

export function useLastAllocation() {
  const { actor, isFetching } = useActor();
  return useQuery<AllocationResult | null>({
    queryKey: ["lastAllocation"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestAllocation();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addStudent(id, name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to add student"),
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStudent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to delete student"),
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: { id: bigint; name: string; description: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProject(id, name, description);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to add project"),
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProject(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: () => toast.error("Failed to delete project"),
  });
}

export function useSetPreferences() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      projectIds,
    }: { studentId: bigint; projectIds: bigint[] }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setPreferences(studentId, projectIds);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["preferences", vars.studentId.toString()],
      });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Preferences saved");
    },
    onError: () => toast.error("Failed to save preferences"),
  });
}

export function useRunMatching() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.allocateProjects();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lastAllocation"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Matching algorithm completed!");
    },
    onError: () => toast.error("Matching algorithm failed"),
  });
}

export function useClearAll() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearAll();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("All data cleared");
    },
    onError: () => toast.error("Failed to clear data"),
  });
}
