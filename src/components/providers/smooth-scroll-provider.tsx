"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

function ScrollTriggerSync(): null {
  // Every Lenis scroll frame must refresh ScrollTrigger, otherwise scrubs lag one frame behind.
  useLenis(() => ScrollTrigger.update());
  return null;
}

/**
 * Lenis is driven by GSAP's ticker (autoRaf: false) so both run on ONE rAF loop:
 * no drift between smooth scroll position and scrubbed animations.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }): ReactNode {
  const lenisRef = useRef<LenisRef>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const tick = (time: number): void => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        anchors: true,
        // Native scroll when the OS asks for less motion.
        smoothWheel: !reducedMotion,
        lerp: 0.1,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
