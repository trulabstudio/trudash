import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { USER_ROLES } from "@/config/roles";
import { accountStatusLabels } from "@/config/status";
import { ProfileStatusForm } from "@/features/users/components/ProfileStatusForm";
import type { Profile } from "@/features/users/types/user.type";
import type { Client } from "@/features/clients/types/client.type";

type ProfilesListSectionProps = {
  profiles: Profile[];
  clients: Client[];
};

export function ProfilesListSection({ profiles, clients }: ProfilesListSectionProps) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        title="No profiles found"
        description="Create login profiles for internal users, or create a client organization first before adding a Client user."
      />
    );
  }

  const clientNameById = new Map(clients.map((client) => [client.id, client.companyName]));

  return (
    <section className="grid gap-4">
      {profiles.map((profile) => {
        const linkedClientName = profile.clientId ? clientNameById.get(profile.clientId) : null;

        return (
          <article key={profile.id} className="rounded-md border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground">
                  {profile.fullName ?? profile.email}
                </h2>
                <p className="mt-1 break-words text-sm text-muted-foreground">{profile.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profile.userId ? "Auth linked" : "Waiting for first login"}
                </p>
              {profile.role === "client" ? (
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    <p>Linked organization: {linkedClientName ?? "Missing client link"}</p>
                    <p>
                      Downloads: {profile.qrDownloadCount} QR, {profile.backgroundRemovalDownloadCount} background remover
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={profile.accountStatus === "active" ? "success" : "neutral"}>
                  {accountStatusLabels[profile.accountStatus]}
                </StatusBadge>
                <StatusBadge>{USER_ROLES[profile.role]}</StatusBadge>
                {profile.role === "client" ? <StatusBadge tone="warning">{profile.toolTokens} tokens</StatusBadge> : null}
              </div>
            </div>
            <details className="mt-4 rounded-md border border-border bg-muted p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Manage user
              </summary>
              <div className="mt-4">
                <ProfileStatusForm profile={profile} clients={clients} />
              </div>
            </details>
          </article>
        );
      })}
    </section>
  );
}
