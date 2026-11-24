import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";

type ScriptHeadingProps = Readonly<
  {
    as?: HeadingLevel;
    /** Gold initial — the signature detail of the invitation. */
    goldInitial?: boolean;
  } & ComponentProps<"h2">
>;

/** Handwritten title. Keep it short: script fonts degrade fast on long lines. */
export function ScriptHeading({
  as: Tag = "h2",
  goldInitial = true,
  className,
  ...props
}: ScriptHeadingProps): ReactNode {
  return (
    <Tag
      className={cn(
        "font-script font-normal leading-[1.15] text-primary",
        goldInitial && "first-letter:text-gold first-letter:text-[1.15em]",
        className,
      )}
      {...props}
    />
  );
}

/** Inline gold accent for a letter or symbol (ampersand, initials). */
export function Gold({ className, ...props }: ComponentProps<"span">): ReactNode {
  return <span className={cn("text-gold", className)} {...props} />;
}

/** Thin gold rule with a central lozenge — section separator. */
export function Ornament({ className }: Readonly<{ className?: string }>): ReactNode {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-gold", className)} aria-hidden>
      <span className="h-px w-16 bg-current opacity-70" />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px w-16 bg-current opacity-70" />
    </div>
  );
}

type SectionProps = Readonly<{ id?: string; title: string; children: ReactNode; className?: string }>;

export function Section({ id, title, children, className }: SectionProps): ReactNode {
  return (
    <section id={id} className={cn("scroll-mt-8 space-y-6 px-5 py-14", className)}>
      <div className="space-y-3 text-center">
        <ScriptHeading className="text-5xl">{title}</ScriptHeading>
        <Ornament />
      </div>
      {children}
    </section>
  );
}
