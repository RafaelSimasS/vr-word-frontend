import axios from "axios";

const rawBase =
  typeof window === "undefined"
    ? (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_API_URL)
    : (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL);

const baseURL = (rawBase ?? "").replace(/\/+$/, "");

const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // envia cookies automaticamente em todas as requisições
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;
