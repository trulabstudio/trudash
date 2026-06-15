import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { canCreateClients, canManageClients } from "@/lib/permissions/resources";
import { ClientCreateSection } from "@/sections/clients/ClientCreateSection";
import { ClientsListSection } from "@/sections/clients/ClientsListSection";

export async function ClientsView() {
  const profile = await getCurrentProfile();
  const clients = await listClients(profile);

  return (
    <>
      <PageHeader
        title="Client Organizations"
        description="Team Members can create company records here. Only Admin users can create login accounts from User Accounts."
      />
      {canCreateClients(profile) ? <ClientCreateSection /> : null}
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a profile with this user's email in Users. It will link automatically on first login."
        />
      ) : (
        <ClientsListSection clients={clients} canManage={canManageClients(profile)} />
      )}
    </>
  );
}
