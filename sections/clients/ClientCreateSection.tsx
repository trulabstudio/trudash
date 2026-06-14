import { ClientForm } from "@/features/clients/components/ClientForm";

export function ClientCreateSection() {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-base font-semibold text-foreground">New Client</h2>
      <ClientForm />
    </section>
  );
}
