import axiosInstance from "@/lib/axiosInstance";

export type CreateClientStatusPayload = {
  clientName: string;
  phoneNumber: string;
  activeAccountId: string;
  serviceId: string;
  profileName: string;
  profilePIN: number;
  status: "ACTIVE" | "EXPIRED" | "NEAR_EXPIRATION";
  expirationDate?: string | null;
};

export async function createClientStatus(data: CreateClientStatusPayload) {
  const response = await axiosInstance.post("/client-status", data);
  return response.data;
}

export async function fetchClientStatuses() {
  const response = await axiosInstance.get("/client-status");
  return response.data;
}

export async function updateClientStatus(
  id: string,
  data: Partial<CreateClientStatusPayload>,
) {
  const response = await axiosInstance.patch(`/client-status/${id}`, data);
  return response.data;
}

export async function deleteClientStatus(id: string) {
  const response = await axiosInstance.delete(`/client-status/${id}`);
  return response.data;
}
