import { Suspense, type ReactNode } from "react";
import { requireAdminPage } from "@/server/auth/guard";
import { getTableOccupancy, listGuests, type GuestWithTicket } from "@/server/guests/service";
import { deleteGuestAction, setGuestTableAction } from "@/server/actions/admin";
import { getSeatingEnv } from "@/server/env";
import { seatsFor } from "@/lib/wedding/ticket-request";
import { AdminCard, LoadingBlock, NativeSelect } from "@/components/admin/ui";
import { AddGuestForm, ImportGuestsForm } from "@/components/admin/guest-import-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Seating = Readonly<{ tableCount: number; capacity: number }>;

function TablesOverview({ occupancy, seating }: Readonly<{ occupancy: ReadonlyMap<number, number>; seating: Seating }>): ReactNode {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {Array.from({ length: seating.tableCount }, (_, i) => i + 1).map((table) => {
        const seats = occupancy.get(table) ?? 0;
        const full = seats >= seating.capacity;
        return (
          <div key={table} className={cn("border p-2 text-center", full ? "border-destructive" : "border-gold/60")}>
            <p className="text-xs text-muted-foreground uppercase">Table {table}</p>
            <p className={cn("font-heading text-xl tabular-nums", full && "text-destructive")}>
              {seats}/{seating.capacity}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function GuestRow({ guest, seating, occupancy }: Readonly<{ guest: GuestWithTicket; seating: Seating; occupancy: ReadonlyMap<number, number> }>): ReactNode {
  const names = [guest.displayName, guest.partnerName].filter(Boolean).join(" & ");
  const seats = seatsFor(guest.ticketType);

  return (
    <AdminCard className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="font-heading text-lg">{names}</p>
        <div className="flex gap-1">
          <Badge variant="outline">{guest.ticketType === "couple" ? "Couple" : "Solo"}</Badge>
          <Badge variant={guest.hasTicket ? "default" : "secondary"}>{guest.hasTicket ? "Billet généré" : "Pas de billet"}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Keyed on the saved value: React 19 resets forms after an action, before the refreshed
            data arrives — remounting makes the select show the persisted table. */}
        <form key={guest.tableNumber ?? "none"} action={setGuestTableAction.bind(null, guest.id)} className="flex gap-2">
          <NativeSelect name="tableNumber" defaultValue={guest.tableNumber ?? ""} aria-label={`Table de ${names}`} className="w-32">
            <option value="">Sans table</option>
            {Array.from({ length: seating.tableCount }, (_, i) => i + 1).map((n) => {
              const free = seating.capacity - (occupancy.get(n) ?? 0);
              const isCurrent = guest.tableNumber === n;
              return (
                <option key={n} value={n} disabled={!isCurrent && free < seats}>
                  Table {n} ({isCurrent ? "actuelle" : `${free} pl.`})
                </option>
              );
            })}
          </NativeSelect>
          <ConfirmSubmit size="sm" variant="outline">
            OK
          </ConfirmSubmit>
        </form>
        <form action={deleteGuestAction.bind(null, guest.id)}>
          <ConfirmSubmit size="sm" variant="ghost" confirmMessage={`Retirer ${names} de la liste ?`}>
            ✕
          </ConfirmSubmit>
        </form>
      </div>
    </AdminCard>
  );
}

async function GuestsContent(): Promise<ReactNode> {
  await requireAdminPage();
  const { WEDDING_TABLE_COUNT, WEDDING_TABLE_CAPACITY } = getSeatingEnv();
  const seating: Seating = { tableCount: WEDDING_TABLE_COUNT, capacity: WEDDING_TABLE_CAPACITY };
  const [guests, occupancy] = await Promise.all([listGuests(), getTableOccupancy()]);
  const people = guests.reduce((total, guest) => total + seatsFor(guest.ticketType), 0);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-heading text-xl">Tables</h2>
        <TablesOverview occupancy={occupancy} seating={seating} />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">Ajouter</h2>
        <AdminCard>
          <AddGuestForm tableCount={seating.tableCount} />
        </AdminCard>
        <details className="border bg-card p-4">
          <summary className="cursor-pointer font-medium">Import en masse</summary>
          <div className="pt-4">
            <ImportGuestsForm />
          </div>
        </details>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">
          Liste ({guests.length} entrées · {people} personnes)
        </h2>
        {guests.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Aucun invité pour l&apos;instant.</p>
        ) : (
          guests.map((guest) => <GuestRow key={guest.id} guest={guest} seating={seating} occupancy={occupancy} />)
        )}
      </section>
    </div>
  );
}

export default function AdminGuestsPage(): ReactNode {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <GuestsContent />
    </Suspense>
  );
}
