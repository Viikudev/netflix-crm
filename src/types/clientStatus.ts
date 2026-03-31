export type ClientStatus = {
  id: string;
  clientName: string;
  phoneNumber: string;
  clientId: string;
  client?: {
    id: string;
    clientName: string;
    phoneNumber: string;
  } | null;
  activeAccountId: string;
  activeAccount?: { id: string; email: string } | null;
  serviceId: string;
  service?: {
    id: string;
    serviceName: string;
    textColor?: string | null;
    backgroundColor?: string | null;
  } | null;
  screenId: string;
  screen?: { id: string; profileName: string; profilePIN: number } | null;
  expirationDate?: string | null;
  amount?: number | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface ClientStatusActionsProps {
  clientStatus: ClientStatus;
}

export type ClientStatusMessageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  phoneNumber: string;
};

export interface ClientStatusRenewDialogProps {
  clientStatus: ClientStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type UpdateClientStatusDialogProps = {
  clientStatus: ClientStatus;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
