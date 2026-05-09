import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JobStatusProvider } from "@/modules/onboarding/context/JobStatusContext";
import JobPage from "@/modules/onboarding/pages/JobPage";

let latestWs: MockWebSocket | null = null;

class MockWebSocket {
  send = vi.fn();
  close = vi.fn();
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    latestWs = this;
  }
}

const renderPage = (onReset = vi.fn()) =>
  render(
    <JobStatusProvider>
      <JobPage onReset={onReset} />
    </JobStatusProvider>,
  );

const makeResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const wsProgressMessage = (status: string, progress: number) =>
  new MessageEvent("message", {
    data: JSON.stringify({ event: "job-progress", status, progress }),
  });

beforeEach(() => {
  latestWs = null;
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("idle state", () => {
  it("shows the heading and both launch buttons", () => {
    renderPage();
    expect(screen.getByText("Run the job")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Process via WebSocket/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Process via HTTP/ })).toBeInTheDocument();
  });
});

describe("WebSocket flow", () => {
  it("shows queued state immediately after clicking WebSocket", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));

    expect(screen.getByRole("status", { name: "Queued" })).toBeInTheDocument();
  });

  it("sends proceed-job once the socket opens", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
    });

    expect(latestWs!.send).toHaveBeenCalledWith(JSON.stringify({ event: "proceed-job", jobId: 1 }));
  });

  it("shows progress ring with correct value during processing", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
    });
    await act(() => {
      latestWs!.onmessage?.(wsProgressMessage("processing", 50));
    });

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Job progress" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("shows done screen when job completes", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
    });
    await act(() => {
      latestWs!.onmessage?.(wsProgressMessage("done", 100));
    });

    expect(screen.getByText("You're all set!")).toBeInTheDocument();
  });

  it("shows failed screen on WebSocket error event", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onerror?.(new Event("error"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows failed screen when server sends a WS error event", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
    });
    await act(() => {
      latestWs!.onmessage?.(
        new MessageEvent("message", {
          data: JSON.stringify({ event: "error", message: "Job not found" }),
        }),
      );
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("HTTP flow", () => {
  // Capture the setInterval callback so tests can fire the poll manually
  // without fake timers (which would freeze findByText's retry setTimeout).
  let pollCallback: (() => Promise<void>) | null = null;

  beforeEach(() => {
    pollCallback = null;
    vi.spyOn(globalThis, "setInterval").mockImplementationOnce((fn) => {
      pollCallback = fn as () => Promise<void>;
      return 1 as unknown as ReturnType<typeof setInterval>;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows processing state after both HTTP calls resolve", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeResponse({ id: 1 }, 201))
      .mockResolvedValueOnce(makeResponse({ id: 1, status: "processing", progress: 0 }, 202));

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via HTTP/ }));

    expect(await screen.findByText("Processing your plan...")).toBeInTheDocument();
  });

  it("shows done screen when a poll returns status done", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeResponse({ id: 1 }, 201))
      .mockResolvedValueOnce(makeResponse({ id: 1, status: "processing", progress: 0 }, 202))
      .mockResolvedValueOnce(makeResponse({ id: 1, status: "done", progress: 100 }, 200));

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via HTTP/ }));
    await screen.findByText("Processing your plan...");
    await act(async () => {
      await pollCallback?.();
    });

    expect(screen.getByText("You're all set!")).toBeInTheDocument();
  });

  it("shows failed screen when a poll returns status failed", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(makeResponse({ id: 1 }, 201))
      .mockResolvedValueOnce(makeResponse({ id: 1, status: "processing", progress: 0 }, 202))
      .mockResolvedValueOnce(makeResponse({ id: 1, status: "failed", progress: 0 }, 200));

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via HTTP/ }));
    await screen.findByText("Processing your plan...");
    await act(async () => {
      await pollCallback?.();
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("beforeunload guard", () => {
  const fireBeforeUnload = () => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event;
  };

  it("prevents tab close while job is queued", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));

    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("prevents tab close while job is processing", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
      latestWs!.onmessage?.(wsProgressMessage("processing", 50));
    });

    expect(fireBeforeUnload().defaultPrevented).toBe(true);
  });

  it("does not prevent tab close when idle", () => {
    renderPage();

    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });

  it("does not prevent tab close after job completes", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
      latestWs!.onmessage?.(wsProgressMessage("done", 100));
    });

    expect(fireBeforeUnload().defaultPrevented).toBe(false);
  });
});

describe("reset", () => {
  it("returns to idle and calls onReset after completing a job", async () => {
    vi.mocked(fetch).mockResolvedValue(makeResponse({ id: 1 }, 201));
    const onReset = vi.fn();
    const user = userEvent.setup();
    renderPage(onReset);

    await user.click(screen.getByRole("button", { name: /Process via WebSocket/ }));
    await waitFor(() => expect(latestWs).not.toBeNull());
    await act(() => {
      latestWs!.onopen?.(new Event("open"));
    });
    await act(() => {
      latestWs!.onmessage?.(wsProgressMessage("done", 100));
    });

    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Process via WebSocket/ })).toBeInTheDocument();
  });
});
