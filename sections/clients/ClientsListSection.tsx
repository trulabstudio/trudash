import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeleteActionForm } from "@/components/shared/DeleteActionForm";
import { accountStatusLabels } from "@/config/status";
import { deleteClientAction } from "@/features/clients/actions/client.action";
import type { Client } from "@/features/clients/types/client.type";

type ClientsListSectionProps = {
  clients: Client[];
  canManage?: boolean;
};

export function ClientsListSection({ clients, canManage = false }: ClientsListSectionProps) {
  if (clients.length === 0) {
    return (
      <EmptyState
        title="No client organizations found"
        description="Create the organization record first, then add Client login users from User Accounts when access is needed."
      />
    );
  }

  return (
    <section>
      <div className="grid gap-4 md:hidden">
        {clients.map((client) => (
          <article key={client.id} className="rounded-md border border-border bg-surface p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-base font-semibold text-foreground hover:text-primary"
                >
                  {client.companyName}
                </Link>
                <p className="mt-1 break-words text-sm text-muted-foreground">{client.email}</p>
              </div>
              <StatusBadge tone={client.accountStatus === "active" ? "success" : "neutral"}>
                {accountStatusLabels[client.accountStatus]}
              </StatusBadge>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="mt-1 font-medium text-foreground">{client.contactPerson ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium text-foreground">{client.phoneNumber ?? "Not set"}</dd>
              </div>
            </dl>
            {canManage ? (
              <div className="mt-4">
                <DeleteActionForm action={deleteClientAction} fieldName="clientId" id={client.id} />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-md border border-border bg-surface shadow-soft md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {canManage ? <th className="px-4 py-3 font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  <Link href={`/dashboard/clients/${client.id}`} className="hover:text-primary">
                    {client.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{client.contactPerson ?? "Not set"}</td>
                <td className="px-4 py-3 text-muted-foreground">{client.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={client.accountStatus === "active" ? "success" : "neutral"}>
                    {accountStatusLabels[client.accountStatus]}
                  </StatusBadge>
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <DeleteActionForm action={deleteClientAction} fieldName="clientId" id={client.id} />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
