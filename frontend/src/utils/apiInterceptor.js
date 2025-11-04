import axios from "axios";

// Create a custom axios instance
export const apiClient = axios.create();

// Function to dispatch API log events
const logApiCall = (logData) => {
  const event = new CustomEvent("apiLog", { detail: logData });
  window.dispatchEvent(event);
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Store request start time
    config.metadata = { startTime: new Date() };

    // Automatically add auth token to requests if available
    const token = localStorage.getItem("token");
    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If content is FormData, ensure proper content type is not set
    // Let the browser set it automatically with the boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request if dev mode is enabled
    if (localStorage.getItem("devMode") === "true") {
      console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;

    // Create log entry
    const logEntry = {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration,
      timestamp: new Date().toISOString(),
      requestData: response.config.data instanceof FormData 
        ? 'FormData content'
        : response.config.data
          ? JSON.parse(response.config.data)
          : null,
      responseData: response.data,
      headers: response.config.headers,
    };

    // Dispatch event for DevTools
    logApiCall(logEntry);

    // Console log if dev mode is enabled
    if (localStorage.getItem("devMode") === "true") {
      console.log(
        "📥 API Response:",
        response.status,
        response.config.url,
        `(${duration}ms)`
      );
      console.log("Response Data:", response.data);
    }

    return response;
  },
  (error) => {
    const duration = error.config?.metadata
      ? new Date() - error.config.metadata.startTime
      : 0;

    // Create error log entry
    const logEntry = {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status || 0,
      duration,
      timestamp: new Date().toISOString(),
      requestData: error.config?.data instanceof FormData 
        ? 'FormData content'
        : error.config?.data 
          ? JSON.parse(error.config.data)
          : null,
      responseData: error.response?.data,
      error: error.response?.data || error.message,
      headers: error.config?.headers,
    };

    // Dispatch event for DevTools
    logApiCall(logEntry);

    // Console log if dev mode is enabled
    if (localStorage.getItem("devMode") === "true") {
      console.error("⚠️ API Error:", error.response?.status, error.config?.url);
      console.error("Error Data:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
