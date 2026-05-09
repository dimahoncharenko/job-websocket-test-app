"use client";

import { JobLaunchOption } from "./JobLaunchOption";

interface Props {
  onLaunchWebSocket: () => void;
  onLaunchHTTP: () => void;
}

export const JobIdle = ({ onLaunchWebSocket, onLaunchHTTP }: Props) => {
  return (
    <>
      <h1 className="text-[22px] font-bold text-(--blue-900) text-center my-2">
        Run the job
      </h1>
      <p className="text-center text-sm text-(--gray-500) mb-6">
        Choose how to process the job
      </p>
      <div className="flex flex-col gap-3">
        <JobLaunchOption
          onClick={onLaunchWebSocket}
          title="Process via WebSocket"
          subtitle="Real-time progress (0–100%)"
          variant="primary"
        />
        <JobLaunchOption
          onClick={onLaunchHTTP}
          title="Process via HTTP"
          subtitle="Polling-based status updates"
          variant="secondary"
        />
      </div>
    </>
  );
};
