"use client";

import { usePathname, useRouter } from "next/navigation";

import { ChevronLeftIcon } from "@/components/Icons";

import { useJobStatus } from "../context/JobStatusContext";

const RETURN_LINKS_MAP: Record<string, string | null> = {
  "/onboarding/wish": null,
  "/onboarding/weight": "/onboarding/wish",
  "/onboarding/job": "/onboarding/weight",
};

const PROGRESS_MAP: Record<string, number> = {
  "/onboarding/wish": 33,
  "/onboarding/weight": 66,
};

export const OnboardingHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { jobPhase } = useJobStatus();

  const backRoute = RETURN_LINKS_MAP[pathname];
  const progress = PROGRESS_MAP[pathname];
  const showProgress = progress !== undefined;

  const isJobPage = pathname === "/onboarding/job";
  const hideBack = isJobPage && ["queued", "processing", "failed", "done"].includes(jobPhase);
  const canGoBack = !!backRoute && !hideBack;

  const handleBackClick = () => {
    if (!canGoBack) {
      return;
    }

    router.push(backRoute);
  };

  return (
    <div className="flex items-center mx-auto gap-3 xl:gap-10 p-4 max-w-[1112px] h-full">
      <button
        onClick={handleBackClick}
        aria-label="Go Back"
        disabled={!canGoBack}
        className={[
          "bg-transparent border-none p-1 flex items-center shrink-0 transition-opacity duration-200",
          hideBack ? "opacity-0 pointer-events-none" : "",
          canGoBack ? "cursor-pointer text-(--blue-600)" : "cursor-default text-[#CFD3D8]",
        ].join(" ")}
      >
        <ChevronLeftIcon />
      </button>
      {showProgress && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Onboarding progress"
          className="h-2 bg-(--gray-100) rounded-full overflow-hidden flex-1"
        >
          <div
            style={{ width: `${progress}%` }}
            className="h-full rounded-full bg-linear-to-r from-(--teal-400) to-(--teal-500) transition-[width] duration-360 ease-[cubic-bezier(.2,.8,.2,1)]"
          />
        </div>
      )}
    </div>
  );
};
