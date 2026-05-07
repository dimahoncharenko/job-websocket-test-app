export interface StepResult {
  done: boolean;
  data: { message: string };
}

export type Step = (jobId: number) => Promise<StepResult>;

const makeStep =
  (message: string, delayMs: number): Step =>
  (_jobId) =>
    new Promise((resolve) => setTimeout(() => resolve({ done: true, data: { message } }), delayMs));

const makeFailedStep =
  (message: string, delayMs: number): Step =>
  (_jobId) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delayMs));

export default [
  makeStep("Spinning up the engines...", 800),
  makeStep("Data preprocessed!", 1200),
  makeStep("Running integrity checks...", 1000),
  // makeFailedStep("Ka-boom 💥", 500),
  makeStep("Crunching the numbers...", 10800),
  makeStep("Webhook notified!", 900),
  makeStep("Cleaning up the workspace...", 600),
  makeStep("Job finished!", 500),
] satisfies Step[];
