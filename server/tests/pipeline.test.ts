import { describe, expect, it, vi } from "vitest";

import processJob from "@workers/process-job";
import type { Step } from "@workers/process-job/steps";

const step =
  (message: string): Step =>
  async () => ({ done: true, data: { message } });
const failingStep = (): Step => async () => {
  throw new Error("step failed");
};

describe("processJob", () => {
  it("calls onStep for each step in order", async () => {
    const steps = [step("a"), step("b"), step("c")];
    const onStep = vi.fn();

    await processJob(1, steps, onStep);

    expect(onStep).toHaveBeenCalledTimes(3);
    expect(onStep).toHaveBeenNthCalledWith(1, 1, 3, { message: "a" });
    expect(onStep).toHaveBeenNthCalledWith(2, 2, 3, { message: "b" });
    expect(onStep).toHaveBeenNthCalledWith(3, 3, 3, { message: "c" });
  });

  it("calls onError and stops pipeline on step failure", async () => {
    const steps = [step("a"), failingStep(), step("c")];
    const onStep = vi.fn();
    const onError = vi.fn();

    await processJob(1, steps, onStep, onError);

    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(new Error("step failed"));
  });

  it("does not call onError when no steps fail", async () => {
    const onError = vi.fn();

    await processJob(1, [step("a"), step("b")], vi.fn(), onError);

    expect(onError).not.toHaveBeenCalled();
  });

  it("stops after abort — skips onStep for the step that triggered abort", async () => {
    const controller = new AbortController();
    const steps: Step[] = [
      step("a"),
      async () => {
        controller.abort();
        return { done: true, data: { message: "b" } };
      },
      step("c"),
    ];
    const onStep = vi.fn();

    await processJob(1, steps, onStep, undefined, controller.signal);

    // step "a" calls onStep; step "b" aborts after resolving — onStep skipped; step "c" never runs
    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith(1, 3, { message: "a" });
  });

  it("stops before a step when already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const onStep = vi.fn();

    await processJob(1, [step("a"), step("b")], onStep, undefined, controller.signal);

    expect(onStep).not.toHaveBeenCalled();
  });
});
