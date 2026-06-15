import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { QrGeneratorTool } from "@/features/tools/components/QrGeneratorTool";
import { TokenTopUpPanel } from "@/features/tools/components/TokenTopUpPanel";
import { getToolSettings } from "@/features/tools/lib/tool-settings";
import { getCurrentProfile } from "@/features/users/actions/user.action";

export async function QrGeneratorView() {
  const [profile, toolSettings] = await Promise.all([getCurrentProfile(), getToolSettings()]);
  const description =
    profile?.role === "client"
      ? `Create QR codes for project links. Downloads cost ${toolSettings.qrDownloadCost} token${toolSettings.qrDownloadCost === 1 ? "" : "s"}.`
      : "Create QR codes for project links, previews, delivery URLs, and handover assets.";

  return (
    <>
      <PageHeader
        title="QR Generator"
        description={description}
      />
      {profile ? (
        <div className="grid gap-6">
          {profile.role === "client" ? <TokenTopUpPanel tokens={profile.toolTokens} settings={toolSettings} /> : null}
          <QrGeneratorTool
            initialTokens={profile.toolTokens}
            role={profile.role}
            downloadCost={toolSettings.qrDownloadCost}
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
