"use client";

import { CheckIcon } from "@/components/Icons";
import { Testimonial } from "@/components/Testimonial";
import { ThemeButton } from "@/components/ThemeButton";
interface Props {
  onReset: () => void;
}

export const JobDone = ({ onReset }: Props) => {
  return (
    <div className="text-center h-full flex flex-col xl:max-w-lg">
      <div className="size-20 rounded-full bg-(--gray-300) flex items-center justify-center mx-auto mt-4">
        <CheckIcon />
      </div>
      <h2 className="mt-6 text-[22px] font-bold text-(--blue-900)">You&apos;re all set!</h2>
      <p className="text-sm text-(--gray-500) leading-normal max-w-[280px] mx-auto mt-2 mb-6">
        Your personalized plan is ready. Let&apos;s begin your journey.
      </p>
      <div className="mt-auto">
        <Testimonial
          author="John"
          rating={4}
          comment={'"I love this — it makes planning so easy and keeps me motivated!"'}
        />

        <ThemeButton className="mt-6 w-full" onClick={onReset}>
          Start over
        </ThemeButton>
      </div>
    </div>
  );
};
