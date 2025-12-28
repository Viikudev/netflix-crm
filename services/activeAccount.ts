import axiosInstance from "@/lib/axiosInstance";

export async function createActiveAccount(data: {
  email: string;
  password: string;
  expirationDate: string;
}) {
  const response = await axiosInstance.post("/active-account", data);
  return response.data;
}

export async function fetchActiveAccount() {
  const response = await axiosInstance.get("/active-account");
  return response.data;
}
