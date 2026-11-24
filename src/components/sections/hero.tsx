import type { ReactNode } from "react";
import { WEDDING } from "@/config/wedding";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { VideoScrub } from "@/components/motion/video-scrub";

type HeroProps = Readonly<{ labels: Dictionary["hero"] }>;

function CoupleTitle({ labels }: HeroProps): ReactNode {
  return (
    <div className="px-6 text-center">
      <h1 className="font-heading text-5xl leading-tight">
        {WEDDING.couple.first}
        <span className="block text-3xl">&</span>
        {WEDDING.couple.second}
      </h1>
      <p className="mt-4 text-muted-foreground">{labels.invitation}</p>
    </div>
  );
}

/**
 * The ticket coming out of the envelope IS the hero. Until the Canva export exists
 * (`WEDDING.media.heroVideo === null`), a static placeholder keeps the page usable.
 */
export function Hero({ labels }: HeroProps): ReactNode {
  const { heroVideo, heroPoster } = WEDDING.media;

  if (heroVideo === null) {
    return (
      <section className="flex h-svh items-center justify-center">
        <CoupleTitle labels={labels} />
      </section>
    );
  }

  return (
    <VideoScrub src={heroVideo} poster={heroPoster ?? undefined}>
      <p className="animate-pulse text-sm text-muted-foreground">{labels.scrollHint}</p>
    </VideoScrub>
  );
}
