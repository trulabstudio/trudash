import type { Client } from "@/features/clients/types/client.type";
import { ProfileForm } from "@/features/users/components/ProfileForm";

type ProfileCreateSectionProps = {
  clients: Client[];
};

export function ProfileCreateSection({ clients }: ProfileCreateSectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-foreground">New Login Profile</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Use this for people who sign in. Create client organizations in Client Organizations first, then link Client users here.
        </p>
      </div>
      <ProfileForm clients={clients} />
    </section>
  );
}
