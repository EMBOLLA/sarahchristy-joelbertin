import type { ReactNode } from "react";
import { MapPinIcon } from "lucide-react";
import type { Venue } from "@/config/wedding";
import { buildDirectionsUrl, MAP_PROVIDERS } from "@/lib/wedding/maps";
import { buttonVariants } from "@/components/ui/button";

type VenueCardProps = Readonly<{ label: string; venue: Venue; openInLabel: string }>;

export function VenueCard({ label, venue, openInLabel }: VenueCardProps): ReactNode {
  return (
    <article className="space-y-4 border border-gold/60 bg-card p-5 text-center">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <h3 className="font-script text-3xl text-primary">{venue.name}</h3>
      <p className="flex items-center justify-center gap-2 text-muted-foreground">
        <MapPinIcon className="size-4 shrink-0 text-gold" aria-hidden />
        {venue.address}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MAP_PROVIDERS.map(({ id, label: providerLabel }) => (
          <a
            key={id}
            href={buildDirectionsUrl(id, venue.location)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${openInLabel} ${providerLabel}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {providerLabel}
          </a>
        ))}
      </div>
    </article>
  );
}
