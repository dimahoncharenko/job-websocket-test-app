import { Router } from "express";

import jobsService from "@services/jobs";

const router = Router();

router.post("/jobs", async (_, res) => {
  const job = await jobsService.createJob();
  res.status(201).json(job);
});

router.post("/jobs/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid job id" });
    return;
  }

  const job = await jobsService.getJob(id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if (job.status !== "queued") {
    res.status(409).json({ error: "Job is not queued" });
    return;
  }

  await jobsService.updateJob(id, { status: "processing" });

  // Fire and forget, the status will be polled from a client
  jobsService.runJob(id);

  res.status(202).json({ ...job, status: "processing", progress: 0 });
});

router.get("/jobs/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Invalid job id" });
    return;
  }

  const job = await jobsService.getJob(id);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

export default router;
