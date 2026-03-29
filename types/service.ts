export type ServiceProps = {
  id: string;
  serviceName: string;
  description: string;
  price: number;
  currency: string;
  textColor: string;
  backgroundColor: string;
};

export type ServiceActionsProps = {
  service: ServiceProps;
};

export type UpdateServiceDialogProps = {
  service: ServiceProps;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
