import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { getCurrentProfile, listProfiles } from "@/features/users/actions/user.action";
import { isAdmin } from "@/lib/permissions/roles";
import { ProfileCreateSection } from "@/sections/users/ProfileCreateSection";
import { ProfilesListSection } from "@/sections/users/ProfilesListSection";

export async function UsersView() {
  const profile = await getCurrentProfile();
  const [clients, profiles] = await Promise.all([listClients(profile), listProfiles(profile)]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage application profiles, roles, client links, and account status."
      />
      {!isAdmin(profile?.role) ? (
        <EmptyState
          title="Admin access required"
          description="Only Admin profiles can manage application user profiles."
        />
      ) : (
        <>
          <ProfileCreateSection clients={clients} />
          <ProfilesListSection profiles={profiles} />
        </>
      )}
    </>
  );
}
