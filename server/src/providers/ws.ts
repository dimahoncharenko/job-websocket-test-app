import { WebSocket } from "ws";

import jobsService from "@services/jobs";
import { handlers } from "@services/ws-handlers";

declare module "ws" {
  interface WebSocket {
    activeJobId?: number | null;
    abortController?: AbortController;
  }
}

export type EventType = "ping" | "proceed-job";

export default (socket: WebSocket) => {
  socket.on("message", async (raw) => {
    let payload: { event: string };

    try {
      payload = JSON.parse(raw.toString());
    } catch {
      socket.send(JSON.stringify({ event: "error", message: "Invalid payload" }));
      return;
    }

    const handler = handlers[payload.event];
    if (!handler) {
      socket.send(
        JSON.stringify({
          event: "error",
          message: `Unknown event: ${payload.event}`,
        }),
      );
      socket.close();
      return;
    }

    try {
      await handler(socket, payload);
    } catch (err) {
      console.error("Unhandled error in WebSocket handler:", err);
      socket.send(JSON.stringify({ event: "error", message: "Internal server error" }));
    }
  });

  socket.on("close", async () => {
    socket.abortController?.abort();
    if (socket.activeJobId) {
      try {
        await jobsService.updateJob(socket.activeJobId, { status: "failed" });
      } catch (err) {
        console.error("Failed to mark job as failed on socket close:", err);
      }
    }
  });
};
