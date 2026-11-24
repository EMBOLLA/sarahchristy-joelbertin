import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangleIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { findTicketView, type TicketView } from "@/server/tickets/service";
import { isAdmin } from "@/server/auth/session";
import { setCheckedInAction } from "@/server/actions/admin";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { MatchBadge, LoadingBlock } from "@/components/admin/ui";
import { Gold, Ornament } from "@/components/typography";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const timeFormat = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short", timeZone: "Europe/Paris" });

function Names({ view }: Readonly<{ view: TicketView }>): ReactNode {
  return (
    <p className="font-script text-4xl text-primary">
      {view.ticket.primaryName}
      {view.ticket.partnerName && (
        <>
          <Gold> & </Gold>
          {view.ticket.partnerName}
        </>
      )}
    </p>
  );
}

/** What the protocol sees at the door: one glance → let in, check, or stop. */
function ProtocolView({ view }: Readonly<{ view: TicketView }>): ReactNode {
  const { ticket, tableNumber, typeMismatch } = view;
  const alreadyIn = ticket.checkedInAt !== null;
  const tone = alreadyIn ? "border-destructive" : ticket.matchStatus === "unlisted" ? "border-amber-500" : "border-emerald-600";

  return (
    <div className={cn("space-y-5 border-4 bg-card p-6 text-center", tone)}>
      {alreadyIn ? (
        <p className="flex items-center justify-center gap-2 text-xl font-semibold text-destructive">
          <XCircleIcon aria-hidden /> Déjà entré à {timeFormat.format(ticket.checkedInAt ?? new Date())}
        </p>
      ) : (
        <p className="flex items-center justify-center gap-2 text-xl font-semibold text-emerald-700">
          <CheckCircle2Icon aria-hidden /> Pas encore entré
        </p>
      )}
      <Names view={view} />
      <div className="flex flex-wrap justify-center gap-2">
        <MatchBadge status={ticket.matchStatus} />
      </div>
      <p className="text-lg">{ticket.ticketType === "couple" ? "Couple · 2 personnes" : "Solo · 1 personne"}</p>
      <p className="font-heading text-5xl text-primary">{tableNumber === null ? "Sans table" : `Table ${tableNumber}`}</p>
      {typeMismatch && (
        <p className="flex items-center justify-center gap-2 text-destructive">
          <AlertTriangleIcon className="size-4" aria-hidden /> Listé « {view.guest?.ticketType} » sur la liste
        </p>
      )}
      <form action={setCheckedInAction.bind(null, ticket.publicCode, !alreadyIn)}>
        <ConfirmSubmit
          size="lg"
          className="h-14 w-full text-lg"
          variant={alreadyIn ? "outline" : "default"}
          confirmMessage={alreadyIn ? "Annuler l'entrée ?" : undefined}
        >
          {alreadyIn ? "Annuler l'entrée" : "Valider l'entrée"}
        </ConfirmSubmit>
      </form>
    </div>
  );
}

function GuestView({ view, labels }: Readonly<{ view: TicketView; labels: Dictionary["check"] }>): ReactNode {
  return (
    <div className="space-y-4 border border-gold bg-card p-6 text-center">
      <p className="flex items-center justify-center gap-2 text-lg">
        <CheckCircle2Icon className="text-gold" aria-hidden /> {labels.valid}
      </p>
      <Names view={view} />
      <p className="text-muted-foreground">{view.ticket.ticketType === "couple" ? labels.couple : labels.solo}</p>
    </div>
  );
}

async function CheckContent({ params }: Readonly<{ params: Promise<{ code: string }> }>): Promise<ReactNode> {
  const [{ code }, dict, locale] = await Promise.all([params, getDictionary(), getLocale()]);
  const [view, admin] = await Promise.all([findTicketView(code), isAdmin()]);

  if (!view) {
    return (
      <p className="flex items-center justify-center gap-2 border-4 border-destructive bg-card p-8 text-xl text-destructive">
        <XCircleIcon aria-hidden /> {dict.check.invalid}
      </p>
    );
  }

  if (admin) return <ProtocolView view={view} />;

  return (
    <div className="space-y-6">
      <GuestView view={view} labels={dict.check} />
      <p className="text-center text-sm">
        <Link
          href={`/${locale}/admin/login?next=${encodeURIComponent(`/${locale}/check/${code}`)}`}
          className="text-muted-foreground underline"
        >
          Protocole
        </Link>
      </p>
    </div>
  );
}

export default function CheckPage({ params }: PageProps<"/[lang]/check/[code]">): ReactNode {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <Ornament />
      <Suspense fallback={<LoadingBlock />}>
        <CheckContent params={params} />
      </Suspense>
      <Ornament />
    </main>
  );
}
