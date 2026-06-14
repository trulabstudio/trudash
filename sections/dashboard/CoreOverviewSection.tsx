import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Client } from "@/features/clients/types/client.type";
import type { Project } from "@/features/projects/types/project.type";
import type { Task } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";

type CoreOverviewSectionProps = {
  profile: Profile;
  clients: Client[];
  projects: Project[];
  tasks: Task[];
};

const roleContent = {
  admin: {
    title: "Operations Control Center",
    objective: "Monitor every client account, delivery workload, and project risk from one place.",
    primaryAction: "Create and assign work before delivery progress becomes blocked.",
    badge: "Admin"
  },
  team_member: {
    title: "Assigned Work Queue",
    objective: "Focus on projects and tasks assigned to you, update status, and attach final delivery links when ready.",
    primaryAction: "Review due tasks first, then update status as work moves forward.",
    badge: "Team Member"
  },
  client: {
    title: "Project Delivery Overview",
    objective: "See what is active, what is still being worked on, and which final delivery links are ready.",
    primaryAction: "Access completed delivery links and track remaining tasks for seamless project progress monitoring.",
    badge: "Client"
  }
};

export function CoreOverviewSection({ profile, clients, projects, tasks }: CoreOverviewSectionProps) {
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const openTasks = tasks.filter((task) => task.status !== "completed").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const deliveryLinks = tasks.filter((task) => Boolean(task.finalLink));
  const activeProjects = projects.filter((project) => project.status !== "completed").length;
  const averageProgress =
    projects.length === 0
      ? 0
      : Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length);
  const content = roleContent[profile.role];

  const stats =
    profile.role === "client"
      ? [
          { label: "Active Projects", value: activeProjects, note: `${averageProgress}% average progress` },
          { label: "Open Tasks", value: openTasks, note: "Still in progress or waiting" },
          { label: "Delivery Links", value: deliveryLinks.length, note: "Ready to open" }
        ]
      : profile.role === "team_member"
        ? [
            { label: "Assigned Projects", value: projects.length, note: `${averageProgress}% average progress` },
            { label: "Assigned Tasks", value: tasks.length, note: `${openTasks} still open` },
            { label: "Blocked Tasks", value: blockedTasks, note: "Needs attention" }
          ]
        : [
            { label: "Clients", value: clients.length, note: "Managed accounts" },
            { label: "Projects", value: projects.length, note: `${averageProgress}% average progress` },
            { label: "Tasks", value: tasks.length, note: `${completedTasks} completed` }
          ];
  const attentionTasks = profile.role === "client" ? deliveryLinks : tasks.filter((task) => task.status !== "completed");

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <StatusBadge tone="success">{content.badge}</StatusBadge>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{content.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{content.objective}</p>
          </div>
          <div className="rounded-md border border-border bg-muted p-4 text-sm text-foreground md:max-w-xs">
            <p className="font-semibold">Primary objective</p>
            <p className="mt-2 leading-6 text-muted-foreground">{content.primaryAction}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-md border border-border bg-surface p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">
            {profile.role === "client" ? "Project Progress" : "Delivery Health"}
          </h3>
          <div className="mt-4 space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <Link href={`/dashboard/projects/${project.id}`} className="font-medium text-foreground">
                    {project.projectName}
                  </Link>
                  <span className="text-muted-foreground">{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            ))}
            {projects.length === 0 ? <p className="text-sm text-muted-foreground">No accessible projects yet.</p> : null}
          </div>
        </article>

        <article className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">
            {profile.role === "client" ? "Ready Delivery Links" : "Work Requiring Attention"}
          </h3>
          <div className="mt-4 space-y-3">
            {attentionTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-md border border-border bg-muted p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{task.taskName}</p>
                  <StatusBadge tone={task.status === "completed" ? "success" : "neutral"}>
                    {task.status.replaceAll("_", " ")}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{task.projectName ?? "Project not set"}</p>
                {profile.role === "client" && task.finalLink ? (
                  <a href={task.finalLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary">
                    Open delivery
                  </a>
                ) : null}
              </div>
            ))}
            {attentionTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {profile.role === "client" ? "No delivery links are ready yet." : "No open task requires attention."}
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
