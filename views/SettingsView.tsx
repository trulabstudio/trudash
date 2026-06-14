import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { AccountSettingsForm } from "@/features/users/components/AccountSettingsForm";
import { getCurrentProfile } from "@/features/users/actions/user.action";

export async function SettingsView() {
  const profile = await getCurrentProfile();

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Update your display name and password for your TRUDASH account."
      />
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a matching user profile before updating account settings."
        />
      ) : (
        <AccountSettingsForm profile={profile} />
      )}
    </>
  );
}
