import { PageHeader } from "@/components/shared/PageHeader";
import { getClientById } from "@/features/clients/actions/client.action";
import { listProjects } from "@/features/projects/actions/project.action";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { ClientDetailSection } from "@/sections/clients/ClientDetailSection";

type ClientDetailViewProps = {
  clientId: string;
};

export async function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const profile = await getCurrentProfile();
  const [client, projects] = await Promise.all([getClientById(clientId, profile), listProjects(profile)]);
  const clientProjects = projects.filter((project) => project.clientId === clientId);

  return (
    <>
      <PageHeader
        title="Client Detail"
        description="View client profile details and linked projects."
      />
      <ClientDetailSection client={client} projects={clientProjects} />
    </>
  );
}
