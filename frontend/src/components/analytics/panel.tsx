import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, description, action, children }: PanelProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
