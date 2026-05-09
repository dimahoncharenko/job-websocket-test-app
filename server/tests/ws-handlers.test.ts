import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@services/jobs");

import jobsService from "@services/jobs";

import { handlers } from "@services/ws-handlers";

const mockSocket = () =>
  ({
    send: vi.fn(),
    close: vi.fn(),
    activeJobId: null as number | null,
    abortController: undefined as AbortController | undefined,
  }) as any;

const mockJob = { id: 42, status: "queued" as const, progress: 0, createdAt: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(jobsService.getJob).mockResolvedValue(mockJob);
  vi.mocked(jobsService.updateJob).mockResolvedValue({ ...mockJob, status: "processing" });
  vi.mocked(jobsService.runJob).mockResolvedValue(undefined);
});

describe("ping", () => {
  it("sends Pong!", () => {
    const socket = mockSocket();
    handlers.ping(socket, null);
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ event: "pong", message: "Pong!" }));
  });
});

describe("proceed-job — validation", () => {
  it("sends error when jobId is missing", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, {});

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "error", message: "Invalid jobId" }),
    );
  });

  it("sends error when job is not found", async () => {
    vi.mocked(jobsService.getJob).mockResolvedValue(undefined);
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "error", message: "Job not found" }),
    );
  });

  it("sends error when job is not queued", async () => {
    vi.mocked(jobsService.getJob).mockResolvedValue({ ...mockJob, status: "processing" });
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "error", message: "Job is not queued" }),
    );
  });
});

describe("proceed-job", () => {
  it("fetches the job and transitions it to processing", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(jobsService.getJob).toHaveBeenCalledWith(42);
    expect(jobsService.updateJob).toHaveBeenCalledWith(42, { status: "processing" });
  });

  it("sends initial job-progress event with processing status", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "job-progress", jobId: 42, status: "processing", progress: 0 }),
    );
  });

  it("sets activeJobId on socket before processing", async () => {
    const socket = mockSocket();
    let jobIdDuringProcessing: number | null = null;

    vi.mocked(jobsService.runJob).mockImplementation(async (_jobId) => {
      jobIdDuringProcessing = socket.activeJobId;
    });

    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(jobIdDuringProcessing).toBe(42);
  });

  it("creates an AbortController and attaches it to the socket", async () => {
    const socket = mockSocket();
    let controllerDuringProcessing: AbortController | undefined;

    vi.mocked(jobsService.runJob).mockImplementation(async (_jobId) => {
      controllerDuringProcessing = socket.abortController;
    });

    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(controllerDuringProcessing).toBeInstanceOf(AbortController);
  });
});

describe("proceed-job — step progress", () => {
  beforeEach(() => {
    vi.mocked(jobsService.runJob).mockImplementation(async (_id, callbacks = {}) => {
      await callbacks.onStep?.({ index: 1, total: 2, data: { message: "a" }, progress: 50, status: "processing" });
      await callbacks.onStep?.({ index: 2, total: 2, data: { message: "b" }, progress: 100, status: "done" });
    });
  });

  it("sends job-progress for each step with computed percentage", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        event: "job-progress",
        jobId: 42,
        status: "processing",
        progress: 50,
        message: "a",
      }),
    );
  });

  it("sends status done on the final step", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        event: "job-progress",
        jobId: 42,
        status: "done",
        progress: 100,
        message: "b",
      }),
    );
  });

  it("clears activeJobId on the final step", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.activeJobId).toBeNull();
  });
});

describe("proceed-job — step failure", () => {
  beforeEach(() => {
    vi.mocked(jobsService.runJob).mockImplementation(async (_id, callbacks = {}) => {
      await callbacks.onError?.(new Error("something went wrong"));
    });
  });

  it("sends status failed with the error message", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({
        event: "job-progress",
        jobId: 42,
        status: "failed",
        progress: 0,
        message: "something went wrong",
      }),
    );
  });

  it("closes the socket on failure", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.close).toHaveBeenCalled();
  });

  it("clears activeJobId on failure", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, { jobId: 42 });

    expect(socket.activeJobId).toBeNull();
  });
});
