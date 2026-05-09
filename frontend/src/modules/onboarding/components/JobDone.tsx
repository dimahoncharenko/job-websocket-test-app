"use client";

import { Testimonial } from "@/components/Testimonial";

import { JobActionButton } from "./JobActionButton";

interface Props {
  onReset: () => void;
}

export const JobDone = ({ onReset }: Props) => {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-[#E7F8F2] flex items-center justify-center mx-auto mt-4">
        <svg aria-hidden width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="var(--teal-400)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-[22px] font-bold text-(--blue-900)">You&apos;re all set!</h2>
      <p className="text-sm text-(--gray-500) leading-normal max-w-[280px] mx-auto mt-2 mb-6">
        Your personalized plan is ready. Let&apos;s begin your journey.
      </p>
      <Testimonial />
      <div className="mt-6">
        <JobActionButton onClick={onReset}>Start over</JobActionButton>
      </div>
    </div>
  );
};
