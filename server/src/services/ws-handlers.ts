import { WebSocket } from "ws";

import jobsService from "@services/jobs";
import processJob, { OnStepCallback } from "@workers/process-job";
import steps from "@workers/process-job/steps";

type EventHandler = (socket: WebSocket, payload: unknown) => void | Promise<void>;

export const handlers: Record<string, EventHandler> = {
  ping: (socket) => {
    socket.send(JSON.stringify({ event: "pong", message: "Pong!" }));
  },

  "proceed-job": async (socket) => {
    const controller = new AbortController();
    socket.abortController = controller;

    const job = await jobsService.createJob();
    socket.activeJobId = job.id;

    await jobsService.updateJob(job.id, { status: "processing" });

    socket.send(
      JSON.stringify({
        event: "job-progress",
        jobId: job.id,
        status: "processing",
        progress: 0,
      }),
    );

    await processJob(
      job.id,
      steps,
      async (index, total, data) =>
        handleFinishedJob({ index, total, data, socket, jobId: job.id }),
      (err) => handleFailedJob({ socket, jobId: job.id, err }),
      controller.signal,
    );
  },
};

type StepArgs = {
  socket: WebSocket;
  jobId: number;
  index: Parameters<OnStepCallback>[0];
  total: Parameters<OnStepCallback>[1];
  data: Parameters<OnStepCallback>[2];
};

const handleFinishedJob = async ({ socket, jobId, index, total, data }: StepArgs) => {
  const progress = Math.round((index / total) * 100);
  const status = index === total ? "done" : "processing";

  if (index === total) {
    socket.activeJobId = null;
  }

  await jobsService.updateJob(jobId, { status, progress });

  socket.send(
    JSON.stringify({
      event: "job-progress",
      jobId,
      status,
      progress,
      ...data,
    }),
  );
};

const handleFailedJob = async ({
  socket,
  err,
  jobId,
}: {
  socket: WebSocket;
  err: Error;
  jobId: number;
}) => {
  const message = err.message || err.cause;
  socket.activeJobId = null;

  await jobsService.updateJob(jobId, { status: "failed" });

  socket.send(
    JSON.stringify({
      event: "job-progress",
      jobId,
      status: "failed",
      progress: 0,
      message,
    }),
  );
  socket.close();
};
