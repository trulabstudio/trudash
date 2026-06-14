type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface p-6 text-sm">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2 leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
