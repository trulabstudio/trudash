import { PageHeader } from "@/components/shared/PageHeader";
import { BackgroundRemoverTool } from "@/features/tools/components/BackgroundRemoverTool";

export function BackgroundRemoverView() {
  return (
    <>
      <PageHeader
        title="Background Remover"
        description="Remove image backgrounds and export clean assets for project delivery work."
      />
      <BackgroundRemoverTool />
    </>
  );
}
