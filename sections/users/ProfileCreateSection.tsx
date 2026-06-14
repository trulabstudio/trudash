import type { Client } from "@/features/clients/types/client.type";
import { ProfileForm } from "@/features/users/components/ProfileForm";

type ProfileCreateSectionProps = {
  clients: Client[];
};

export function ProfileCreateSection({ clients }: ProfileCreateSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-semibold text-foreground">New User Profile</h2>
      <ProfileForm clients={clients} />
    </section>
  );
}
