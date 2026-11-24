import { WEDDING } from "@/config/wedding";
import type { Locale } from "@/i18n/config";
import type { CalendarEvent } from "./calendar";

const TITLES: Readonly<Record<Locale, string>> = {
  fr: `Mariage de ${WEDDING.couple.first} & ${WEDDING.couple.second}`,
  en: `Wedding of ${WEDDING.couple.first} & ${WEDDING.couple.second}`,
};

export function weddingCalendarEvent(locale: Locale): CalendarEvent {
  return {
    uid: `wedding-${WEDDING.ceremonyAt}@faire-part`,
    title: TITLES[locale],
    description: `${WEDDING.ceremony.name} — ${WEDDING.ceremony.address}`,
    location: `${WEDDING.ceremony.name}, ${WEDDING.ceremony.address}`,
    start: new Date(WEDDING.ceremonyAt),
    end: new Date(WEDDING.endsAt),
  };
}
