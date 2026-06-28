import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Project {
    id: bigint;
    name: string;
    description: string;
}
export interface AllocationResult {
    unmatchedStudents: Array<bigint>;
    matches: Array<[bigint, bigint]>;
}
export interface Student {
    id: bigint;
    name: string;
}
export interface backendInterface {
    addProject(id: bigint, name: string, description: string): Promise<boolean>;
    addStudent(id: bigint, name: string): Promise<boolean>;
    allocateProjects(): Promise<AllocationResult>;
    clearAll(): Promise<boolean>;
    deleteProject(id: bigint): Promise<boolean>;
    deleteStudent(id: bigint): Promise<boolean>;
    getLatestAllocation(): Promise<AllocationResult | null>;
    getPreferences(studentId: bigint): Promise<Array<bigint> | null>;
    getProjects(): Promise<Array<Project>>;
    getStats(): Promise<{
        matchedCount: bigint;
        totalStudents: bigint;
        totalProjects: bigint;
        unmatchedCount: bigint;
    }>;
    getStudents(): Promise<Array<Student>>;
    setPreferences(studentId: bigint, projectIds: Array<bigint>): Promise<boolean>;
}
