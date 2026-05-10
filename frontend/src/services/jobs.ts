const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const REQUEST_TIMEOUT_MS = 10000;

const service = {
  createJob: () => makeRequest(`${API_URL}/jobs`, { method: "POST" }),
  proceedJob: (jobId: number) => makeRequest(`${API_URL}/jobs/${jobId}`, { method: "POST" }),
  getJobById: (jobId: number) => makeRequest(`${API_URL}/jobs/${jobId}`),
};

export default service;

const makeRequest = async (url: string, init?: RequestInit, attempts = 3): Promise<Response> => {
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.status >= 500) throw new Error(`Server error: ${response.status}`);
      return response;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error("Unreachable");
};
