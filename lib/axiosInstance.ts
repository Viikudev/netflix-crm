import axios from "axios";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
