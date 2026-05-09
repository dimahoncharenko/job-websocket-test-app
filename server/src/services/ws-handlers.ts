import { WebSocket } from "ws";

import jobsService from "@services/jobs";

type EventHandler = (socket: WebSocket, payload: unknown) => void | Promise<void>;

export const handlers: Record<string, EventHandler> = {
  ping: (socket) => {
    socket.send(JSON.stringify({ event: "pong", message: "Pong!" }));
  },

  "proceed-job": async (socket, payload) => {
    const { jobId } = payload as { jobId: number };

    if (!jobId || !Number.isInteger(jobId)) {
      socket.send(JSON.stringify({ event: "error", message: "Invalid jobId" }));
      return;
    }

    const job = await jobsService.getJob(jobId);

    if (!job) {
      socket.send(JSON.stringify({ event: "error", message: "Job not found" }));
      return;
    }

    if (job.status !== "queued") {
      socket.send(JSON.stringify({ event: "error", message: "Job is not queued" }));
      return;
    }

    const controller = new AbortController();
    socket.abortController = controller;
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

    await jobsService.runJob(job.id, {
      onStep: async ({ index, total, data, progress, status }) => {
        if (index === total) socket.activeJobId = null;

        socket.send(
          JSON.stringify({
            event: "job-progress",
            jobId: job.id,
            status,
            progress,
            ...data,
          }),
        );
      },
      onError: async (err) => {
        socket.activeJobId = null;
        const message = err.message || err.cause;
        socket.send(
          JSON.stringify({
            event: "job-progress",
            jobId: job.id,
            status: "failed",
            progress: 0,
            message,
          }),
        );
        socket.close();
      },
      signal: controller.signal,
    });
  },
};
