export type ActiveAccountProps = {
  id: string;
  email: string;
  password: string;
  expirationDate: Date;
  screens?: { id: string; profileName: string; profilePIN: number }[];
};
