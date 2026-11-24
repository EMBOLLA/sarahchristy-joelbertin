import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { MatchStatus } from "@/server/db/schema";

/** Native select styled like shadcn Input: works in plain server forms, zero JS. */
export function NativeSelect({ className, ...props }: ComponentProps<"select">): ReactNode {
  return (
    <select
      className={cn(
        "h-9 w-full min-w-0 border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Stat({ label, value }: Readonly<{ label: string; value: number | string }>): ReactNode {
  return (
    <div className="border border-gold/60 bg-card p-3 text-center">
      <p className="font-heading text-3xl text-primary tabular-nums">{value}</p>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

const STATUS: Readonly<Record<MatchStatus, { label: string; variant: "default" | "secondary" | "destructive" }>> = {
  matched: { label: "Sur la liste", variant: "default" },
  manual: { label: "Validé", variant: "secondary" },
  unlisted: { label: "Hors liste", variant: "destructive" },
};

export function MatchBadge({ status }: Readonly<{ status: MatchStatus }>): ReactNode {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function AdminCard({ className, ...props }: ComponentProps<"article">): ReactNode {
  return <article className={cn("space-y-3 border bg-card p-4", className)} {...props} />;
}

export function LoadingBlock(): ReactNode {
  return <p className="py-10 text-center text-muted-foreground">Chargement…</p>;
}
