import type { ReactNode } from "react";
import { MapPinIcon } from "lucide-react";
import type { Venue } from "@/config/wedding";
import { buildDirectionsUrl, MAP_PROVIDERS } from "@/lib/wedding/maps";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

type VenueCardProps = Readonly<{ label: string; venue: Venue; openInLabel: string }>;

export function VenueCard({ label, venue, openInLabel }: VenueCardProps): ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="size-4" aria-hidden />
          {venue.name}
        </CardTitle>
        <CardDescription>{venue.address}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
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
      </CardContent>
    </Card>
  );
}
