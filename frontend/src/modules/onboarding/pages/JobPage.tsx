"use client";

import { JobDone } from "../components/JobDone";
import { JobFailed } from "../components/JobFailed";
import { JobIdle } from "../components/JobIdle";
import { JobProcessingHTTP } from "../components/JobProcessingHTTP";
import { JobProcessingWebSocket } from "../components/JobProcessingWebSocket";
import { JobQueued } from "../components/JobQueued";
import { useJobRunner } from "../hooks/useJobRunner";

interface JobScreenProps {
  onReset: () => void;
  initialDone?: boolean;
}

export default function JobPage({ onReset, initialDone }: JobScreenProps) {
  const { mode, status, progress, announcedLabel, launchWebSocket, launchHTTP, handleReset, handleRetry } =
    useJobRunner(onReset, initialDone);

  return (
    <div className="px-5 pt-7 pb-6 h-[85vh] max-h-[800px]">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcedLabel}
      </div>

      {status === "idle" && (
        <JobIdle onLaunchWebSocket={launchWebSocket} onLaunchHTTP={launchHTTP} />
      )}
      {status === "queued" && <JobQueued />}
      {status === "processing" && mode === "websocket" && (
        <JobProcessingWebSocket progress={progress} />
      )}
      {status === "processing" && mode === "http" && <JobProcessingHTTP />}
      {status === "done" && <JobDone onReset={handleReset} />}
      {status === "failed" && <JobFailed onReset={handleRetry} />}
    </div>
  );
}
