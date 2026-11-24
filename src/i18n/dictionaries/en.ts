import type { Dictionary } from "./fr";

export const en = {
  meta: {
    title: "Sarah Christy & Joël Bertin — Wedding invitation",
    description: "Everything about our wedding, and your entry ticket.",
  },
  hero: {
    scrollHint: "Scroll to open the envelope",
    invitation: "are delighted to invite you to their wedding",
    cta: "Get my ticket",
  },
  countdown: {
    title: "The big day",
    today: "It's today!",
    past: "Thank you for sharing this day with us",
    addToCalendar: "Add to calendar",
    calendarApple: "Calendar (iPhone, Outlook)",
    calendarGoogle: "Google Calendar",
    units: {
      days: { one: "day", other: "days" },
      hours: { one: "hour", other: "hours" },
      minutes: { one: "minute", other: "minutes" },
      seconds: { one: "second", other: "seconds" },
    },
  },
  schedule: {
    title: "Programme",
    now: "Happening now",
    items: {
      ceremony: { title: "Ceremony", description: "Exchange of vows" },
      cocktail: { title: "Cocktail", description: "Drinks and photos" },
      dinner: { title: "Dinner", description: "Seated dinner" },
      party: { title: "Party", description: "Until the end of the night" },
    },
  },
  venue: {
    title: "Venues",
    ceremony: "Ceremony",
    reception: "Reception",
    openIn: "Open in",
  },
  dressCode: {
    title: "Dress code",
    body: "Evening attire. A touch of terracotta or gold will be warmly appreciated.",
  },
  rsvp: {
    title: "Your ticket",
    intro: "Fill in this form to receive your entry ticket. Show it at the entrance on the wedding day.",
    type: {
      legend: "Ticket type",
      solo: "Single ticket",
      soloHint: "For one person",
      couple: "Couple ticket",
      coupleHint: "For two people",
    },
    fullName: "Full name",
    fullNamePlaceholder: "e.g. Mary Smith",
    partnerName: "Partner's full name",
    submit: "Generate my ticket",
    submitting: "Generating…",
    errors: {
      nameRequired: "Please enter a first and last name.",
      nameTooLong: "This name is too long.",
      partnerRequired: "Please enter your partner's name.",
      generic: "Something went wrong. Please try again in a moment.",
    },
    success: {
      title: "Your ticket is ready",
      body: "Download it and keep it on your phone. It will be scanned at the entrance.",
      download: "Download ticket (PDF)",
      again: "Create another ticket",
      existing: "A ticket already existed under this name: here it is.",
    },
    remembered: "You already have a ticket on this device.",
  },
  faq: {
    title: "Questions",
    empty: "Answers to your questions are coming soon.",
  },
  contact: {
    title: "Any question?",
    body: "The protocol team is reachable on WhatsApp.",
    cta: "Message the protocol team",
  },
  weddingDay: {
    banner: "It's today! Welcome to our wedding",
  },
  check: {
    valid: "Valid ticket",
    invalid: "Ticket not found",
    solo: "Single",
    couple: "Couple",
  },
  ticketPdf: {
    heading: "Entry ticket",
    table: "Table",
    tableTbd: "Table given at the entrance",
    admits: { solo: "Admits 1 person", couple: "Admits 2 people" },
    scanHint: "Show at the entrance",
    reference: "Ref.",
  },
  language: {
    switchTo: "Français",
  },
} as const satisfies Dictionary;
