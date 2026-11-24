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
    cta: "Obtenir mon billet",
  },
  countdown: {
    title: "Le grand jour",
    today: "C'est aujourd'hui !",
    past: "Merci d'avoir partagé ce jour avec nous",
    addToCalendar: "Ajouter au calendrier",
    calendarApple: "Calendrier (iPhone, Outlook)",
    calendarGoogle: "Google Agenda",
    units: {
      days: { one: "jour", other: "jours" },
      hours: { one: "heure", other: "heures" },
      minutes: { one: "minute", other: "minutes" },
      seconds: { one: "seconde", other: "secondes" },
    },
  },
  schedule: {
    title: "Programme",
    now: "En ce moment",
    items: {
      ceremony: { title: "Cérémonie", description: "Échange des consentements" },
      cocktail: { title: "Vin d'honneur", description: "Rafraîchissements et photos" },
      dinner: { title: "Dîner", description: "Placement à table" },
      party: { title: "Soirée dansante", description: "Jusqu'au bout de la nuit" },
    },
  },
  venue: {
    title: "Lieux",
    ceremony: "Cérémonie",
    reception: "Réception",
    openIn: "Ouvrir dans",
  },
  dressCode: {
    title: "Dress code",
    body: "Tenue de soirée. Une touche de terracotta ou d'or sera très appréciée.",
  },
  rsvp: {
    title: "Votre billet",
    intro: "Remplissez ce formulaire pour recevoir votre billet d'entrée. Présentez-le à l'accueil le jour du mariage.",
    type: {
      legend: "Type de billet",
      solo: "Billet solo",
      soloHint: "Pour une personne",
      couple: "Billet couple",
      coupleHint: "Pour deux personnes",
    },
    fullName: "Nom et prénom",
    fullNamePlaceholder: "Ex. Marie Dupont",
    partnerName: "Nom et prénom du/de la partenaire",
    submit: "Générer mon billet",
    submitting: "Génération…",
    errors: {
      nameRequired: "Indiquez un nom et un prénom.",
      nameTooLong: "Ce nom est trop long.",
      partnerRequired: "Indiquez le nom de votre partenaire.",
      generic: "Une erreur est survenue. Réessayez dans un instant.",
    },
    success: {
      title: "Votre billet est prêt",
      body: "Téléchargez-le et gardez-le sur votre téléphone. Il sera scanné à l'entrée.",
      download: "Télécharger le billet (PDF)",
      again: "Créer un autre billet",
      existing: "Un billet existait déjà à ce nom : le voici.",
    },
    remembered: "Vous avez déjà un billet sur cet appareil.",
  },
  faq: {
    title: "Questions",
    empty: "Les réponses à vos questions arrivent bientôt.",
  },
  contact: {
    title: "Une question ?",
    body: "Le protocole est joignable sur WhatsApp.",
    cta: "Écrire au protocole",
  },
  weddingDay: {
    banner: "C'est aujourd'hui ! Bienvenue à notre mariage",
  },
  check: {
    valid: "Billet valide",
    invalid: "Billet introuvable",
    solo: "Solo",
    couple: "Couple",
  },
  ticketPdf: {
    heading: "Billet d'entrée",
    table: "Table",
    tableTbd: "Table communiquée à l'accueil",
    admits: { solo: "Valable pour 1 personne", couple: "Valable pour 2 personnes" },
    scanHint: "À présenter à l'entrée",
    reference: "Réf.",
  },
  language: {
    switchTo: "English",
  },
} as const;

type Widen<T> = T extends string ? string : { readonly [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof fr>;
