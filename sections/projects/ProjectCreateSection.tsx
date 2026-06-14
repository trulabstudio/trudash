import type { Client } from "@/features/clients/types/client.type";
import { ProjectForm } from "@/features/projects/components/ProjectForm";

type ProjectCreateSectionProps = {
  clients: Client[];
};

export function ProjectCreateSection({ clients }: ProjectCreateSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-semibold text-foreground">New Project</h2>
      <ProjectForm clients={clients} />
    </section>
  );
}
