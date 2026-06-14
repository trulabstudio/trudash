import { ProjectDetailView } from "@/views/ProjectDetailView";

type ProjectDetailPageProps = {
  params: Promise<{
    "project-id": string;
  }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const projectId = (await params)["project-id"];

  return <ProjectDetailView projectId={projectId} />;
}
