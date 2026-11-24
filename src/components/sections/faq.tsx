import type { ReactNode } from "react";
import { getPublishedFaq } from "@/server/faq/service";
import type { Locale } from "@/i18n/config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FaqProps = Readonly<{ locale: Locale; emptyLabel: string }>;

/** Server Component: the cached FAQ is part of the static shell, no client fetch. */
export async function Faq({ locale, emptyLabel }: FaqProps): Promise<ReactNode> {
  const entries = await getPublishedFaq(locale);

  if (entries.length === 0) {
    return <p className="text-center text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <Accordion className="border-y border-gold/60">
      {entries.map((entry) => (
        <AccordionItem key={entry.id} value={entry.id}>
          <AccordionTrigger className="text-base">{entry.question}</AccordionTrigger>
          <AccordionContent className="whitespace-pre-line text-muted-foreground">{entry.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
