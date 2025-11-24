import axios from "axios";

const rawBase =
  typeof window === "undefined"
    ? process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL
    : process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL;

const baseURL = (rawBase ?? "").replace(/\/+$/, "");

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {}
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (typeof window !== "undefined" && error?.response?.status === 401) {
        localStorage.removeItem("accessToken");

        window.location.href = "/signin";
      }
    } catch {}
    return Promise.reject(error);
  }
);

export default axiosClient;
