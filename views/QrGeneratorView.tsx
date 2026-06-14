import { PageHeader } from "@/components/shared/PageHeader";
import { QrGeneratorTool } from "@/features/tools/components/QrGeneratorTool";

export function QrGeneratorView() {
  return (
    <>
      <PageHeader
        title="QR Generator"
        description="Create QR codes for project links, previews, delivery URLs, and client handover assets."
      />
      <QrGeneratorTool />
    </>
  );
}
