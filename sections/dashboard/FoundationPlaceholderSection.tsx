type FoundationPlaceholderSectionProps = {
  title: string;
};

export function FoundationPlaceholderSection({ title }: FoundationPlaceholderSectionProps) {
  return (
    <section className="rounded-md border border-border bg-surface p-6 shadow-soft">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        This route is reserved by the approved structure. The data model, forms, server actions,
        and permission-aware views can expand here.
      </p>
    </section>
  );
}
