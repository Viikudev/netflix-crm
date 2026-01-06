export type ClientStatus = {
  id: string;
  clientName: string;
  phoneNumber: string;
  activeAccountId: string;
  activeAccount?: { id: string; email: string } | null;
  serviceId: string;
  service?: { id: string; serviceName: string } | null;
  profileName: string;
  profilePIN: number;
  expirationDate?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};
