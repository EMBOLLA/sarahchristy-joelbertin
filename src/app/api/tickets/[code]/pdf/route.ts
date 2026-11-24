import type { NextRequest } from "next/server";
import { findTicketView } from "@/server/tickets/service";
import { renderTicketPdf } from "@/server/tickets/pdf";
import { normalizeName } from "@/lib/wedding/names";

function fileName(names: ReadonlyArray<string>): string {
  const slug = normalizeName(names.join(" ")).replace(/ /g, "-").slice(0, 60);
  return `billet-${slug || "mariage"}.pdf`;
}

export async function GET(request: NextRequest, ctx: RouteContext<"/api/tickets/[code]/pdf">): Promise<Response> {
  const { code } = await ctx.params;
  const view = await findTicketView(code);
  if (!view) return new Response("Not found", { status: 404 });

  // The QR points to a live page: table assignment and check-in status are read at scan time.
  const checkUrl = new URL(`/check/${encodeURIComponent(code)}`, request.nextUrl.origin).toString();
  const pdf = await renderTicketPdf(view, checkUrl);

  const names = [view.ticket.primaryName, view.ticket.partnerName].filter((n): n is string => n !== null);
  const disposition = request.nextUrl.searchParams.get("inline") === "1" ? "inline" : "attachment";

  return new Response(pdf.slice().buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${fileName(names)}"`,
      // Contents change when the protocol assigns a table: never cache.
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
