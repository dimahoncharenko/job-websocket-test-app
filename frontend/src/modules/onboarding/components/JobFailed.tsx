"use client";

import { WarningIcon } from "@/components/Icons";
import { ThemeButton } from "@/components/ThemeButton";

interface Props {
  onReset: () => void;
}

export const JobFailed = ({ onReset }: Props) => {
  return (
    <div role="alert" className="text-center h-full flex flex-col">
      <div className="size-20 rounded-full bg-(--gray-300) flex items-center justify-center mx-auto mt-4">
        <WarningIcon />
      </div>
      <h2 className="mt-6 text-[22px] font-bold text-(--blue-900)">Hmm, something went wrong</h2>
      <p className="text-sm text-(--gray-500) leading-normal max-w-[280px] mx-auto mt-2">
        We couldn&apos;t save your progress. Check your connection and try again — your answers are
        still here.
      </p>
      <div className="mt-auto">
        <ThemeButton className="w-full" onClick={onReset}>
          Try again
        </ThemeButton>
      </div>
    </div>
  );
};
