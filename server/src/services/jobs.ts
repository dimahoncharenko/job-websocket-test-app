import { pool } from "@providers/db";

export type JobStatus = "queued" | "processing" | "done" | "failed";

export interface Job {
  id: number;
  status: JobStatus;
  progress: number;
  createdAt: Date;
}

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
};

export default service;
