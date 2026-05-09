"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type JobPhase = "idle" | "queued" | "processing" | "done" | "failed";

interface JobStatusContextValue {
  jobPhase: JobPhase;
  setJobPhase: (phase: JobPhase) => void;
}

const JobStatusContext = createContext<JobStatusContextValue | null>(null);

export const JobStatusProvider = ({ children }: { children: ReactNode }) => {
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");

  return (
    <JobStatusContext.Provider value={{ jobPhase, setJobPhase }}>
      {children}
    </JobStatusContext.Provider>
  );
};

export const useJobStatus = () => {
  const ctx = useContext(JobStatusContext);
  if (!ctx) {
    throw new Error("useJobStatus must be used within JobStatusProvider");
  }

  return ctx;
};
