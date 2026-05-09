"use client";

import { JobActionButton } from "./JobActionButton";

interface Props {
  onReset: () => void;
}

export const JobFailed = ({ onReset }: Props) => {
  return (
    <div className="text-center">
      <p role="alert" className="text-sm text-[#E04545] mb-5">
        Something went wrong. Please try again.
      </p>
      <JobActionButton onClick={onReset}>Try Again</JobActionButton>
    </div>
  );
};
