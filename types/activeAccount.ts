export type ActiveAccountProps = {
  id: string;
  email: string;
  password: string;
  serviceId?: string | null;
  service?: { id: string; serviceName: string } | null;
  expirationDate: Date;
  screens?: { id: string; profileName: string; profilePIN: number }[];
};
