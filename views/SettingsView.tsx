import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { ToolSettingsForm } from "@/features/tools/components/ToolSettingsForm";
import { getToolSettings } from "@/features/tools/lib/tool-settings";
import { AccountSettingsForm } from "@/features/users/components/AccountSettingsForm";
import { getCurrentProfile } from "@/features/users/actions/user.action";

export async function SettingsView() {
  const profile = await getCurrentProfile();
  const toolSettings = profile?.role === "admin" ? await getToolSettings() : null;

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
        <div className="grid gap-6">
          <AccountSettingsForm profile={profile} />
          {toolSettings ? <ToolSettingsForm settings={toolSettings} /> : null}
        </div>
      )}
    </>
  );
}
