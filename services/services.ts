import axiosInstance from "@/lib/axiosInstance";

export async function fetchServices() {
  const response = await axiosInstance.get("/services");
  return response.data;
}

export async function createService(data: {
  serviceName: string;
  description: string;
  price: number;
  currency: string;
}) {
  const response = await axiosInstance.post("/services", data);
  return response.data;
}
