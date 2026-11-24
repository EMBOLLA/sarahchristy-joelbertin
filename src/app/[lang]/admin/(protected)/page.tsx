import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangleIcon, FileTextIcon, ScanLineIcon } from "lucide-react";
import { requireAdminPage } from "@/server/auth/guard";
import { getLocale } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { getTicketStats, listTicketViews, type TicketView } from "@/server/tickets/service";
import { listGuests, type GuestWithTicket } from "@/server/guests/service";
import {
  deleteTicketAction,
  linkTicketAction,
  promoteTicketAction,
  setCheckedInAction,
} from "@/server/actions/admin";
import { AdminCard, LoadingBlock, MatchBadge, NativeSelect, Stat } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = {
  all: "Tous",
  unlisted: "Hors liste",
  pending: "Pas encore entrés",
  in: "Entrés",
} as const;
type Filter = keyof typeof FILTERS;

function isFilter(value: unknown): value is Filter {
  return typeof value === "string" && value in FILTERS;
}

function applyFilter(views: ReadonlyArray<TicketView>, filter: Filter): ReadonlyArray<TicketView> {
  switch (filter) {
    case "all":
      return views;
    case "unlisted":
      return views.filter((v) => v.ticket.matchStatus === "unlisted");
    case "pending":
      return views.filter((v) => v.ticket.checkedInAt === null);
    case "in":
      return views.filter((v) => v.ticket.checkedInAt !== null);
  }
}

const timeFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Paris" });

type TicketCardProps = Readonly<{ view: TicketView; guests: ReadonlyArray<GuestWithTicket>; locale: Locale }>;

function TicketCard({ view, guests, locale }: TicketCardProps): ReactNode {
  const { ticket, tableNumber, typeMismatch } = view;
  const names = [ticket.primaryName, ticket.partnerName].filter(Boolean).join(" & ");

  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-lg">{names}</p>
          <p className="text-xs text-muted-foreground">
            Réf. {ticket.publicCode.slice(0, 8)} · {timeFormat.format(ticket.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">{ticket.ticketType === "couple" ? "Couple" : "Solo"}</Badge>
          <MatchBadge status={ticket.matchStatus} />
          <Badge variant="outline">{tableNumber === null ? "Sans table" : `Table ${tableNumber}`}</Badge>
        </div>
      </div>

      {typeMismatch && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangleIcon className="size-4" aria-hidden />
          Billet {ticket.ticketType} alors que l&apos;invité est listé {view.guest?.ticketType}.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={setCheckedInAction.bind(null, ticket.publicCode, ticket.checkedInAt === null)}>
          <ConfirmSubmit size="sm" variant={ticket.checkedInAt === null ? "default" : "outline"}>
            {ticket.checkedInAt === null ? "Valider l'entrée" : `Entré ${timeFormat.format(ticket.checkedInAt)} · annuler`}
          </ConfirmSubmit>
        </form>
        <Link href={`/${locale}/check/${ticket.publicCode}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ScanLineIcon aria-hidden /> Fiche
        </Link>
        <a
          href={`/api/tickets/${ticket.publicCode}/pdf?inline=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <FileTextIcon aria-hidden /> PDF
        </a>
      </div>

      {ticket.matchStatus === "unlisted" && (
        <div className="space-y-2 border-t pt-3">
          <form action={promoteTicketAction.bind(null, ticket.id)}>
            <ConfirmSubmit size="sm" variant="secondary">
              Ajouter à la liste des invités
            </ConfirmSubmit>
          </form>
          <form action={linkTicketAction.bind(null, ticket.id)} className="flex gap-2">
            <NativeSelect name="guestId" defaultValue="" aria-label="Associer à un invité existant">
              <option value="" disabled>
                Associer à un invité existant…
              </option>
              {guests.map((guest) => (
                <option key={guest.id} value={guest.id}>
                  {guest.displayName}
                  {guest.partnerName ? ` & ${guest.partnerName}` : ""}
                  {guest.hasTicket ? " (a déjà un billet)" : ""}
                </option>
              ))}
            </NativeSelect>
            <ConfirmSubmit size="sm" variant="outline">
              Associer
            </ConfirmSubmit>
          </form>
        </div>
      )}

      <form action={deleteTicketAction.bind(null, ticket.id)} className="text-right">
        <ConfirmSubmit size="xs" variant="ghost" confirmMessage={`Supprimer le billet de ${names} ?`}>
          Supprimer
        </ConfirmSubmit>
      </form>
    </AdminCard>
  );
}

async function TicketsContent({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>): Promise<ReactNode> {
  await requireAdminPage();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = isFilter(rawFilter) ? rawFilter : "all";
  const [stats, views, guests, locale] = await Promise.all([getTicketStats(), listTicketViews(), listGuests(), getLocale()]);
  const visible = applyFilter(views, filter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="Billets" value={stats.tickets} />
        <Stat label="Personnes" value={stats.people} />
        <Stat label="Sur la liste" value={stats.matched} />
        <Stat label="Hors liste" value={stats.unlisted} />
        <Stat label="Entrés (pers.)" value={stats.checkedInPeople} />
      </div>

      <nav className="flex flex-wrap gap-1" aria-label="Filtrer">
        {(Object.keys(FILTERS) as Filter[]).map((key) => (
          <Link
            key={key}
            href={key === "all" ? "?" : `?filter=${key}`}
            className={cn(buttonVariants({ size: "sm", variant: key === filter ? "default" : "ghost" }))}
          >
            {FILTERS[key]}
          </Link>
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Aucun billet.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((view) => (
            <TicketCard key={view.ticket.id} view={view} guests={guests} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage({ searchParams }: PageProps<"/[lang]/admin">): ReactNode {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <TicketsContent searchParams={searchParams} />
    </Suspense>
  );
}
