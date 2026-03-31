import axiosInstance from "@/shared/lib/axiosInstance";
import { Client } from "@/features/clients/types/client";

export async function fetchClients(): Promise<Client[]> {
  const response = await axiosInstance.get("/clients");
  return response.data;
}

export async function createClient(data: {
  clientName: string;
  phoneNumber: string;
}) {
  const response = await axiosInstance.post("/clients", data);
  return response.data;
}

export async function updateClient(
  id: string,
  data: {
    clientName?: string;
    phoneNumber?: string;
  },
) {
  const response = await axiosInstance.patch(`/clients/${id}`, data);
  return response.data;
}

export async function deleteClient(id: string) {
  const response = await axiosInstance.delete(`/clients/${id}`);
  return response.data;
}
