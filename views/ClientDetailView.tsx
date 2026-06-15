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
        title="Client Organization"
        description="View the company record and linked project work. Client login users are managed from User Accounts."
      />
      <ClientDetailSection client={client} projects={clientProjects} />
    </>
  );
}
