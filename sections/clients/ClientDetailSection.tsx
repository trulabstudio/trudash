import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { accountStatusLabels } from "@/config/status";
import type { Client } from "@/features/clients/types/client.type";
import type { Project } from "@/features/projects/types/project.type";
import { ProjectsListSection } from "@/sections/projects/ProjectsListSection";

type ClientDetailSectionProps = {
  client: Client | null;
  projects: Project[];
};

export function ClientDetailSection({ client, projects }: ClientDetailSectionProps) {
  if (!client) {
    return (
      <EmptyState
        title="Client not available"
        description="The client was not found or your role does not have access to this record."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{client.companyName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
          </div>
          <StatusBadge tone={client.accountStatus === "active" ? "success" : "neutral"}>
            {accountStatusLabels[client.accountStatus]}
          </StatusBadge>
        </div>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Contact Person</dt>
            <dd className="mt-1 font-medium text-foreground">{client.contactPerson ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone Number</dt>
            <dd className="mt-1 font-medium text-foreground">{client.phoneNumber ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Login Access</dt>
            <dd className="mt-1 font-medium text-foreground">
              {client.loginAccess ? "Enabled" : "Disabled"}
            </dd>
          </div>
        </dl>
      </div>
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Projects</h2>
        <ProjectsListSection projects={projects} />
      </div>
    </section>
  );
}
