const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const REQUEST_TIMEOUT_MS = 10000;

const service = {
  createJob: () => makeRequest(`${API_URL}/jobs`, { method: "POST" }),
  proceedJob: (jobId: number) => makeRequest(`${API_URL}/jobs/${jobId}`, { method: "POST" }),
  getJobById: (jobId: number) => makeRequest(`${API_URL}/jobs/${jobId}`),
};

export default service;

const makeRequest = (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
};
