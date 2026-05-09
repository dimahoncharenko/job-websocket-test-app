"use client";

import { useEffect, useRef, useState } from "react";

import { ProgressRingIcon } from "@/components/Icons";
import { Testimonial } from "@/components/Testimonial";

const R = 70;
const CIRCUMFERENCE = 2 * Math.PI * R;
const TRANSITION_MS = 700;

interface Props {
  progress: number;
}

export const JobProcessingWebSocket = ({ progress }: Props) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const dash = (safeProgress / 100) * CIRCUMFERENCE;

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [displayedProgress, setDisplayedProgress] = useState(safeProgress);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(safeProgress);

  useEffect(() => {
    const from = fromRef.current;
    const to = safeProgress;

    if (from === to) {
      return;
    }

    if (reducedMotion) {
      fromRef.current = to;
      return;
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;

      const progress = Math.min((timestamp - startRef.current) / TRANSITION_MS, 1);
      const value = Math.round(from + (to - from) * easeInOut(progress));
      setDisplayedProgress(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [safeProgress, reducedMotion]);

  return (
    <div className="text-center h-full flex flex-col pb-6">
      <div
        role="progressbar"
        aria-valuenow={safeProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Job progress"
        className="relative size-[168px] mx-auto mb-6"
      >
        <ProgressRingIcon
          dash={dash}
          circumference={CIRCUMFERENCE}
          transition={reducedMotion ? "none" : `stroke-dasharray ${TRANSITION_MS}ms ease-in-out`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[34px] font-bold text-(--teal-400)">
          {reducedMotion ? safeProgress : displayedProgress}%
        </div>
      </div>
      <p className="text-2xl text-(--neutral-primary) mb-2">Creating something good for you…</p>
      <p className="text-sm text-(--neutral-secondary) mx-auto mb-6 leading-normal">
        This will only take a moment — your item is almost ready.
      </p>
      <div className="mt-auto mb-4">
        <Testimonial
          author="John"
          rating={4}
          comment={'"I love this — it makes planning so easy and keeps me motivated!"'}
        />
      </div>
    </div>
  );
};
