import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSharedTask } from "@/features/sharing/actions/public-share.action";

export const revalidate = 30;

type SharedTaskPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function SharedTaskPage({ params }: SharedTaskPageProps) {
  const { token } = await params;
  const task = await getSharedTask(token);

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-md border border-border bg-surface p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusBadge tone="success">Completed Task</StatusBadge>
            <h1 className="mt-4 text-2xl font-semibold text-foreground">{task.taskName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {task.projectName} · {task.clientName}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Due: {task.dueDate ?? "Not set"}</p>
        </div>
        {task.description ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground">{task.description}</p>
        ) : null}
        {task.finalLink ? (
          <a
            href={task.finalLink}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Open delivery
          </a>
        ) : null}
      </section>
    </main>
  );
}
