import Link from "next/link";

import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Client } from "@/features/clients/types/client.type";
import type { Project, ProjectAssignment } from "@/features/projects/types/project.type";
import type { Task } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";

type CoreOverviewSectionProps = {
  profile: Profile;
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  profiles: Profile[];
  projectAssignments: ProjectAssignment[];
};

const roleContent = {
  admin: {
    title: "Operations Control Center",
    objective: "Monitor every client organization, delivery workload, and project risk from one place.",
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

const urgentWindowDays = 3;

type DueTone = "neutral" | "warning" | "destructive";

function getDateOnly(value: string | null) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDaysUntil(value: string | null, today: Date) {
  const date = getDateOnly(value);

  if (!date) return null;

  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

function getDueTone(daysUntil: number | null): DueTone {
  if (daysUntil === null) return "neutral";
  if (daysUntil < 0) return "destructive";
  if (daysUntil <= urgentWindowDays) return "warning";
  return "neutral";
}

function getDueLabel(daysUntil: number | null) {
  if (daysUntil === null) return "No due date";
  if (daysUntil < 0) return `Overdue ${Math.abs(daysUntil)}d`;
  if (daysUntil === 0) return "Due today";
  if (daysUntil <= urgentWindowDays) return `Urgent ${daysUntil}d`;
  return `Due in ${daysUntil}d`;
}

function getCalendarDays(today: Date) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = firstDay.getDay();

  return {
    label: today.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    days: [
      ...Array.from({ length: leadingDays }, () => null),
      ...Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1))
    ]
  };
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function CoreOverviewSection({
  profile,
  clients,
  projects,
  tasks,
  profiles,
  projectAssignments
}: CoreOverviewSectionProps) {
  const today = getToday();
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const openTasks = tasks.filter((task) => task.status !== "completed").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const openDueTasks = tasks.filter((task) => task.status !== "completed" && task.dueDate);
  const overdueTasks = openDueTasks.filter((task) => {
    const daysUntil = getDaysUntil(task.dueDate, today);
    return daysUntil !== null && daysUntil < 0;
  });
  const urgentTasks = openDueTasks.filter((task) => {
    const daysUntil = getDaysUntil(task.dueDate, today);
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= urgentWindowDays;
  });
  const openDueProjects = projects.filter((project) => project.status !== "completed" && project.dueDate);
  const overdueProjects = openDueProjects.filter((project) => {
    const daysUntil = getDaysUntil(project.dueDate, today);
    return daysUntil !== null && daysUntil < 0;
  });
  const urgentProjects = openDueProjects.filter((project) => {
    const daysUntil = getDaysUntil(project.dueDate, today);
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= urgentWindowDays;
  });
  const riskProjects = projects.filter((project) => {
    if (project.status === "completed") return false;
    const daysUntil = getDaysUntil(project.dueDate, today);
    return daysUntil !== null && daysUntil <= urgentWindowDays;
  });
  const projectRiskSummaries = projects
    .filter((project) => project.status !== "completed")
    .map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id && task.status !== "completed");
      const projectDaysUntil = getDaysUntil(project.dueDate, today);
      const taskDaysUntil = projectTasks
        .map((task) => getDaysUntil(task.dueDate, today))
        .filter((daysUntil): daysUntil is number => daysUntil !== null);
      const hasOverdueTask = taskDaysUntil.some((daysUntil) => daysUntil < 0);
      const hasUrgentTask = taskDaysUntil.some((daysUntil) => daysUntil >= 0 && daysUntil <= urgentWindowDays);
      const isProjectOverdue = projectDaysUntil !== null && projectDaysUntil < 0;
      const isProjectUrgent = projectDaysUntil !== null && projectDaysUntil >= 0 && projectDaysUntil <= urgentWindowDays;
      const overdueTaskCount = taskDaysUntil.filter((daysUntil) => daysUntil < 0).length;
      const urgentTaskCount = taskDaysUntil.filter(
        (daysUntil) => daysUntil >= 0 && daysUntil <= urgentWindowDays
      ).length;
      const tone: DueTone =
        isProjectOverdue || hasOverdueTask ? "destructive" : isProjectUrgent || hasUrgentTask ? "warning" : "neutral";
      const label =
        tone === "destructive"
          ? "Overdue"
          : tone === "warning"
            ? "Urgent"
            : getDueLabel(projectDaysUntil);

      return {
        project,
        tone,
        label,
        projectDaysUntil,
        urgentTaskCount,
        overdueTaskCount
      };
    });
  const projectRiskItems = projectRiskSummaries.filter((item) => item.tone !== "neutral");
  const urgentWorkCount = urgentTasks.length + urgentProjects.length;
  const overdueWorkCount = overdueTasks.length + overdueProjects.length;
  const urgentWorkNote = `${urgentProjects.length} project${urgentProjects.length === 1 ? "" : "s"}, ${urgentTasks.length} task${urgentTasks.length === 1 ? "" : "s"} due within 3 days`;
  const overdueWorkNote = `${overdueProjects.length} project${overdueProjects.length === 1 ? "" : "s"}, ${overdueTasks.length} task${overdueTasks.length === 1 ? "" : "s"} past due`;
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
          { label: "Delivery Links", value: deliveryLinks.length, note: "Ready to open" },
          { label: "Tool Tokens", value: profile.toolTokens, note: "For QR and background downloads" }
        ]
      : profile.role === "team_member"
        ? [
            { label: "Assigned Projects", value: projects.length, note: `${averageProgress}% average progress` },
            { label: "Assigned Tasks", value: tasks.length, note: `${openTasks} still open` },
            { label: "Urgent", value: urgentWorkCount, note: urgentWorkNote },
            { label: "Overdue", value: overdueWorkCount, note: overdueWorkNote }
          ]
        : [
            { label: "Client Orgs", value: clients.length, note: "Managed organizations" },
            { label: "Projects", value: projects.length, note: `${averageProgress}% average progress` },
            { label: "Urgent", value: urgentWorkCount, note: urgentWorkNote },
            { label: "Overdue", value: overdueWorkCount, note: overdueWorkNote }
          ];
  const attentionTasks =
    profile.role === "client"
      ? deliveryLinks
      : [
          ...overdueTasks,
          ...urgentTasks.filter((task) => !overdueTasks.some((overdueTask) => overdueTask.id === task.id)),
          ...tasks.filter(
            (task) =>
              task.status !== "completed" &&
              !overdueTasks.some((overdueTask) => overdueTask.id === task.id) &&
              !urgentTasks.some((urgentTask) => urgentTask.id === task.id)
          )
        ];
  const teamMembers = profiles.filter((item) => item.role === "team_member");
  const teamPerformance = teamMembers
    .map((member) => {
      const assignedProjects = projectAssignments
        .filter((assignment) => assignment.profileId === member.id)
        .map((assignment) => projects.find((project) => project.id === assignment.projectId))
        .filter((project): project is Project => Boolean(project));
      const assignedTasks = tasks.filter((task) => task.assignedToProfileId === member.id);
      const completed = assignedTasks.filter((task) => task.status === "completed");
      const lateCompleted = completed.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = getDateOnly(task.dueDate);
        const updatedAt = new Date(task.updatedAt);
        return Boolean(dueDate) && updatedAt.getTime() > dueDate!.getTime() + 86_399_999;
      });
      const memberOverdue = assignedTasks.filter((task) => {
        if (task.status === "completed") return false;
        const daysUntil = getDaysUntil(task.dueDate, today);
        return daysUntil !== null && daysUntil < 0;
      });
      const memberUrgent = assignedTasks.filter((task) => {
        if (task.status === "completed") return false;
        const daysUntil = getDaysUntil(task.dueDate, today);
        return daysUntil !== null && daysUntil >= 0 && daysUntil <= urgentWindowDays;
      });
      const completionRate =
        assignedTasks.length === 0 ? 0 : Math.round((completed.length / assignedTasks.length) * 100);

      return {
        member,
        assigned: assignedTasks.length,
        completed: completed.length,
        completionRate,
        urgent: memberUrgent.length,
        overdue: memberOverdue.length,
        lateCompleted: lateCompleted.length
        ,
        assignedProjects,
        assignedTasks
      };
    })
    .sort((a, b) => b.overdue - a.overdue || b.urgent - a.urgent || b.assigned - a.assigned);
  const calendar = getCalendarDays(today);
  const calendarEvents = [
    ...projects
      .filter((project) => project.dueDate)
      .map((project) => ({
        id: `project-${project.id}`,
        date: project.dueDate!,
        type: "Project",
        label: project.projectName,
        href: `/dashboard/projects/${project.id}`,
        tone: getDueTone(getDaysUntil(project.dueDate, today))
      })),
    ...tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        id: `task-${task.id}`,
        date: task.dueDate!,
        type: "Task",
        label: task.taskName,
        href: `/dashboard/tasks`,
        tone: getDueTone(getDaysUntil(task.dueDate, today))
      }))
  ];
  const eventsByDate = new Map<string, typeof calendarEvents>();

  calendarEvents.forEach((event) => {
    eventsByDate.set(event.date, [...(eventsByDate.get(event.date) ?? []), event]);
  });

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`rounded-md border p-5 shadow-soft ${
              stat.label === "Overdue" && Number(stat.value) > 0
                ? "border-destructive/30 bg-destructive/10"
                : stat.label === "Urgent" && Number(stat.value) > 0
                  ? "border-accent/40 bg-accent/15"
                  : "border-border bg-surface"
            }`}
          >
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
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                      tone={
                        projectRiskSummaries.find((item) => item.project.id === project.id)?.tone ??
                        getDueTone(getDaysUntil(project.dueDate, today))
                      }
                    >
                      {projectRiskSummaries.find((item) => item.project.id === project.id)?.label ??
                        getDueLabel(getDaysUntil(project.dueDate, today))}
                    </StatusBadge>
                    <span className="text-muted-foreground">{project.progress}%</span>
                  </div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${
                      projectRiskSummaries.find((item) => item.project.id === project.id)?.tone === "destructive"
                        ? "bg-destructive"
                        : riskProjects.some((riskProject) => riskProject.id === project.id) ||
                            projectRiskSummaries.find((item) => item.project.id === project.id)?.tone === "warning"
                          ? "bg-accent"
                          : "bg-primary"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {projects.length === 0 ? <p className="text-sm text-muted-foreground">No accessible projects yet.</p> : null}
          </div>
        </article>

        {profile.role !== "client" ? (
          <article className="rounded-md border border-border bg-surface p-5 shadow-soft">
            <h3 className="text-base font-semibold text-foreground">Project Deadline Risk</h3>
            <p className="mt-1 text-sm text-muted-foreground">Project due dates plus urgent/overdue tasks inside each project.</p>
            <div className="mt-4 space-y-3">
              {projectRiskItems.slice(0, 5).map((item) => {
                return (
                  <div
                    key={item.project.id}
                    className={`rounded-md border p-3 ${
                      item.tone === "destructive"
                        ? "border-destructive/30 bg-destructive/10"
                        : "border-accent/40 bg-accent/15"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/projects/${item.project.id}`}
                        className="text-sm font-medium text-foreground hover:text-primary"
                      >
                        {item.project.projectName}
                      </Link>
                      <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.project.clientName ?? "Client not set"} · {item.project.progress}% progress
                      {item.projectDaysUntil !== null ? ` · Project ${getDueLabel(item.projectDaysUntil).toLowerCase()}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.overdueTaskCount} overdue task{item.overdueTaskCount === 1 ? "" : "s"} · {item.urgentTaskCount} urgent task{item.urgentTaskCount === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
              {projectRiskItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No project or child task deadline risk in the next 3 days.
                </p>
              ) : null}
            </div>
          </article>
        ) : null}

        <article className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <h3 className="text-base font-semibold text-foreground">
            {profile.role === "client" ? "Ready Delivery Links" : "Work Requiring Attention"}
          </h3>
          <div className="mt-4 space-y-3">
            {attentionTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-md border border-border bg-muted p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{task.taskName}</p>
                  <StatusBadge
                    tone={
                      task.status === "completed"
                        ? "success"
                        : getDueTone(getDaysUntil(task.dueDate, today))
                    }
                  >
                    {task.status === "completed"
                      ? task.status.replaceAll("_", " ")
                      : getDueLabel(getDaysUntil(task.dueDate, today))}
                  </StatusBadge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.projectName ?? "Project not set"} {task.dueDate ? `· Due ${task.dueDate}` : ""}
                </p>
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

      {profile.role !== "client" ? (
        <section className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Due Date Calendar</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Project and task due dates for {calendar.label}.
              </p>
            </div>
            <StatusBadge tone={overdueWorkCount > 0 ? "destructive" : urgentWorkCount > 0 ? "warning" : "success"}>
              {overdueWorkCount > 0 ? "Overdue work" : urgentWorkCount > 0 ? "Urgent work" : "On track"}
            </StatusBadge>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-2 font-medium">{day}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendar.days.map((day, index) => {
              const dateKey = day ? formatDateKey(day) : `blank-${index}`;
              const events = day ? eventsByDate.get(dateKey) ?? [] : [];

              return (
                <div
                  key={dateKey}
                  className={`min-h-28 rounded-md border p-2 ${
                    day ? "border-border bg-muted" : "border-transparent"
                  }`}
                >
                  {day ? (
                    <>
                      <p className="text-xs font-medium text-foreground">{day.getDate()}</p>
                      <div className="mt-2 space-y-1">
                        {events.slice(0, 3).map((event) => (
                          <Link
                            key={event.id}
                            href={event.href}
                            className={`block truncate rounded-sm border px-1.5 py-1 text-[11px] font-medium ${
                              event.tone === "destructive"
                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                : event.tone === "warning"
                                  ? "border-accent/40 bg-accent/15 text-accent-foreground"
                                  : "border-border bg-surface text-foreground"
                            }`}
                            title={`${event.type}: ${event.label}`}
                          >
                            {event.type}: {event.label}
                          </Link>
                        ))}
                        {events.length > 3 ? (
                          <p className="text-[11px] text-muted-foreground">+{events.length - 3} more</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {profile.role === "admin" ? (
        <section className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Team Member Performance</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Completed timing is estimated from the last task update date.
              </p>
            </div>
            <StatusBadge tone={overdueTasks.length > 0 ? "destructive" : "success"}>
              {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : "On track"}
            </StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {teamPerformance.map((item) => (
              <details
                key={item.member.id}
                className={`rounded-md border p-4 ${
                  item.overdue > 0
                    ? "border-destructive/30 bg-destructive/10"
                    : item.urgent > 0
                      ? "border-accent/40 bg-accent/15"
                      : "border-border bg-muted"
                }`}
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.member.fullName ?? item.member.email}</p>
                    <p className="mt-1 break-words text-xs text-muted-foreground">{item.member.email}</p>
                  </div>
                  <StatusBadge tone={item.overdue > 0 ? "destructive" : item.urgent > 0 ? "warning" : "success"}>
                    {item.overdue > 0 ? "Overdue" : item.urgent > 0 ? "Urgent" : "Healthy"}
                  </StatusBadge>
                  </div>
                </summary>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-5">
                  <Metric label="Assigned" value={item.assigned} />
                  <Metric label="Completed" value={item.completed} />
                  <Metric label="Completion" value={`${item.completionRate}%`} />
                  <Metric label="Urgent" value={item.urgent} />
                  <Metric label="Late" value={item.overdue + item.lateCompleted} />
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Assigned Projects</p>
                    <div className="mt-2 grid gap-2">
                      {item.assignedProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/dashboard/projects/${project.id}`}
                          className="rounded-md border border-border bg-surface p-3 text-sm hover:border-primary/40"
                        >
                          <span className="block font-medium text-foreground">{project.projectName}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {project.clientName ?? "Client not set"} · {project.progress}% progress
                          </span>
                        </Link>
                      ))}
                      {item.assignedProjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assigned projects.</p>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Assigned Tasks</p>
                    <div className="mt-2 grid gap-2">
                      {item.assignedTasks.slice(0, 6).map((task) => (
                        <div key={task.id} className="rounded-md border border-border bg-surface p-3 text-sm">
                          <p className="font-medium text-foreground">{task.taskName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {task.projectName ?? "Project not set"} {task.dueDate ? `· Due ${task.dueDate}` : ""}
                          </p>
                        </div>
                      ))}
                      {item.assignedTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assigned tasks.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </details>
            ))}
            {teamPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No team member task data yet.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
