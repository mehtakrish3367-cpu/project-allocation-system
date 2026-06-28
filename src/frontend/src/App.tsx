import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  FolderOpen,
  GitMerge,
  Heart,
  LayoutDashboard,
  Network,
  Settings2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "./hooks/useActor";
import {
  useAddProject,
  useAddStudent,
  useProjects,
  useSetPreferences,
  useStudents,
} from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import PreferencesPage from "./pages/PreferencesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ResultsPage from "./pages/ResultsPage";
import RunAlgorithm from "./pages/RunAlgorithm";
import StudentsPage from "./pages/StudentsPage";

type Tab =
  | "dashboard"
  | "students"
  | "projects"
  | "preferences"
  | "run"
  | "results";

const NAV_LINKS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  { id: "students", label: "Students", icon: <Users className="w-4 h-4" /> },
  {
    id: "projects",
    label: "Projects",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: <Settings2 className="w-4 h-4" />,
  },
  { id: "run", label: "Allocation", icon: <GitMerge className="w-4 h-4" /> },
  { id: "results", label: "Results", icon: <BarChart3 className="w-4 h-4" /> },
];

const SAMPLE_STUDENTS = [
  { id: 1n, name: "Alice" },
  { id: 2n, name: "Bob" },
  { id: 3n, name: "Carol" },
  { id: 4n, name: "David" },
  { id: 5n, name: "Eve" },
];

const SAMPLE_PROJECTS = [
  {
    id: 1n,
    name: "Web App",
    description:
      "Build a modern responsive web application with React and TypeScript",
  },
  {
    id: 2n,
    name: "Mobile App",
    description:
      "Develop a cross-platform mobile application using React Native",
  },
  {
    id: 3n,
    name: "Data Analysis",
    description:
      "Perform statistical analysis and visualization on large datasets",
  },
  {
    id: 4n,
    name: "AI Model",
    description:
      "Train and deploy a machine learning model for prediction tasks",
  },
  {
    id: 5n,
    name: "Database Design",
    description:
      "Design and optimize a relational database schema for enterprise use",
  },
];

const SAMPLE_PREFERENCES: Record<string, bigint[]> = {
  "1": [1n, 2n],
  "2": [3n, 4n],
  "3": [1n, 5n],
  "4": [4n, 2n],
  "5": [3n, 1n],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { actor, isFetching } = useActor();
  const { data: students } = useStudents();
  const { data: projects } = useProjects();
  const addStudentMutation = useAddStudent();
  const addProjectMutation = useAddProject();
  const setPreferencesMutation = useSetPreferences();
  const seeded = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time seed
  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;
    if (students === undefined || projects === undefined) return;
    if (students.length > 0 || projects.length > 0) {
      seeded.current = true;
      return;
    }
    seeded.current = true;

    const seed = async () => {
      for (const s of SAMPLE_STUDENTS) {
        await addStudentMutation.mutateAsync({ id: s.id, name: s.name });
      }
      for (const p of SAMPLE_PROJECTS) {
        await addProjectMutation.mutateAsync({
          id: p.id,
          name: p.name,
          description: p.description,
        });
      }
      for (const [sid, pids] of Object.entries(SAMPLE_PREFERENCES)) {
        await setPreferencesMutation.mutateAsync({
          studentId: BigInt(sid),
          projectIds: pids,
        });
      }
    };
    seed();
  }, [actor, isFetching, students, projects]);

  const appHostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "matchpoint";

  const pageMap: Record<Tab, React.ReactNode> = {
    dashboard: <Dashboard onNavigate={setActiveTab} />,
    students: <StudentsPage />,
    projects: <ProjectsPage />,
    preferences: <PreferencesPage />,
    run: <RunAlgorithm onDone={() => setActiveTab("results")} />,
    results: <ResultsPage />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="nav-bg sticky top-0 z-50 h-[60px] flex items-center border-b border-white/10">
        <div className="max-w-[1200px] mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              MatchPoint
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                data-ocid={`nav.${link.id}.link`}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? "bg-primary text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.icon}
                <span className="hidden lg:inline">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.48 0.23 264 / 0.3)",
                border: "1px solid oklch(0.48 0.23 264 / 0.4)",
              }}
            >
              <span className="text-white text-xs font-semibold">AD</span>
            </div>
            <span className="text-white/80 text-sm font-medium hidden xl:inline">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {pageMap[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} MatchPoint · Project Allocation System
          </span>
          <span className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> using
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${appHostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-0.5"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
