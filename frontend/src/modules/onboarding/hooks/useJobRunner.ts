import { useEffect, useRef, useState } from "react";

import { useJobStatus } from "../context/JobStatusContext";

export type Mode = "websocket" | "http";
export type Status = "idle" | "queued" | "processing" | "done" | "failed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

export const useJobRunner = (onReset: () => void) => {
  const { setJobPhase } = useJobStatus();
  const [mode, setMode] = useState<Mode | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [announcedLabel, setAnnouncedLabel] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setJobPhase(status);
  }, [status, setJobPhase]);

  useEffect(() => {
    if (!["queued", "processing"].includes(status)) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  useEffect(() => {
    const poll = pollRef.current;
    const ws = wsRef.current;
    return () => {
      if (poll) clearInterval(poll);
      ws?.close();
    };
  }, []);

  const statusLabel = getStatusLabel(status, mode, progress);

  useEffect(() => {
    const delay = status === "processing" ? 2000 : 0;
    const timer = setTimeout(() => setAnnouncedLabel(statusLabel), delay);
    return () => clearTimeout(timer);
  }, [statusLabel, status]);

  const launchWebSocket = async () => {
    setMode("websocket");
    setStatus("queued");
    setProgress(0);

    try {
      const res = await fetch(`${API_URL}/jobs`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to create job");
      }

      const job: { id: number } = await res.json();

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ event: "proceed-job", jobId: job.id }));
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        const msg: { event: string; status?: Status; progress?: number } = JSON.parse(e.data);

        if (msg.event === "job-progress") {
          if (msg.status) setStatus(msg.status);
          if (msg.progress !== undefined) setProgress(msg.progress);
          if (msg.status === "done" || msg.status === "failed") {
            ws.close();
          }
        } else if (msg.event === "error") {
          setStatus("failed");
          ws.close();
        }
      };

      ws.onerror = () => setStatus("failed");

      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch {
      setStatus("failed");
    }
  };

  const launchHTTP = async () => {
    setMode("http");
    setStatus("queued");
    setProgress(0);

    try {
      const res = await fetch(`${API_URL}/jobs`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to create job");
      }

      const job: { id: number } = await res.json();

      const startRes = await fetch(`${API_URL}/jobs/${job.id}`, { method: "POST" });
      if (!startRes.ok) {
        throw new Error("Failed to start job");
      }

      setStatus("processing");

      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${API_URL}/jobs/${job.id}`);
          if (!pollRes.ok) {
            throw new Error("Failed to poll job");
          }

          const polled: { status: Status; progress: number } = await pollRes.json();

          setStatus(polled.status);
          setProgress(polled.progress);

          if (polled.status === "done" || polled.status === "failed") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
          }
        } catch {
          setStatus("failed");
          clearInterval(pollRef.current!);
          pollRef.current = null;
        }
      }, 1500);
    } catch {
      setStatus("failed");
    }
  };

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setMode(null);
    setStatus("idle");
    setProgress(0);
    onReset();
  };

  return {
    mode,
    status,
    progress,
    announcedLabel,
    launchWebSocket,
    launchHTTP,
    handleReset,
  };
};

const getStatusLabel = (status: string, mode: Mode | null, progress: number) => {
  switch (status) {
    case "queued":
      return "Your plan is queued";
    case "processing":
      return `Processing your plan${mode === "websocket" ? `, ${progress}% complete` : ""}`;
    case "done":
      return "Your plan is ready";
    case "failed":
      return "Something went wrong. Please try again.";
    default:
      return "";
  }
};
