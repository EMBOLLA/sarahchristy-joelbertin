import type { ReactNode } from "react";
import { WEDDING } from "@/config/wedding";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { Hero } from "@/components/sections/hero";
import { Countdown } from "@/components/sections/countdown";
import { VenueCard } from "@/components/sections/venue-card";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage(): Promise<ReactNode> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <main className="mx-auto w-full max-w-md">
      <header className="fixed top-0 right-0 z-50 p-3">
        <LanguageSwitcher target={locale === "fr" ? "en" : "fr"} label={dict.language.switchTo} />
      </header>

      <Hero labels={dict.hero} />

      <section className="space-y-6 px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.countdown.title}</h2>
        <Countdown targetIso={WEDDING.ceremonyAt} locale={locale} labels={dict.countdown} />
      </section>

      <section className="space-y-4 px-4 py-16">
        <h2 className="text-center font-heading text-3xl">{dict.venue.title}</h2>
        <VenueCard label={dict.venue.ceremony} venue={WEDDING.ceremony} openInLabel={dict.venue.openIn} />
        <VenueCard label={dict.venue.reception} venue={WEDDING.reception} openInLabel={dict.venue.openIn} />
      </section>

      <section id="rsvp" className="space-y-4 px-4 py-16 text-center">
        <h2 className="font-heading text-3xl">{dict.rsvp.title}</h2>
        <p className="text-muted-foreground">{dict.rsvp.comingSoon}</p>
      </section>

      <section id="faq" className="space-y-4 px-4 py-16 text-center">
        <h2 className="font-heading text-3xl">{dict.faq.title}</h2>
      </section>
    </main>
  );
}
