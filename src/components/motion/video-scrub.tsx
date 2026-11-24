"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type VideoScrubProps = Readonly<{
  src: string;
  poster?: string;
  /** Scroll distance mapped to the full video, in % of viewport height. */
  scrollLength?: number;
  /** Rendered above the video (names, scroll hint…), pinned with it. */
  children?: ReactNode;
}>;

/**
 * Loads the whole file into memory before scrubbing: iOS Safari seeks smoothly only
 * inside fully buffered media. Falls back to streaming the URL if the fetch fails.
 * The source MUST be encoded with a keyframe on every frame — see docs/VIDEO_SCRUB.md.
 */
function useBufferedVideo(src: string): string | null {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let created: string | null = null;

    fetch(src, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Video fetch failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setObjectUrl(src);
      });

    return () => {
      controller.abort();
      if (created) URL.revokeObjectURL(created);
    };
  }, [src]);

  return objectUrl;
}

export function VideoScrub({ src, poster, scrollLength = 250, children }: VideoScrubProps): ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bufferedSrc = useBufferedVideo(src);

  useGSAP(
    () => {
      const video = videoRef.current;
      if (!video || !bufferedSrc) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const build = (): void => {
          gsap.fromTo(
            video,
            { currentTime: 0 },
            {
              currentTime: video.duration,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: `+=${scrollLength}%`,
                scrub: 0.5,
                pin: true,
              },
            },
          );
        };

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) build();
        else video.addEventListener("loadedmetadata", build, { once: true });
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [bufferedSrc, scrollLength] },
  );

  return (
    <div ref={containerRef} className="relative h-svh w-full overflow-hidden">
      <video
        ref={videoRef}
        src={bufferedSrc ?? undefined}
        poster={poster}
        muted
        playsInline
        preload="auto"
        aria-hidden
        className="absolute inset-0 size-full object-cover"
      />
      <div className="relative z-10 flex size-full flex-col items-center justify-end pb-12">{children}</div>
    </div>
  );
}
