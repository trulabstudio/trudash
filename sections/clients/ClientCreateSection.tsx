import { ClientForm } from "@/features/clients/components/ClientForm";

export function ClientCreateSection() {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-foreground">New Client Organization</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Create the company record here. This does not create a login account.
        </p>
      </div>
      <ClientForm />
    </section>
  );
}
