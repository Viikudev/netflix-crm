import axiosInstance from "@/shared/lib/axiosInstance";
import type { ScreenProps } from "@/features/streaming-services/types/screen";
import type {
  CreateScreenValues,
  UpdateScreenValues,
} from "@/features/streaming-services/schemas";

export async function fetchScreens(
  activeAccountId?: string,
): Promise<ScreenProps[]> {
  const url = activeAccountId
    ? `/screens?activeAccountId=${activeAccountId}`
    : "/screens";
  const { data } = await axiosInstance.get(url);
  return data;
}

export async function createScreen(
  payload: CreateScreenValues,
): Promise<ScreenProps> {
  const { data } = await axiosInstance.post("/screens", payload);
  return data;
}

export async function updateScreen(
  id: string,
  payload: UpdateScreenValues,
): Promise<ScreenProps> {
  const { data } = await axiosInstance.put(`/screens/${id}`, payload);
  return data;
}

export async function deleteScreen(id: string): Promise<void> {
  await axiosInstance.delete(`/screens/${id}`);
}
