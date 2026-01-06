import axiosInstance from "@/lib/axiosInstance";
import { ServiceProps } from "@/types/service";

export async function fetchServices(): Promise<ServiceProps[]> {
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

export async function updateService(
  id: string,
  data: {
    serviceName?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
  },
) {
  const response = await axiosInstance.patch(`/services/${id}`, data);
  return response.data;
}

export async function deleteService(id: string) {
  const response = await axiosInstance.delete(`/services/${id}`);
  return response.data;
}
