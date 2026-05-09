const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const service = {
  createJob: () => fetch(`${API_URL}/jobs`, { method: "POST" }),
  proceedJob: (jobId: number) => fetch(`${API_URL}/jobs/${jobId}`, { method: "POST" }),
  getJobById: (jobId: number) => fetch(`${API_URL}/jobs/${jobId}`),
};

export default service;
