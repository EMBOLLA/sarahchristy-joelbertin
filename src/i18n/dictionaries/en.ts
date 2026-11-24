import type { Dictionary } from "./fr";

export const en = {
  meta: {
    title: "Sarah Christy & Joël Bertin — Wedding invitation",
    description: "Everything about our wedding, and your entry ticket.",
  },
  hero: {
    scrollHint: "Scroll to open the envelope",
    invitation: "are delighted to invite you to their wedding",
  },
  countdown: {
    title: "The big day is coming",
    today: "It's today!",
    past: "Thank you for sharing this day with us",
    units: {
      days: { one: "day", other: "days" },
      hours: { one: "hour", other: "hours" },
      minutes: { one: "minute", other: "minutes" },
      seconds: { one: "second", other: "seconds" },
    },
  },
  venue: {
    title: "Venues",
    ceremony: "Ceremony",
    reception: "Reception",
    openIn: "Open in",
  },
  rsvp: {
    title: "Your ticket",
    comingSoon: "The form is coming soon.",
  },
  faq: {
    title: "Frequently asked questions",
  },
  language: {
    switchTo: "Français",
  },
} as const satisfies Dictionary;
