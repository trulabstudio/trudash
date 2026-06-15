import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSharedProject } from "@/features/sharing/actions/public-share.action";

export const revalidate = 30;

type SharedProjectPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedProjectPage({ params }: SharedProjectPageProps) {
  const { token } = await params;
  const project = await getSharedProject(token);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-md border border-border bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <StatusBadge tone="success">Shared Project</StatusBadge>
              <h1 className="mt-4 text-2xl font-semibold text-foreground">{project.projectName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{project.clientName}</p>
            </div>
            <p className="text-sm text-muted-foreground">Due: {project.dueDate ?? "Not set"}</p>
          </div>
          {project.description ? (
            <p className="mt-5 text-sm leading-6 text-muted-foreground">{project.description}</p>
          ) : null}
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-foreground">Completed Tasks</h2>
          <div className="grid gap-4">
            {project.tasks.map((task) => (
              <article key={`${task.taskName}-${task.dueDate}`} className="rounded-md border border-border bg-surface p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{task.taskName}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Due: {task.dueDate ?? "Not set"}</p>
                  </div>
                  <StatusBadge tone="success">Completed</StatusBadge>
                </div>
                {task.description ? (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{task.description}</p>
                ) : null}
                {task.finalLink ? (
                  <a
                    href={task.finalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-sm font-medium text-primary"
                  >
                    Open delivery
                  </a>
                ) : null}
              </article>
            ))}
            {project.tasks.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
                No completed tasks are available yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
