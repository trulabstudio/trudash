import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { USER_ROLES } from "@/config/roles";
import { accountStatusLabels } from "@/config/status";
import { ProfileStatusForm } from "@/features/users/components/ProfileStatusForm";
import type { Profile } from "@/features/users/types/user.type";

type ProfilesListSectionProps = {
  profiles: Profile[];
};

export function ProfilesListSection({ profiles }: ProfilesListSectionProps) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        title="No profiles found"
        description="Create an application profile after creating the matching Supabase Auth user."
      />
    );
  }

  return (
    <section className="grid gap-4">
      {profiles.map((profile) => (
        <article key={profile.id} className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {profile.fullName ?? profile.email}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {profile.userId ? "Auth linked" : "Waiting for first login"}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge tone={profile.accountStatus === "active" ? "success" : "neutral"}>
                {accountStatusLabels[profile.accountStatus]}
              </StatusBadge>
              <StatusBadge>{USER_ROLES[profile.role]}</StatusBadge>
            </div>
          </div>
          <div className="mt-4">
            <ProfileStatusForm profile={profile} />
          </div>
        </article>
      ))}
    </section>
  );
}
