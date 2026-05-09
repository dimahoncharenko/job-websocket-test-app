import { pool } from "@providers/db";
import processJob from "@workers/process-job";
import steps, { StepResult } from "@workers/process-job/steps";

export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface Job {
  id: number;
  status: JobStatus;
  progress: number;
  createdAt: Date;
}

type StepNotification = {
  index: number;
  total: number;
  data: StepResult["data"];
  progress: number;
  status: JobStatus;
};

export type RunJobCallbacks = {
  onStep?: (notification: StepNotification) => void | Promise<void>;
  onError?: (err: Error) => void | Promise<void>;
  signal?: AbortSignal;
};

const service = {
  createJob: async () => {
    const { rows } = await pool.query<{
      id: number;
      status: JobStatus;
      progress: number;
      created_at: Date;
    }>("INSERT INTO jobs (status, progress) VALUES ('queued', 0) RETURNING *");
    return service.normalizeJob(rows[0]);
  },
  getJob: async (id: number) => {
    const { rows } = await pool.query<{
      id: number;
      status: JobStatus;
      progress: number;
      created_at: Date;
    }>("SELECT * FROM jobs WHERE id = $1", [id]);
    return rows[0] ? service.normalizeJob(rows[0]) : undefined;
  },
  updateJob: async (id: number, updates: Partial<Pick<Job, "status" | "progress">>) => {
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (updates.status !== undefined) {
      fields.push(`status = $${fields.length + 1}`);
      values.push(updates.status);
    }
    if (updates.progress !== undefined) {
      fields.push(`progress = $${fields.length + 1}`);
      values.push(updates.progress);
    }
    if (fields.length === 0) return service.getJob(id);

    values.push(id);
    const { rows } = await pool.query<{
      id: number;
      status: JobStatus;
      progress: number;
      created_at: Date;
    }>(`UPDATE jobs SET ${fields.join(", ")} WHERE id = $${values.length} RETURNING *`, values);
    return rows[0] ? service.normalizeJob(rows[0]) : undefined;
  },
  normalizeJob: (row: {
    id: number;
    status: JobStatus;
    progress: number;
    created_at: Date;
  }): Job => {
    return {
      id: row.id,
      status: row.status,
      progress: row.progress,
      createdAt: row.created_at,
    };
  },
  runJob: async (jobId: number, callbacks: RunJobCallbacks = {}) => {
    await processJob(
      jobId,
      steps,
      async (index, total, data) => {
        const progress = total > 0 ? Math.round((index / total) * 100) : 0;
        const status: JobStatus = index === total ? "done" : "processing";
        await service.updateJob(jobId, { status, progress });
        await callbacks.onStep?.({ index, total, data, progress, status });
      },
      async (err) => {
        await service.updateJob(jobId, { status: "failed" });
        await callbacks.onError?.(err);
      },
      callbacks.signal,
    );
  },
};

export default service;
