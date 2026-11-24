import { Suspense, type ReactNode } from "react";
import { requireAdminPage } from "@/server/auth/guard";
import { listAllFaq } from "@/server/faq/service";
import { deleteFaqAction } from "@/server/actions/admin";
import { AdminCard, LoadingBlock } from "@/components/admin/ui";
import { FaqForm } from "@/components/admin/faq-form";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Badge } from "@/components/ui/badge";

async function FaqContent(): Promise<ReactNode> {
  await requireAdminPage();
  const items = await listAllFaq();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-heading text-xl">Nouvelle question</h2>
        <AdminCard>
          <FaqForm faqId={null} />
        </AdminCard>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl">Questions ({items.length})</h2>
        {items.map((item) => (
          <details key={item.id} className="border bg-card p-4">
            <summary className="flex cursor-pointer items-center justify-between gap-2">
              <span className="font-medium">
                {item.position}. {item.questionFr}
              </span>
              {!item.published && <Badge variant="secondary">Brouillon</Badge>}
            </summary>
            <div className="space-y-3 pt-4">
              <FaqForm
                key={item.updatedAt.getTime()}
                faqId={item.id}
                values={{
                  questionFr: item.questionFr,
                  answerFr: item.answerFr,
                  questionEn: item.questionEn,
                  answerEn: item.answerEn,
                  position: item.position,
                  published: item.published,
                }}
              />
              <form action={deleteFaqAction.bind(null, item.id)} className="text-right">
                <ConfirmSubmit size="xs" variant="ghost" confirmMessage="Supprimer cette question ?">
                  Supprimer
                </ConfirmSubmit>
              </form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}

export default function AdminFaqPage(): ReactNode {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <FaqContent />
    </Suspense>
  );
}
