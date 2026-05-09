"use client";

import { ReactNode } from "react";

import { JobStatusProvider } from "../context/JobStatusContext";
import { OnboardingHeader } from "./OnboardingHeader";

export const OnboardingShell = ({ children }: { children: ReactNode }) => {
  return (
    <JobStatusProvider>
      <div className="min-h-screen flex flex-col items-center p-4 pt-[72px] pb-8 max-[520px]:block max-[520px]:p-0 max-[520px]:pt-[72px]">
        <header className="fixed top-0 left-0 h-[72px] right-0 bg-white z-10 border-b border-b-(--gray-200)">
          <OnboardingHeader />
        </header>
        <div className="w-full max-w-[588px]">
          <div className="max-[520px]:rounded-none max-[520px]:bg-transparent">{children}</div>
        </div>
      </div>
    </JobStatusProvider>
  );
};
