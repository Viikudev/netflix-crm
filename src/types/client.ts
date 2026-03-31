export type Client = {
  id: string;
  clientName: string;
  phoneNumber: string;
  subscriptionCount: number;
  createdAt: string;
  updatedAt: string;
};

export interface ClientActionsProps {
  client: Client;
}

export type UpdateClientDialogProps = {
  client: Client;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
