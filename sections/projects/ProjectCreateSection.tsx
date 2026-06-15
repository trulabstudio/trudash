import type { Client } from "@/features/clients/types/client.type";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import type { Profile } from "@/features/users/types/user.type";

type ProjectCreateSectionProps = {
  clients: Client[];
  teamMembers: Profile[];
};

export function ProjectCreateSection({ clients, teamMembers }: ProjectCreateSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-semibold text-foreground">New Project</h2>
      <ProjectForm clients={clients} teamMembers={teamMembers} />
    </section>
  );
}
