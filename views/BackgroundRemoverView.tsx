import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { BackgroundRemoverTool } from "@/features/tools/components/BackgroundRemoverTool";
import { TokenTopUpPanel } from "@/features/tools/components/TokenTopUpPanel";
import { getToolSettings } from "@/features/tools/lib/tool-settings";
import { getCurrentProfile } from "@/features/users/actions/user.action";

export async function BackgroundRemoverView() {
  const [profile, toolSettings] = await Promise.all([getCurrentProfile(), getToolSettings()]);
  const description =
    profile?.role === "client"
      ? `Remove image backgrounds and export clean assets. Downloads cost ${toolSettings.backgroundRemoverDownloadCost} token${toolSettings.backgroundRemoverDownloadCost === 1 ? "" : "s"}.`
      : "Remove image backgrounds and export clean assets for project delivery work.";

  return (
    <>
      <PageHeader
        title="Background Remover"
        description={description}
      />
      {profile ? (
        <div className="grid gap-6">
          {profile.role === "client" ? <TokenTopUpPanel tokens={profile.toolTokens} settings={toolSettings} /> : null}
          <BackgroundRemoverTool
            initialTokens={profile.toolTokens}
            role={profile.role}
            downloadCost={toolSettings.backgroundRemoverDownloadCost}
          />
        </div>
      ) : (
        <EmptyState
          title="Login required"
          description="Sign in to use this tool."
        />
      )}
    </>
  );
}
