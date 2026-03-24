export type ActiveAccountProps = {
  id: string;
  email: string;
  password: string;
  serviceId?: string | null;
  service?: {
    id: string;
    serviceName: string;
    textColor?: string | null;
    backgroundColor?: string | null;
  } | null;
  expirationDate: Date;
  screens?: { id: string; profileName: string; profilePIN: number }[];
};
