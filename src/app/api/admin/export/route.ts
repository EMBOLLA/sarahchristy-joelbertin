import { isAdmin } from "@/server/auth/session";
import { listTicketViews } from "@/server/tickets/service";
import { toCsv } from "@/lib/csv";
import { seatsFor } from "@/lib/wedding/ticket-request";

const STATUS_LABELS = { matched: "Sur la liste", manual: "Validé manuellement", unlisted: "Hors liste" } as const;

export async function GET(): Promise<Response> {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const views = await listTicketViews();
  const csv = toCsv([
    ["Nom", "Partenaire", "Type", "Personnes", "Statut", "Table", "Entré à", "Créé le", "Réf."],
    ...views.map(({ ticket, tableNumber, typeMismatch }) => [
      ticket.primaryName,
      ticket.partnerName ?? "",
      typeMismatch ? `${ticket.ticketType} (≠ liste)` : ticket.ticketType,
      String(seatsFor(ticket.ticketType)),
      STATUS_LABELS[ticket.matchStatus],
      tableNumber === null ? "" : String(tableNumber),
      ticket.checkedInAt?.toISOString() ?? "",
      ticket.createdAt.toISOString(),
      ticket.publicCode.slice(0, 8),
    ]),
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="billets-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
