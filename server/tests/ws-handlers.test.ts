import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@services/jobs");
vi.mock("@workers/process-job");
vi.mock("@workers/process-job/steps", () => ({ default: [] }));

import jobsService from "@services/jobs";
import processJob from "@workers/process-job";

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
  vi.mocked(jobsService.createJob).mockResolvedValue(mockJob);
  vi.mocked(jobsService.updateJob).mockResolvedValue({ ...mockJob, status: "processing" });
  vi.mocked(processJob).mockResolvedValue(undefined);
});

describe("ping", () => {
  it("sends Pong!", () => {
    const socket = mockSocket();
    handlers.ping(socket, null);
    expect(socket.send).toHaveBeenCalledWith(JSON.stringify({ event: "pong", message: "Pong!" }));
  });
});

describe("proceed-job", () => {
  it("creates a job and transitions it to processing", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(jobsService.createJob).toHaveBeenCalledOnce();
    expect(jobsService.updateJob).toHaveBeenCalledWith(42, { status: "processing" });
  });

  it("sends initial job-progress event with processing status", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(socket.send).toHaveBeenCalledWith(
      JSON.stringify({ event: "job-progress", jobId: 42, status: "processing", progress: 0 }),
    );
  });

  it("sets activeJobId on socket before processing", async () => {
    const socket = mockSocket();
    let jobIdDuringProcessing: number | null = null;

    vi.mocked(processJob).mockImplementation(async (_jobId) => {
      jobIdDuringProcessing = socket.activeJobId;
    });

    await handlers["proceed-job"](socket, null);

    expect(jobIdDuringProcessing).toBe(42);
  });

  it("creates an AbortController and attaches it to the socket", async () => {
    const socket = mockSocket();
    let controllerDuringProcessing: AbortController | undefined;

    vi.mocked(processJob).mockImplementation(async (_jobId) => {
      controllerDuringProcessing = socket.abortController;
    });

    await handlers["proceed-job"](socket, null);

    expect(controllerDuringProcessing).toBeInstanceOf(AbortController);
  });
});

describe("proceed-job — step progress", () => {
  beforeEach(() => {
    vi.mocked(processJob).mockImplementation(async (_id, _steps, onStep) => {
      await onStep(1, 2, { message: "a" });
      await onStep(2, 2, { message: "b" });
    });
  });

  it("sends job-progress for each step with computed percentage", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

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
    await handlers["proceed-job"](socket, null);

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

  it("updates the job to done in DB on the final step", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(jobsService.updateJob).toHaveBeenCalledWith(42, { status: "done", progress: 100 });
  });

  it("clears activeJobId on the final step", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(socket.activeJobId).toBeNull();
  });
});

describe("proceed-job — step failure", () => {
  beforeEach(() => {
    vi.mocked(processJob).mockImplementation(async (_id, _steps, _onStep, onError) => {
      await onError?.(new Error("something went wrong"));
    });
  });

  it("sends status failed with the error message", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

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

  it("updates the job to failed in DB", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(jobsService.updateJob).toHaveBeenCalledWith(42, { status: "failed" });
  });

  it("closes the socket on failure", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(socket.close).toHaveBeenCalled();
  });

  it("clears activeJobId on failure", async () => {
    const socket = mockSocket();
    await handlers["proceed-job"](socket, null);

    expect(socket.activeJobId).toBeNull();
  });
});
