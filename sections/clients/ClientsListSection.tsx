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
        title="No clients found"
        description="Create the first client record after Supabase is configured and an Admin profile is available."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Login</th>
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
                <td className="px-4 py-3 text-muted-foreground">
                  {client.loginAccess ? "Enabled" : "Disabled"}
                </td>
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
