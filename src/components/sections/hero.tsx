import type { ReactNode } from "react";
import { WEDDING } from "@/config/wedding";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import type { Locale } from "@/i18n/config";
import { VideoScrub } from "@/components/motion/video-scrub";
import { Gold, Ornament, ScriptHeading } from "@/components/typography";
import { buttonVariants } from "@/components/ui/button";

type HeroProps = Readonly<{ labels: Dictionary["hero"]; locale: Locale }>;

function CoupleTitle({ labels, locale }: HeroProps): ReactNode {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: WEDDING.timeZone }).format(
    new Date(WEDDING.ceremonyAt),
  );

  return (
    <div className="space-y-6 px-6 text-center">
      <ScriptHeading as="h1" goldInitial={false} className="text-6xl">
        <Gold>{WEDDING.couple.first.charAt(0)}</Gold>
        {WEDDING.couple.first.slice(1)}
        <Gold className="block py-1 text-5xl">&</Gold>
        <Gold>{WEDDING.couple.second.charAt(0)}</Gold>
        {WEDDING.couple.second.slice(1)}
      </ScriptHeading>
      <Ornament />
      <p className="text-lg text-muted-foreground">{labels.invitation}</p>
      <p className="font-heading text-xl tracking-[0.2em] text-primary uppercase">{date}</p>
      <a href="#rsvp" className={buttonVariants({ size: "lg" })}>
        {labels.cta}
      </a>
    </div>
  );
}

/**
 * The ticket coming out of the envelope IS the hero. Until the Canva export exists
 * (`WEDDING.media.heroVideo === null`), the typographic version stands alone.
 */
export function Hero(props: HeroProps): ReactNode {
  const { heroVideo, heroPoster } = WEDDING.media;

  if (heroVideo === null) {
    return (
      <section className="flex min-h-svh items-center justify-center py-16">
        <CoupleTitle {...props} />
      </section>
    );
  }

  return (
    <>
      <VideoScrub src={heroVideo} poster={heroPoster ?? undefined}>
        <p className="animate-pulse text-sm text-muted-foreground">{props.labels.scrollHint}</p>
      </VideoScrub>
      <section className="py-16">
        <CoupleTitle {...props} />
      </section>
    </>
  );
}
