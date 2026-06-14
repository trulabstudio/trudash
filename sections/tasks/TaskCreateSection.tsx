import type { Project } from "@/features/projects/types/project.type";
import { TaskCsvImportForm } from "@/features/tasks/components/TaskCsvImportForm";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import type { Profile } from "@/features/users/types/user.type";

type TaskCreateSectionProps = {
  projects: Project[];
  teamMembers: Profile[];
};

export function TaskCreateSection({ projects, teamMembers }: TaskCreateSectionProps) {
  return (
    <section className="mb-6 grid gap-6">
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">New Task</h2>
        <TaskForm projects={projects} teamMembers={teamMembers} />
      </div>
      <TaskCsvImportForm projects={projects} />
    </section>
  );
}
