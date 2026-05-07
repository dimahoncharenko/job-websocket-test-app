import { Step, StepResult } from "./steps";

export type OnStepCallback = (
  index: number,
  total: number,
  data: StepResult["data"],
) => void | Promise<void>;

export type OnErrorCallback = (error: Error) => void | Promise<void>;

export default async (
  jobId: number,
  steps: Step[],
  onStep: OnStepCallback,
  onError?: OnErrorCallback,
  signal?: AbortSignal,
) => {
  for (let i = 0; i < steps.length; i++) {
    try {
      const result = await steps[i](jobId);
      if (signal?.aborted) return;
      if (result.done) await onStep(i + 1, steps.length, result.data);
    } catch (err) {
      return await onError?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }
};
