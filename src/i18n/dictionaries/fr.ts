/**
 * French is the reference dictionary: its shape defines the `Dictionary` type,
 * so a key missing in another language is a compile error, not a runtime blank.
 */
export const fr = {
  meta: {
    title: "Sarah Christy & Joël Bertin — Faire-part",
    description: "Toutes les informations sur notre mariage, et votre billet d'entrée.",
  },
  hero: {
    scrollHint: "Faites défiler pour ouvrir l'enveloppe",
    invitation: "ont la joie de vous convier à leur mariage",
  },
  countdown: {
    title: "Le grand jour approche",
    today: "C'est aujourd'hui !",
    past: "Merci d'avoir partagé ce jour avec nous",
    units: {
      days: { one: "jour", other: "jours" },
      hours: { one: "heure", other: "heures" },
      minutes: { one: "minute", other: "minutes" },
      seconds: { one: "seconde", other: "secondes" },
    },
  },
  venue: {
    title: "Lieux",
    ceremony: "Cérémonie",
    reception: "Réception",
    openIn: "Ouvrir dans",
  },
  rsvp: {
    title: "Votre billet",
    comingSoon: "Le formulaire arrive bientôt.",
  },
  faq: {
    title: "Questions fréquentes",
  },
  language: {
    switchTo: "English",
  },
} as const;

type Widen<T> = T extends string ? string : { readonly [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof fr>;
