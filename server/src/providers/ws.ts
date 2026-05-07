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

    await handler(socket, payload);
  });

  socket.on("close", async () => {
    socket.abortController?.abort();
    if (socket.activeJobId) {
      await jobsService.updateJob(socket.activeJobId, { status: "failed" });
    }
  });
};
