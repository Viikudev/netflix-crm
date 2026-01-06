import axiosInstance from "@/lib/axiosInstance";
import { ActiveAccountProps } from "@/types/activeAccount";

export async function createActiveAccount(data: {
  email: string;
  password: string;
  expirationDate: string;
}) {
  const response = await axiosInstance.post("/active-account", data);
  return response.data;
}

export async function fetchActiveAccount(): Promise<ActiveAccountProps[]> {
  const response = await axiosInstance.get("/active-account");
  return response.data;
}

export async function updateActiveAccount(
  id: string,
  data: {
    email?: string;
    password?: string;
    expirationDate?: string;
  },
) {
  const response = await axiosInstance.patch(`/active-account/${id}`, data);
  return response.data;
}

export async function deleteActiveAccount(id: string) {
  const response = await axiosInstance.delete(`/active-account/${id}`);
  return response.data;
}
