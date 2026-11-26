import type { ReactNode } from "react";
import { CalendarPlusIcon, MessageCircleIcon } from "lucide-react";
import { WEDDING } from "@/config/wedding";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { buildGoogleCalendarUrl } from "@/lib/wedding/calendar";
import { weddingCalendarEvent } from "@/lib/wedding/wedding-event";
import { Hero } from "@/components/sections/hero";
import { Countdown } from "@/components/sections/countdown";
import { Schedule, type ScheduleItemView } from "@/components/sections/schedule";
import { VenueCard } from "@/components/sections/venue-card";
import { Faq } from "@/components/sections/faq";
import { WeddingDay } from "@/components/sections/wedding-day";
import { TicketForm } from "@/components/rsvp/ticket-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Section } from "@/components/typography";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function scheduleItems(dict: Dictionary, locale: Locale): ScheduleItemView[] {
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: WEDDING.timeZone });
  return WEDDING.schedule.map((step) => ({
    id: step.id,
    at: step.at,
    time: time.format(new Date(step.at)),
    title: dict.schedule.items[step.id].title,
    description: dict.schedule.items[step.id].description,
    venue: WEDDING[step.venue].name,
  }));
}

function CalendarLinks({ locale, labels }: Readonly<{ locale: Locale; labels: Dictionary["countdown"] }>): ReactNode {
  return (
    <div className="space-y-2 text-center">
      <p className="flex items-center justify-center gap-2 text-sm tracking-[0.15em] text-muted-foreground uppercase">
        <CalendarPlusIcon className="size-4 text-gold" aria-hidden />
        {labels.addToCalendar}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <a href={`/api/calendar/${locale}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {labels.calendarApple}
        </a>
        <a
          href={buildGoogleCalendarUrl(weddingCalendarEvent(locale))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {labels.calendarGoogle}
        </a>
      </div>
    </div>
  );
}

export default async function HomePage(): Promise<ReactNode> {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <WeddingDay ceremonyIso={WEDDING.ceremonyAt} timeZone={WEDDING.timeZone} banner={dict.weddingDay.banner} />

      <main className="relative mx-auto w-full max-w-md">
        {/* Anchored to the top of the content (below the wedding-day banner), not fixed:
            never overlaps the banner nor the sections while scrolling. */}
        <header className="absolute top-0 right-0 z-10 p-3">
          <LanguageSwitcher target={locale === "fr" ? "en" : "fr"} label={dict.language.switchTo} />
        </header>

        <Hero labels={dict.hero} locale={locale} />

        <Section title={dict.countdown.title}>
          <Countdown targetIso={WEDDING.ceremonyAt} timeZone={WEDDING.timeZone} locale={locale} labels={dict.countdown} />
          <CalendarLinks locale={locale} labels={dict.countdown} />
        </Section>

        <Section title={dict.schedule.title}>
          <Schedule items={scheduleItems(dict, locale)} timeZone={WEDDING.timeZone} nowLabel={dict.schedule.now} />
        </Section>

        <Section title={dict.venue.title}>
          <div className="space-y-4">
            <VenueCard label={dict.venue.ceremony} venue={WEDDING.ceremony} openInLabel={dict.venue.openIn} />
            <VenueCard label={dict.venue.reception} venue={WEDDING.reception} openInLabel={dict.venue.openIn} />
          </div>
        </Section>

        <Section title={dict.dressCode.title}>
          <p className="text-center text-lg">{dict.dressCode.body}</p>
        </Section>

        <Section id="rsvp" title={dict.rsvp.title}>
          <p className="text-center text-muted-foreground">{dict.rsvp.intro}</p>
          <TicketForm locale={locale} labels={dict.rsvp} />
        </Section>

        <Section id="faq" title={dict.faq.title}>
          <Faq locale={locale} emptyLabel={dict.faq.empty} />
        </Section>

        <Section title={dict.contact.title} className="pb-24">
          <p className="text-center text-muted-foreground">{dict.contact.body}</p>
          <a
            href={`https://wa.me/${WEDDING.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            <MessageCircleIcon aria-hidden />
            {dict.contact.cta}
          </a>
        </Section>
      </main>
    </>
  );
}
