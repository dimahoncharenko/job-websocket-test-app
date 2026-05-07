import "dotenv/config";
import { createServer } from "http";
import express from "express";
import { WebSocket, WebSocketServer } from "ws";

import { initTables } from "@providers/db";
import wsConnection from "@providers/ws";
import apiRoutes from "@apis/jobs";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());
app.use(apiRoutes);

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket: WebSocket) => wsConnection(socket));

initTables()
  .then(() => {
    httpServer.listen(port);
  })
  .catch((err) => {
    console.error("Failed to initialize database tables:", err);
    process.exit(1);
  });

wss.on("listening", () => {
  console.log(`Server listening on port: ${port}`);
});
