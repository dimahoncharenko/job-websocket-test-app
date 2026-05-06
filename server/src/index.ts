import { config } from "dotenv";
import express from "express";
import { RawData, WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

config();

interface WebsocketMessage {
  event: string;
}

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket: WebSocket) => {
  socket.on("message", async (data: RawData) => {
    let payload: WebsocketMessage;
    try {
      payload = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (payload.event === "ping") {
      socket.send("Hello");
    }
  });

  socket.on("close", () => {
    socket.send("Bye");
  });
});

wss.on("listening", () => {
  console.log(`Server listening on port: ${port}`);
});

httpServer.listen(port);
