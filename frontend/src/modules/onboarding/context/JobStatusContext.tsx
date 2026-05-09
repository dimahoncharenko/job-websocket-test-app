"use client";

import { createContext, ReactNode, useContext, useState } from "react";

export type JobPhase = "idle" | "queued" | "processing" | "done" | "failed";

interface JobStatusContextValue {
  jobPhase: JobPhase;
  setJobPhase: (phase: JobPhase) => void;
}

const JobStatusContext = createContext<JobStatusContextValue>({
  jobPhase: "idle",
  setJobPhase: () => {},
});

export const JobStatusProvider = ({ children }: { children: ReactNode }) => {
  const [jobPhase, setJobPhase] = useState<JobPhase>("idle");

  return (
    <JobStatusContext.Provider value={{ jobPhase, setJobPhase }}>
      {children}
    </JobStatusContext.Provider>
  );
};

export const useJobStatus = () => {
  return useContext(JobStatusContext);
};
